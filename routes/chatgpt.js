const express = require("express");
const router = express.Router();
const ChatGPT = require("../controllers/chatgpt");
const authenticateUser = require("../middleware/authenticateUser");
const validateJoi = require("../middleware/validationJoi");
const { askQuestionSchema } = require("../validation/chatgpt");
const { startChat } = require("../controllers/start-chat.js");
router.post(
  "/start-chat",
  startChat,
);
router.post(
  "/ask",
  // authenticateUser,
  validateJoi(askQuestionSchema, "body"),
  ChatGPT.askQuestion
);

module.exports = router;
