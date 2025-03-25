const Joi = require('joi');
const BlogSchema = Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
});

module.exports = { BlogSchema }