const Joi = require("joi").defaults((schema) => {
    switch (schema.type) {
        case "string":
            return schema.replace(/\s+/, " ");
        default:
            return schema;
    }
});

Joi.objectId = () => Joi.string().pattern(/^[0-9a-f]{24}$/, "valid ObjectId");

module.exports.identify = Joi.object({
    id: Joi.objectId().required(),
});

module.exports.setPassword = Joi.object({
    password: Joi.string().required()
})

module.exports.login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})
