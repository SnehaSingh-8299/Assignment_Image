const Model = require("../../models");
const Validation = require("../validations");
const constants = require("../../common/constants");
const mongoose = require("mongoose");
const Auth = require("../../common/authenticate");
const ObjectId = mongoose.Types.ObjectId;


module.exports.register = async (req, res, next) => {
  try {
    await Validation.Admin.register.validateAsync(req.body);
    if (req.body.email) {
      req.body.email = req.body.email.toLowerCase();
      const checkEmail = await Model.UserModel.findOne({
        email: req.body.email,
        userType : constants.USER_TYPE.ADMIN,
        isDeleted: false,
      }).lean();
      if (checkEmail) {
        if (checkEmail.isEmailVerified) {
          throw new Error("We already have that Email. Try logging in instead.");
        }
      }
    }
    const doc = await Model.UserModel.create(req.body);
    doc.accessToken = await Auth.getToken({
      _id: doc._id
    });
    if(req.body.userType == 1){
      doc.isEmailVerify = true
    }
    await doc.setPassword(req.body.password);
    await doc.save();
    return res.success("ACCOUNT_CREATED_SUCCESSFULLY", doc);
  } catch (error) {
    next(error);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    await Validation.Admin.login.validateAsync(req.body);
    const criteria = {
      isDeleted : false
    };
    if (req.body.email) {
      criteria.email = req.body.email.toLowerCase();
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
      _id: req.admin._id,
      userType : constants.USER_TYPE.ADMIN
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
      _id: req.admin._id
    });
    return res.success("DATA_FETCHED", doc);
  } catch (error) {
    next(error);
  }
};

module.exports.createUser = async (req, res, next) => {
  try {
    await Validation.Admin.createUser.validateAsync(req.body);
    let doc = await Model.UserModel.findOne({
        email: req.body.email,
        isDeleted: false,
    });
    if(doc){
      throw new Error("We already have that Email.");
    }
    req.body.email = req.body.email.toLowerCase();
    doc = await Model.UserModel.create(req.body);
    doc.accessToken = await Auth.getToken({
      _id: doc._id
    });
    const _sendRegisterUserEmail = async (doc, email) => {
      try {
        if (!doc) throw new Error("Document Missing");
        if (!email) throw new Error("Email Missing");
        await doc.save();
        if (doc) {
          process.emit("sendEmail", {
            to: email,
            title: "Account Register Link",
            message: `Please, use this url to register your account - <b>${process.env.BASE_URL}/verifyUser/${doc.accessToken}</b>`,
          });
        }
      } catch (error) {
        console.error("_sendRegisterUserEmail", error);
      }
    };
    if (req.body.email) await _sendRegisterUserEmail(doc, req.body.email);

    return res.success("New User Registered Successfully", doc);
  } catch (error) {
    next(error);
  }
};