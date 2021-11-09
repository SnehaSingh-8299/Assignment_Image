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

module.exports.register = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    userType : Joi.number().valid(1).required()
})

module.exports.login = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
})

module.exports.createUser = Joi.object({
    email: Joi.string().email().required(),
    userType : Joi.number().valid(2).required()
})

