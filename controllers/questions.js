require("dotenv").config();
const { Op } = require("sequelize");
const sequelize = require("../config/sequelizeDb");
const { QuestionsModel, QuestionsLocalesModel } = require("../models/index.js");

const XLSX = require("xlsx");
const fs = require("fs");
const language = require("../language/index");

// Define associations with explicit alias to avoid naming collision
// QuestionsModel.hasMany(QuestionsLocalesModel, { foreignKey: "questionId", as: "locales" });
// QuestionsLocalesModel.belongsTo(QuestionsModel, { foreignKey: "questionId", as: "questionData" });

let data = {};

data.getAllQuestions = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    let search = req.query.search || "";
    let limit = parseInt(req.query.limit) || 10;
    let offset = parseInt(req.query.page) || 1;
    let sortBy = req.query.sort_by || "id";
    let orderBy = req.query.order_by || "asc";
    if (offset > 0) offset = (offset - 1) * limit;

    let where = {};
    if (search) {
      where[Op.or] = [
        { "$locales.question$": { [Op.iLike]: `%${search}%` } },
        { keywords_en: { [Op.iLike]: `%${search}%` } },
        { keywords_ar: { [Op.iLike]: `%${search}%` } },
      ];
    }

    let sortingOrder = [sortBy, orderBy];
    if (sortBy === "question")
      sortingOrder = [
        { model: QuestionsLocalesModel, as: "locales" },
        "question",
        orderBy,
      ];

    let passingData = {
      order: [sortingOrder],
      where,
      subQuery: false,
      distinct: true,
      include: [
        {
          model: QuestionsLocalesModel,
          as: "locales",
          attributes: ["id", "locale", "question", "answer"],
        },
      ],
    };

    let totalCount = await QuestionsModel.count(passingData);
    if (limit > 0) {
      passingData.offset = offset;
      passingData.limit = limit;
    }

    let questions = await QuestionsModel.findAll(passingData);

    res.status(200).json({
      ack: 1,
      questions,
      totalCount,
    });
  } catch (e) {
    console.error("Error in getAllQuestions:", e);
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].questions.questions.error,
    });
  }
};

data.getSpecificQuestion = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    let question = await QuestionsModel.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: QuestionsLocalesModel,
          as: "locales",
          attributes: ["id", "locale", "question", "answer"],
        },
      ],
    });

    if (!question) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].questions.question_not_found,
      });
    }

    res.status(200).json({
      ack: 1,
      question,
    });
  } catch (e) {
    console.error("Error in getSpecificQuestion:", e);
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].questions.questions.error,
    });
  }
};

data.addQuestion = async (req, res) => {
  try {
    const {
      question,
      question_arabic,
      answer,
      answer_arabic,
      keywords_en,
      keywords_ar,
    } = req.body;
    const lang = req.headers.lang || "en";
    let inputData = {
      keywords_en: keywords_en || "",
      keywords_ar: keywords_ar || "",
      locales: [
        { locale: "en", question, answer },
        { locale: "ar", question: question_arabic, answer: answer_arabic },
      ],
    };
    console.log(inputData);

    await QuestionsModel.create(inputData, {
      include: [{ model: QuestionsLocalesModel, as: "locales" }],
    });

    res.status(200).json({
      ack: 1,
      msg: language[lang].questions.question_added,
    });
  } catch (e) {
    console.error("Error in addQuestion:", e);
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].questions.questions.error,
    });
  }
};

data.editQuestion = async (req, res) => {
  try {
    const {
      question,
      question_arabic,
      answer,
      answer_arabic,
      keywords_en,
      keywords_ar,
    } = req.body;
    const lang = req.headers.lang || "en";
    const id = req.params.id;

    let existingQuestion = await QuestionsModel.findOne({ where: { id } });
    if (!existingQuestion) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].questions.question_not_found,
      });
    }

    await QuestionsModel.update(
      {
        keywords_en,
        keywords_ar,
      },
      { where: { id } }
    );

    await QuestionsLocalesModel.update(
      { question, answer },
      { where: { questionId: id, locale: "en" } }
    );
    await QuestionsLocalesModel.update(
      { question: question_arabic, answer: answer_arabic },
      { where: { questionId: id, locale: "ar" } }
    );

    res.status(200).json({
      ack: 1,
      msg: language[lang].questions.question_updated,
    });
  } catch (e) {
    console.error("Error in editQuestion:", e);
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].questions.questions.error,
    });
  }
};

data.deleteQuestion = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";
    const id = req.params.id;

    let existingQuestion = await QuestionsModel.findOne({ where: { id } });
    if (!existingQuestion) {
      return res.status(404).json({
        ack: 0,
        msg: language[lang].questions.question_not_found,
      });
    }

    await QuestionsLocalesModel.destroy({ where: { questionId: id } });
    await QuestionsModel.destroy({ where: { id } });

    res.status(200).json({
      ack: 1,
      msg: language[lang].questions.question_deleted,
    });
  } catch (e) {
    console.error("Error in deleteQuestion:", e);
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].questions.questions.error,
    });
  }
};

data.uploadFAQs = async (req, res) => {
  try {
    const lang = req.headers.lang || "en";

    // Log file details to debug
    console.log("Uploaded file:", req.file);
    console.log("Request body:", req.body);

    if (!req.file) {
      return res.status(400).json({
        ack: 0,
        msg: language[lang].questions.excel_file_required,
        errMsg: [{ file: language[lang].questions.excel_file_required }],
      });
    }

    const filePath = req.file.path;
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets["ورقة1"];
    if (!sheet) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        ack: 0,
        msg: language[lang].questions.invalid_excel_sheet,
      });
    }

    const faqs = XLSX.utils.sheet_to_json(sheet);
    if (!faqs || faqs.length === 0) {
      fs.unlinkSync(filePath);
      return res.status(400).json({
        ack: 0,
        msg: language[lang].questions.empty_excel_file,
      });
    }

    const faqData = faqs.filter((row) =>
      row["FAQs and Best Answers"]?.includes("Q:")
    );

    for (const faq of faqData) {
      const questionEn = faq["FAQs and Best Answers"]
        ?.replace(/^Q:\s*/, "")
        .trim();
      const answerIndex = faqs.indexOf(faq) + 1;
      const answerEn =
        answerIndex < faqs.length &&
        faqs[answerIndex]["FAQs and Best Answers"]?.includes("A:")
          ? faqs[answerIndex]["FAQs and Best Answers"]
              .replace(/^A:\s*/, "")
              .trim()
          : null;
      const keywordsEn = faq["Key Words En"]?.trim();
      const keywordsAr = faq["Key Words Ar"]?.trim();

      const questionAr = questionEn;
      const answerAr = answerEn;

      if (questionEn && answerEn) {
        await QuestionsModel.create(
          {
            keywords_en: keywordsEn || "",
            keywords_ar: keywordsAr || "",
            locales: [
              { locale: "en", question: questionEn, answer: answerEn },
              { locale: "ar", question: questionAr, answer: answerAr },
            ],
          },
          { include: [{ model: QuestionsLocalesModel, as: "locales" }] }
        );
      }
    }

    fs.unlinkSync(filePath);

    res.status(200).json({
      ack: 1,
      msg: language[lang].questions.faqs_imported,
    });
  } catch (e) {
    console.error("Error in uploadFAQs:", e);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].questions.error,
      errMsg: e.message,
    });
  }
};

module.exports = data;
