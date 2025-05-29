const express = require("express");
const router = express.Router();
const Chat = require("../controllers/chatController");
const {
  startChatSchema,
  sendMessageSchema,
  getChatHistorySchema,
} = require("../validation/chatValidation");
const authenticateUser = require("../middleware/authenticateUser");
const validateJoi = require("../middleware/validationJoi");
const { uploadSingleImage, handleMulterError } = require("../config/multer");

router.post(
  "/start-conversation",
  // authenticateUser,
  validateJoi(startChatSchema, "body"),
  Chat.startConversation
);

router.get(
  "/agent-conversations/:agentId",
  // authenticateUser,
  Chat.getAgentConversations
);

router.post(
  "/send-message",
  // authenticateUser,
  uploadSingleImage("file", "uploads/chat"),
  handleMulterError,
  validateJoi(sendMessageSchema, "body"),
  Chat.sendMessage
);

router.get(
  "/conversation/:id",
  // authenticateUser,
  Chat.getConversation
);

router.get(
  "/my-conversations",
  // authenticateUser,
  validateJoi(getChatHistorySchema, "query"),
  Chat.getMyConversations
);

router.get(
  "/queue-status",
  // authenticateUser,
  Chat.getQueueStatus
);

router.put(
  "/close-conversation/:id",
  // authenticateUser,
  Chat.closeConversation
);

module.exports = router;
