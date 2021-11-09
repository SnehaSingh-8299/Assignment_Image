const router = require("express").Router();

const Auth = require("../../common/authenticate");
const Controller = require("../controllers");

//  ONBOARDING API'S
router.post("/register", Controller.Admin.register); // Only first time use this api to register the admin
router.post("/login", Controller.Admin.login);
router.post("/logout", Auth.verify("Admin"), Controller.Admin.logout);
router.get("/getProfile",Auth.verify("Admin"), Controller.Admin.getProfile);
router.post("/createUser",Auth.verify("Admin"), Controller.Admin.createUser);

module.exports = router;
