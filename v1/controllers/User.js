const _ = require("lodash");
const Model = require("../../models");
const Validation = require("../validations");
const constants = require("../../common/constants");
const Auth = require("../../common/authenticate");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const moment = require('moment');
const fs = require("fs");


module.exports.verifyUser = async (req, res, next) => {
  try {
    if (req.params.token) {
      const checkUser = await Model.UserModel.findOne({
        accessToken: req.params.token,
        userType: constants.USER_TYPE.USER,
        isDeleted: false,
      })
      if (checkUser == null) {
        throw new Error("The URL is expire, Please contact to admin.");
      }
      checkUser.accessToken = await Auth.getToken({
          _id: checkUser._id
        }),
        checkUser.isEmailVerify = true
      await checkUser.save();
      return res.success("Please onboard", checkUser);
    } else {
      throw new Error("Invalid URL");
    }
  } catch (error) {
    next(error);
  }
};

module.exports.setPassword = async (req, res, next) => {
  try {
    await Validation.User.setPassword.validateAsync(req.body);
    let doc = await Model.UserModel.findOne({
      _id: req.user._id,
      isDeleted: false,
    });
    if (!doc) throw new Error("ACCOUNT_NOT_FOUND");
    await doc.setPassword(req.body.password);
    await doc.save();

    return res.success("New Password Set");
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    await Validation.User.login.validateAsync(req.body);
    const criteria = {
      isDeleted: false
    }
    if (req.body.email) {
      criteria.email = req.body.email.toLowerCase()
    }
    let doc = await Model.UserModel.findOne(criteria)
    if (!doc) throw new Error("INVALID_CREDENTIALS");
    await doc.authenticate(req.body.password);

    if (req.body.email && !doc.isEmailVerify) {
      return res.error(403, "ACCOUNT_NOT_VERIFIED");
    }
    if (doc.isBlocked) {
      return res.error(403, "ACCOUNT_BLOCKED");
    }
    doc.accessToken = await Auth.getToken({
      _id: doc._id
    });
    await doc.save();
    return res.success("ACCOUNT_LOGIN_SUCCESSFULLY", doc);
  } catch (error) {
    next(error);
  }
};

module.exports.logout = async (req, res, next) => {
  try {
    await Model.UserModel.updateOne({
      _id: req.user._id,
      userType: constants.USER_TYPE.USER
    }, {
      accessToken: ""
    });

    return res.success("ACCOUNT_LOGOUT_SUCCESSFULLY");
  } catch (error) {
    next(error);
  }
};

module.exports.getProfile = async (req, res, next) => {
  try {
    const doc = await Model.UserModel.findOne({
      _id: req.user._id
    });
    return res.success("DATA_FETCHED", doc);
  } catch (error) {
    next(error);
  }
};

module.exports.getAllImage = async (req, res, next) => {
  try {
    let criteria = {
      userId: req.user._id
    }
    let skip = parseInt(req.query.page - 1) || 0;
    let limit = parseInt(req.query.limit) || 10;
    skip = skip * limit;
    let sort = {
      createdAt: -1
    }
    if (req.query.sort && parseInt(req.query.order) != 0) {
      let sortKey = req.query.sort
      sort = {
        [sortKey]: parseInt(req.query.order)
      }
    }
    if(req.query.filter){
      req.query.filter = req.query.filter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      criteria.name = {
        $regex : req.query.filter,
        $options: 'i'
      }
    }
    const doc = await Model.ImageModel.find(criteria).limit(limit).skip(skip).sort(sort);
    const count = await Model.ImageModel.countDocuments(criteria)
    return res.success("DATA_FETCHED", {doc, count});
  } catch (error) {
    next(error);
  }
};

module.exports.getImageById = async (req, res, next) => {
  try {
    let criteria = {
      userId: req.user._id,
      _id: ObjectId(req.query.imageId)
    }
    if (!req.query.imageId) {
      throw new Error("Please provide image Id");
    }
    const doc = await Model.ImageModel.findOne(criteria);
    return res.success("DATA_FETCHED", doc);
  } catch (error) {
    next(error);
  }
};

module.exports.deleteImageById = async (req, res, next) => {
  try {
    let criteria = {
      userId: req.user._id,
      _id: ObjectId(req.query.imageId)
    }
    if (!req.query.imageId) {
      throw new Error("Please provide image Id");
    }
    const doc = await Model.ImageModel.findOne(criteria);
    await Model.ImageModel.deleteOne(criteria);
    return res.success("DATA_FETCHED", doc);
  } catch (error) {
    next(error);
  }
};