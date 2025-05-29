// validation/v7/chat.js
const Joi = require("joi");
const language = require("../language");

const startChatSchema = (lang = "en") =>
  Joi.object({
    userId: Joi.number().integer().required().messages({
      "number.base": language[lang].auth.invalid_user_id || "معرف المستخدم غير صحيح",
      "any.required": language[lang].auth.user_id_required || "معرف المستخدم مطلوب",
    }),
    subject: Joi.string().max(200).optional().messages({
      "string.max": language[lang].chat.subject_max || "الموضوع لا يمكن أن يتجاوز 200 حرف",
    }),
    priority: Joi.number().integer().min(1).max(3).default(1).messages({
      "number.min": language[lang].chat.priority_range || "الأولوية يجب أن تكون بين 1 و 3",
      "number.max": language[lang].chat.priority_range || "الأولوية يجب أن تكون بين 1 و 3",
    }),
  });

const sendMessageSchema = (lang = "en") =>
  Joi.object({
    userId: Joi.number().integer().required().messages({
      "number.base": language[lang].auth.invalid_user_id || "معرف المستخدم غير صحيح",
      "any.required": language[lang].auth.user_id_required || "معرف المستخدم مطلوب",
    }),
    conversation_id: Joi.number().integer().required().messages({
      "number.base": language[lang].chat.invalid_conversation_id || "معرف المحادثة غير صحيح",
      "any.required": language[lang].chat.conversation_id_required || "معرف المحادثة مطلوب",
    }),
    message: Joi.string().allow("").when("$file", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }).messages({
      "any.required": language[lang].chat.message_required || "الرسالة مطلوبة",
      "string.empty": language[lang].chat.message_empty || "الرسالة لا يمكن أن تكون فارغة",
    }),
  });

const getChatHistorySchema = (lang = "en") =>
  Joi.object({
    page: Joi.number().integer().min(1).default(1).messages({
      "number.min": language[lang].chat.page_min || "الصفحة يجب أن تكون 1 على الأقل",
    }),
    limit: Joi.number().integer().min(1).max(50).default(10).messages({
      "number.min": language[lang].chat.limit_min || "الحد يجب أن يكون 1 على الأقل",
      "number.max": language[lang].chat.limit_max || "الحد يجب ألا يتجاوز 50",
    }),
    userId: Joi.number().integer().required().messages({
      "any.required": language[lang].chat.user_id_required || "معرف المستخدم مطلوب",
      "number.base": language[lang].chat.user_id_invalid || "معرف المستخدم غير صالح",
    }),
  });

const assignAgentSchema = (lang = "en") =>
  Joi.object({
    conversation_id: Joi.number().integer().required().messages({
      "number.base": language[lang].chat.invalid_conversation_id || "معرف المحادثة غير صحيح",
      "any.required": language[lang].chat.conversation_id_required || "معرف المحادثة مطلوب",
    }),
    agent_id: Joi.string().required().messages({
      "string.base": language[lang].chat.invalid_agent_id || "معرف الوكيل غير صحيح",
      "any.required": language[lang].chat.agent_id_required || "معرف الوكيل مطلوب",
    }),
  });

const sendAgentMessageSchema = (lang = "en") =>
  Joi.object({
    conversation_id: Joi.number().integer().required().messages({
      "number.base": language[lang].chat.invalid_conversation_id || "معرف المحادثة غير صحيح",
      "any.required": language[lang].chat.conversation_id_required || "معرف المحادثة مطلوب",
    }),
    agent_id: Joi.string().required().messages({
      "string.base": language[lang].chat.invalid_agent_id || "معرف الوكيل غير صحيح",
      "any.required": language[lang].chat.agent_id_required || "معرف الوكيل مطلوب",
    }),
    message: Joi.string().allow("").when("$file", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }).messages({
      "any.required": language[lang].chat.message_required || "الرسالة مطلوبة",
      "string.empty": language[lang].chat.message_empty || "الرسالة لا يمكن أن تكون فارغة",
    }),
  });

const updateAgentStatusSchema = (lang = "en") =>
  Joi.object({
    agent_id: Joi.string().required().messages({
      "string.base": language[lang].chat.invalid_agent_id || "معرف الوكيل غير صحيح",
      "any.required": language[lang].chat.agent_id_required || "معرف الوكيل مطلوب",
    }),
    is_available: Joi.boolean().required().messages({
      "boolean.base": language[lang].chat.invalid_availability || "حالة التوفر غير صحيحة",
      "any.required": language[lang].chat.availability_required || "حالة التوفر مطلوبة",
    }),
  });

module.exports = {
  startChatSchema,
  sendMessageSchema,
  getChatHistorySchema,
  assignAgentSchema,
  sendAgentMessageSchema,
  updateAgentStatusSchema,
};