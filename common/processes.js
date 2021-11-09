const Services = require("../services/EmalService");

module.exports.init = async () => {
    console.log("Process Initialized");

    process.on("sendEmail", async (args) => {
        await Services.send(args);
    });
};
