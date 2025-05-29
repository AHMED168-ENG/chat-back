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
    const { question } = req.body;
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

    let context = `You are an assistant trained on the following questions and answers:\n in "${lang}" language.\n`;

    questions.forEach((q) => {
      context += `Question: ${q.locales[0].question}\nAnswer: ${
        q.locales[0].answer
      }\nKeywords: ${lang === "en" ? q.keywords_en : q.keywords_ar}\n\n`;
    });
    context += `Based on the above, provide the closest answer to the following question: ${question}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [
        { role: "system", content: context },
        { role: "user", content: question },
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    res.status(200).json({
      ack: 1,
      answer: response.choices[0].message.content.trim(),
    });
  } catch (e) {
    console.error("Error in askQuestion:", e);
    res.status(400).json({
      ack: 0,
      msg: language[req.headers.lang || "en"].questions.chatgpt.error,
    });
  }
};

module.exports = data;
