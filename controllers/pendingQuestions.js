const {
  PendingQuestionsModel,
  QuestionsModel,
  QuestionsLocalesModel,
} = require("../models/index.js");
const { Op } = require("sequelize");
const language = require("../language/index");
const { sendAnswerEmail } = require("../services/email/emailService");

let data = {};

data.getAllPendingQuestions = async (req, res) => {
  try {
    const { search = "", page = 1, limit = 10 } = req.query;
    const lang = req.headers.lang || "en";
    const offset = page > 0 ? (page - 1) * limit : 0;

    const where = search
      ? {
          [Op.or]: [
            { questionEn: { [Op.like]: `%${search}%` } },
            { questionAr: { [Op.like]: `%${search}%` } },
            { userEmail: { [Op.like]: `%${search}%` } },
          ],
        }
      : {};

    const { count, rows } = await PendingQuestionsModel.findAndCountAll({
      where,
      offset: parseInt(offset),
      limit: parseInt(limit),
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      ack: 1,
      data: rows,
      total: count,
      pages: Math.ceil(count / limit),
    });
  } catch (e) {
    console.error("Error in getAllPendingQuestions:", e);
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].questions.error,
    });
  }
};

data.getPendingQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const lang = req.headers.lang || "en";

    const pendingQuestion = await PendingQuestionsModel.findByPk(id);
    if (!pendingQuestion) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].questions.pending_question_not_found,
      });
    }

    res.status(200).json({
      ack: 1,
      data: pendingQuestion,
    });
  } catch (e) {
    console.error("Error in getPendingQuestion:", e);
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].questions.error,
    });
  }
};

data.answerPendingQuestion = async (req, res) => {
  try {
    const {
      id,
      answer,
      answer_arabic,
      keywords_en,
      keywords_ar,
      question,
      question_arabic,
    } = req.body;
    const lang = req.headers.lang || "en";

    const pendingQuestion = await PendingQuestionsModel.findByPk(id);
    if (!pendingQuestion) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].questions.pending_question_not_found,
      });
    }
    console.log(pendingQuestion);
    await QuestionsModel.create(
      {
        keywords_en: keywords_en || "",
        keywords_ar: keywords_ar || "",
        locales: [
          { locale: "en", question: question, answer },
          {
            locale: "ar",
            question: question_arabic,
            answer: answer_arabic,
          },
        ],
      },
      {
        include: [{ model: QuestionsLocalesModel, as: "locales" }],
      }
    );

    try {
      await sendAnswerEmail({
        to: pendingQuestion.userEmail,
        question:
          pendingQuestion.originalLang === "en" ? question : question_arabic,
        answer: pendingQuestion.originalLang === "en" ? answer : answer_arabic,
        lang: pendingQuestion.originalLang,
      });
    } catch (emailError) {
      console.warn(
        "Failed to send email to",
        pendingQuestion.userEmail,
        emailError
      );
    }

    await pendingQuestion.destroy();

    res.status(200).json({
      ack: 1,
      msg: language[lang].questions.question_added,
    });
  } catch (e) {
    console.error("Error in answerPendingQuestion:", e);
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].questions.error,
    });
  }
};

data.deletePendingQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const lang = req.headers.lang || "en";

    const pendingQuestion = await PendingQuestionsModel.findByPk(id);
    if (!pendingQuestion) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].questions.pending_question_not_found,
      });
    }

    await pendingQuestion.destroy();

    res.status(200).json({
      ack: 1,
      msg: language[lang].questions.question_deleted,
    });
  } catch (e) {
    console.error("Error in deletePendingQuestion:", e);
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].questions.error,
    });
  }
};

module.exports = data;
