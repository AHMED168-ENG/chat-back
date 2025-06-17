require("dotenv").config();
const OpenAI = require("openai");
const { QuestionsModel, QuestionsLocalesModel } = require("../models/index.js");
const { Op } = require("sequelize");
const language = require("../language/index");

// Initialize OpenAI with API key
const openai = new OpenAI({
  apiKey: process.env.OPEN_AI,
});

let data = {};

data.askQuestion = async (req, res) => {
  try {
    const { question, userEmail } = req.body;
    const lang = req.headers.lang || "en";

    const questions = await QuestionsModel.findAll({
      include: [
        {
          model: QuestionsLocalesModel,
          as: "locales",
          where: { locale: lang },
          attributes: ["question", "answer"],
        },
      ],
    });

    let context = `You are an assistant trained on the following questions and answers in "${lang}" language:\n`;
    questions.forEach((q) => {
      context += `Question: ${q.locales[0].question}\nAnswer: ${
        q.locales[0].answer
      }\nKeywords: ${lang === "en" ? q.keywords_en : q.keywords_ar}\n\n`;
    });
    context += `For the question "${question}", find the most relevant answer from the provided data. If the question contains any keywords (even partially matching) listed in the Keywords field, return the corresponding Answer exactly as it appears in the data. If no keywords match or the question is completely unrelated to the provided data, respond with exactly "No relevant answer found."`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [
        { role: "system", content: context },
        { role: "user", content: question },
      ],
      max_tokens: 200,
      temperature: 0.5,
    });

    const answer = response.choices[0].message.content.trim();

    if (answer === "No relevant answer found" || answer === "") {
      await PendingQuestionsModel.create({
        userEmail,
        questionEn: lang === "en" ? question : "",
        questionAr: lang === "ar" ? question : "",
        originalLang: lang,
      });

      return res.status(200).json({
        ack: 1,
        answer: language[lang].questions.no_answer_found,
      });
    }

    res.status(200).json({
      ack: 1,
      answer,
    });
  } catch (e) {
    console.error("Error in askQuestion:", e);
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].chatgpt.error,
    });
  }
};

module.exports = data;
