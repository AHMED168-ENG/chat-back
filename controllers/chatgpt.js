require("dotenv").config();
const OpenAI = require("openai");
const {
  QuestionsModel,
  QuestionsLocalesModel,
  TicketsModel,
  PendingQuestionsModel,
  CustomersModel,
} = require("../models/index.js");
const { Op } = require("sequelize");
const language = require("../language/index");
// for product and category training
const { DataTypes } = require('sequelize');
const sequelize = require('../config/sequelizeDb.js');

const defineModelCategory= require('../models/category');
const Category = defineModelCategory(sequelize,DataTypes); 
const defineModelProduct= require('../models/product');
const Product = defineModelProduct(sequelize,DataTypes); 

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
    const products = await Product.findAll({})
    // let context = `You are an assistant trained on the following questions and answers in "${lang}" language:\n`;
    // questions.forEach((q) => {
    //   context += `Question: ${q.locales[0].question}\nAnswer: ${
    //     q.locales[0].answer
    //   }\nKeywords: ${lang === "en" ? q.keywords_en : q.keywords_ar}\n\n`;
    // });
    // // context += `Based on the above, provide the closest answer to the following question: ${question}`;

    // // context += `For the question "${question}", find the most relevant answer from the provided data. If the question contains any keywords (even partially matching) listed in the Keywords field, return the corresponding Answer exactly as it appears in the data. If no keywords match or the question is completely unrelated to the provided data, respond with exactly "No relevant answer found."`;
    // context += `Based on the above, provide the closest answer to the following question: ${question} and see if question is a part of question . If no relevant answer is found in the provided data, respond with exactly "No relevant answer found."`;

    // // let context = `You are an assistant trained on the following questions and answers:\n in "${lang}" language.\n`;

    // // questions.forEach((q) => {
    // //   context += `Question: ${q.locales[0].question}\nAnswer: ${
    // //     q.locales[0].answer
    // //   }\nKeywords: ${lang === "en" ? q.keywords_en : q.keywords_ar}\n\n`;
    // // });
    let context = `
      You are an AI assistant for a Qatari supermarket called Pality Express. The customer may speak in Arabic or English.

      Your responsibilities:
      1. If the user asks about a dish, list its ingredients from your general knowledge.
      2. Then, match those ingredients to the product list below and suggest products available at Pality Express.
      3. If the user asks a predefined question, answer using the Q&A list only.
      4. If you can't match the question to any FAQ or known dish, reply with exactly: "No relevant answer found."
      5. Always respond in the same language the user uses.

      == FAQs ==
      ${questions.map(q => `Q: ${q.locales[0].question}\nA: ${q.locales[0].answer}\n`).join("\n")}

      == Product Catalog ==
      ${products.map(p => 
        `Product (EN): ${p.name_en}\nProduct (AR): ${p.name_ar}\nDescription (EN): ${p.description_en}\nDescription (AR): ${p.description_ar}`
      ).join("\n\n")}
      `;
    // context += `Based on the above, provide the closest answer to the following question: ${question}`;
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      store: true,
      messages: [
        { role: "system", content: context },
        { role: "user", content: question },
      ],
      max_tokens: 300,
      temperature: 0.5,
    });
    // console.log(response.choices[0].message);
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
        let customer = await CustomersModel.findOne({
          where: { email: userEmail },
        });
        console.log(customer);
        TicketsModel.create({
          status: "open",
          subject: `Unanswered Question: ${question.substring(0, 50)}...`,
          description: `User Email: ${userEmail}\nQuestion (${lang}): ${question}`,
          customer_id: customer ? customer.id : null, // يمكن تحديثه لو في معرف العميل
          assigned_to: null,
          department_id: null,
          category_id: null,
          priority_id: null,
          creator_id: null,
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
