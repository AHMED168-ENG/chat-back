const Joi = require("joi");
const language = require("../language");

const askQuestionSchema = (lang = "en") =>
  Joi.object({
    question: Joi.string().required().messages({
      "string.base": language[lang].questions.chatgpt.question_invalid,
      "any.required": language[lang].questions.chatgpt.question_required,
    }),
    userEmail: Joi.string()
      .email()
      .required()
      .messages({
        "string.email":
          language[lang].questions.chatgpt.invalid_email || "Invalid email",
        "any.required":
          language[lang].questions.chatgpt.email_required ||
          "Email is required",
      }),
  });

module.exports = { askQuestionSchema };
