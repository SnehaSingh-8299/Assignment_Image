const mongoose = require("mongoose");
global.ObjectId = mongoose.Types.ObjectId;

module.exports.mongodb = async () => {
    await mongoose.connect(
        process.env.MONGODB_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        },
        (error, result) => {
            error ? console.error("Mongo", error) : console.log("Mongo Connected");
        }
    );
};