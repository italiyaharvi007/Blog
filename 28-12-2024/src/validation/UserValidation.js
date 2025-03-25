const Joi = require('joi');
const userSignupSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp("^[a-zA-Z0-9@]{3,30}$")),
});

module.exports = { userSignupSchema }