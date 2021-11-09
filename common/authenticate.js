const jwt = require("jsonwebtoken");
const constants = require('./constants')
const Model = require("../models");

module.exports.getToken = (data) =>
  jwt.sign(data, process.env.SECRET_KEY, {
    expiresIn: "30 days"
  });

module.exports.verifyToken = (token) =>
  jwt.verify(token, process.env.SECRET_KEY);

module.exports.verify = (...args) => async (req, res, next) => {
  try {
    const roles = [].concat(args).map((role) => role.toLowerCase());
    const token = String(req.headers.authorization || "")
      .replace(/bearer|jwt/i, "")
      .replace(/^\s+|\s+$/g, "");
    let decoded;
    if (token) decoded = this.verifyToken(token);
    let doc = null;
    let role = "";
    if (!decoded && roles.includes("guest")) {
      role = "guest";
      return next();
    }
    if (decoded != null && roles.includes("user")) {
      role = "user";
      doc = await Model.UserModel.findOne({
        _id: decoded._id,
        userType : constants.USER_TYPE.USER,
        accessToken: token,
        isBlocked: false,
        isDeleted: false,
      });
    }
    if (decoded != null && roles.includes("admin")) {
      role = "admin";
      doc = await Model.UserModel.findOne({
        _id: decoded._id,
        userType : constants.USER_TYPE.ADMIN,
        accessToken: token,
        isBlocked: false,
        isDeleted: false,
      });
    }
    if (!doc) {
      return res.send({
        "statusCode": 401,
        "message": "Invalid Token",
        "data": {},
        "status": 0,
        "isSessionExpired": true
      })
    };
    if (role) req[role] = doc.toJSON();
    next();
  } catch (error) {
    console.error(error);
    const message =
      String(error.name).toLowerCase() === "error" ?
      error.message :
      "UNAUTHORIZED_ACCESS";
    return res.error(401, message);
  }
};