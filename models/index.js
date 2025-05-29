const ChatConversations = require("./ChatConversations");
const ChatMessages = require("./ChatMessages");
const ChatQueue = require("./ChatQueue");
const OnlineAgents = require("./OnlineAgents");
const User = require("./User");
const QuestionsModel = require("./questions.model");
const QuestionsLocalesModel = require("./questions_locales.model");

ChatConversations.hasMany(ChatMessages, {
  foreignKey: "conversation_id",
  as: "messages",
});
ChatConversations.hasOne(ChatQueue, {
  foreignKey: "conversation_id",
  as: "queue",
});
ChatMessages.belongsTo(ChatConversations, {
  foreignKey: "conversation_id",
  as: "conversation",
});
ChatQueue.belongsTo(ChatConversations, {
  foreignKey: "conversation_id",
  as: "conversation",
});

QuestionsModel.hasMany(QuestionsLocalesModel, {
  foreignKey: "questionId",
  as: "locales",
});
QuestionsLocalesModel.belongsTo(QuestionsModel, {
  foreignKey: "questionId",
  as: "questionData",
});

module.exports = {
  ChatConversations,
  ChatMessages,
  ChatQueue,
  OnlineAgents,
  User,
  QuestionsModel,
  QuestionsLocalesModel,
};
