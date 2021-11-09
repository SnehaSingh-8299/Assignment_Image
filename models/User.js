const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const constants = require('../common/constants')
const ObjectId = mongoose.Types.ObjectId;
const DocSchema = new Schema({
    name: {
        type: String,
        default: ""
    },
    email : {
        type: String,
        default : ""
    },
    password:{
        type: String
    },
    isEmailVerify: {
        type: Boolean,
        default: false
    },
    address : {
        type: String
    },
    userType : {
        type : Number,
        enum : [constants.USER_TYPE.ADMIN, constants.USER_TYPE.USER]
    },
    isBlocked: {
      type: Boolean,
      default: false
    },
    accessToken: {
      type: String,
      default: "",
      index: true
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
}, {
    timestamps: true
});

DocSchema.set("toJSON", {
    getters: true,
    virtuals: true
});

DocSchema.methods.authenticate = function (password, callback) {
    const promise = new Promise((resolve, reject) => {
        if (!password) reject(new Error("MISSING_PASSWORD"));

        bcrypt.compare(password, this.password, (error, result) => {
            if (!result) reject(new Error("Invalid credential"));
            resolve(this);
        });
    });

    if (typeof callback !== "function") return promise;
    promise.then((result) => callback(null, result)).catch((err) => callback(err));
};

DocSchema.methods.setPassword = function (password, callback) {
    console.log("inin");
    const promise = new Promise((resolve, reject) => {
        if (!password) reject(new Error("Missing Password"));

        bcrypt.hash(password, 10, (err, hash) => {
            if (err) reject(err);
            this.password = hash;
            resolve(this);
        });
    });

    if (typeof callback !== "function") return promise;
    promise.then((result) => callback(null, result)).catch((err) => callback(err));
};

module.exports = mongoose.model("Users", DocSchema);