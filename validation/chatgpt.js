const Joi = require("joi");
const language = require("../language");

const askQuestionSchema = (lang = "en") =>
  Joi.object({
    question: Joi.string().required().messages({
      "string.base": language[lang].questions.chatgpt.question_invalid,
      "any.required": language[lang].questions.chatgpt.question_required,
    }),
  });

module.exports = { askQuestionSchema };
