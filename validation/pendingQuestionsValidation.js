const Joi = require("joi");
const language = require("../language");

const getPendingQuestionsSchema = (lang = "en") =>
  Joi.object({
    search: Joi.string().allow("").default("").messages({
      "string.base": language[lang].questions.questions.invalid_search,
    }),
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": language[lang].questions.questions.page_min,
    }),
    limit: Joi.number().integer().min(1).max(100).default(10).messages({
      "number.min": language[lang].questions.questions.limit_min,
      "number.max": language[lang].questions.questions.limit_max,
    }),
  });

const answerPendingQuestionSchema = (lang = "en") =>
  Joi.object({
    id: Joi.number().integer().required().messages({
      "number.base": language[lang].questions.questions.id_invalid,
      "number.integer": language[lang].questions.questions.id_invalid,
      "any.required": language[lang].questions.questions.id_required,
    }),
    question: Joi.string().required().messages({
      "string.base": language[lang].questions.questions.question_invalid,
      "any.required": language[lang].questions.questions.question_required,
    }),
    question_arabic: Joi.string().required().messages({
      "string.base": language[lang].questions.questions.question_arabic_invalid,
      "any.required":
        language[lang].questions.questions.question_arabic_required,
    }),
    answer: Joi.string().required().messages({
      "string.base": language[lang].questions.questions.answer_invalid,
      "any.required": language[lang].questions.questions.answer_required,
    }),
    answer_arabic: Joi.string().required().messages({
      "string.base": language[lang].questions.questions.answer_arabic_invalid,
      "any.required": language[lang].questions.questions.answer_arabic_required,
    }),
    keywords_en: Joi.string().allow("").optional().messages({
      "string.base": language[lang].questions.questions.keywords_en_invalid,
    }),
    keywords_ar: Joi.string().allow("").optional().messages({
      "string.base": language[lang].questions.questions.keywords_ar_invalid,
    }),
  });

const deletePendingQuestionSchema = (lang = "en") =>
  Joi.object({
    id: Joi.number().integer().required().messages({
      "number.base": language[lang].questions.questions.id_invalid,
      "any.required": language[lang].questions.questions.id_required,
    }),
  });

module.exports = {
  getPendingQuestionsSchema,
  answerPendingQuestionSchema,
  deletePendingQuestionSchema,
};
