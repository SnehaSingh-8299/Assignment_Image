const router = require("express").Router();
const Model = require('../../models/index')
const Auth = require("../../common/authenticate");
const Controller = require("../controllers");
const multer = require("multer");
const sharp = require("sharp");
const { ObjectId } = require("bson");
var upload = multer({
    dest: 'public/uploads/user'
})

//  ONBOARDING API'S
router.get("/verifyUser/:token", Controller.User.verifyUser);
router.post("/setPassword", Auth.verify("User"), Controller.User.setPassword);
router.post("/login", Controller.User.login);
router.post("/logout", Auth.verify("User"), Controller.User.logout);
router.get("/getProfile", Auth.verify("User"), Controller.User.getProfile);
router.post('/uploadFile', Auth.verify("User"), upload.single("file"), async (req, res) => {
    const filename = req.file.originalname.replace(/\..+$/, "");
    let midiumFilename = `Midium-${filename}-${Date.now()}.jpeg`;
    await sharp(req.file.path).jpeg({quality : 50}).toFile(`public/uploads/user/${midiumFilename}`)
    let smallFilename = `Small-${filename}-${Date.now()}.jpeg`;
    await sharp(req.file.path).jpeg({quality : 25}).toFile(`public/uploads/user/${smallFilename}`)
    let doc = await Model.ImageModel({
        userId: req.user._id,
        name : req.body.name,
        normalImage : `public/uploads/user/${req.file.originalname}`,
        mediumImage : `public/uploads/user/${midiumFilename}`,
        smallImage : `public/uploads/user/${smallFilename}`
    }).save();
    return res.success("Image uploaded successfully.", doc);
});

router.get("/getAllImage", Auth.verify("User"), Controller.User.getAllImage);
router.put("/updateImageById", Auth.verify("User"), upload.single("file"), async (req, res) => {
    let saveObj = req.body;
    if(req.file != null){
        const filename = req.file.originalname.replace(/\..+$/, "");
        let midiumFilename = `Midium-${filename}-${Date.now()}.jpeg`;
        await sharp(req.file.path).jpeg({quality : 50}).toFile(`public/uploads/user/${midiumFilename}`)
        let smallFilename = `Small-${filename}-${Date.now()}.jpeg`;
        await sharp(req.file.path).jpeg({quality : 25}).toFile(`public/uploads/user/${smallFilename}`)
        saveObj.normalImage = `public/uploads/user/${req.file.originalname}`,
        saveObj.mediumImage = `public/uploads/user/${midiumFilename}`,
        saveObj.smallImage = `public/uploads/user/${smallFilename}`
    }
    let doc = await Model.ImageModel.findOneAndUpdate({
        userId: req.user._id,
        _id: ObjectId(req.query.imageId)
    },{$set: saveObj},{new: true});
    return res.success("Image updated successfully.", doc);
});
router.get("/getImageById", Auth.verify("User"), Controller.User.getImageById);
router.delete("/deleteImageById", Auth.verify("User"), Controller.User.deleteImageById);

module.exports = router;