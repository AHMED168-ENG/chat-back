require("dotenv").config();
const OpenAI = require("openai");
const {
  QuestionsModel,
  QuestionsLocalesModel,
  TicketsModel,
  PendingQuestionsModel,
} = require("../models/index.js");
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
    // context += `Based on the above, provide the closest answer to the following question: ${question}`;

    // context += `For the question "${question}", find the most relevant answer from the provided data. If the question contains any keywords (even partially matching) listed in the Keywords field, return the corresponding Answer exactly as it appears in the data. If no keywords match or the question is completely unrelated to the provided data, respond with exactly "No relevant answer found."`;
    context += `Based on the above, provide the closest answer to the following question: ${question} and see if question is a part of question . If no relevant answer is found in the provided data, respond with exactly "No relevant answer found."`;

    // let context = `You are an assistant trained on the following questions and answers:\n in "${lang}" language.\n`;

    // questions.forEach((q) => {
    //   context += `Question: ${q.locales[0].question}\nAnswer: ${
    //     q.locales[0].answer
    //   }\nKeywords: ${lang === "en" ? q.keywords_en : q.keywords_ar}\n\n`;
    // });
    context += `Based on the above, provide the closest answer to the following question: ${question}`;
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
    console.log(response.choices[0].message);
    const answer = response.choices[0].message.content.trim();

    if (answer === "No relevant answer found." || answer === "") {
      // إضافة السؤال إلى PendingQuestionsModel
      PendingQuestionsModel.create({
        userEmail,
        questionEn: question,
        questionAr: question,
        originalLang: lang,
      });

      // إضافة السؤال كتذكرة في TicketsModel
      try {
        TicketsModel.create({
          status: "open",
          subject: `Unanswered Question: ${question.substring(0, 50)}...`,
          description: `User Email: ${userEmail}\nQuestion (${lang}): ${question}`,
          customer_id: null, // يمكن تحديثه لو في معرف العميل
          assigned_to: null, // يمكن تعيينه لاحقًا
          department_id: null, // يمكن تعيينه بناءً على نوع السؤال
          category_id: null, // يمكن تعيينه لاحقًا
          priority_id: null, // يمكن تعيينه لاحقًا
          creator_id: null, // يمكن تعيينه لو في معرف المستخدم
        });
      } catch (ticketError) {
        console.warn(
          "Failed to create ticket for unanswered question:",
          ticketError
        );
        // ما بنرجّعش خطأ للعميل عشان ما يتأثرش
      }
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
