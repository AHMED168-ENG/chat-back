const Joi = require('joi');
const language = require("../language");

const signupSchema = (lang = 'en') =>
  Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': language[lang].auth.invalid_email,
      'any.required': language[lang].auth.email_required,
    }),
    password: Joi.string().min(8).required().messages({
      'string.min': language[lang].auth.password_min,
      'any.required': language[lang].auth.password_required,
    }),
    account_type: Joi.string().valid('company', 'crm').required().messages({
      'any.only': language[lang].auth.account_type_invalid,
      'any.required': language[lang].auth.account_type_required,
    }),
  });

  const signinSchema = (lang) =>
    Joi.object({
      email: Joi.string().email().required().messages({
        'string.email': language[lang].auth.invalid_email,
        'any.required': language[lang].auth.email_required,
      }),
      password: Joi.string().required().messages({
        'any.required': language[lang].auth.password_required,
      }),
    });
  

module.exports = { signupSchema, signinSchema };