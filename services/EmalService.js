const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('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');
const fromMail = "Snehasingh6664@gmail.com"

exports.send = async (payload) => {
    try {
        console.log(payload,"paylo")
        const msg = {
            to: payload.to,
            from: fromMail,
            subject: payload.title,
            html: payload.message
        };
        try {
        const result = await sgMail.send(msg);
        console.log(result, "result");
        } catch (error) {
            console.log(error, "resulterror");
        }
        return result
    } catch (error) {
        return error;
    }
}