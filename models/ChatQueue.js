// models/v7/ChatQueue.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelizeDb");
const ChatConversations = require("./ChatConversations");

const ChatQueue = sequelize.define(
  "chat_queue",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    position: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "chat_queue", 
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = ChatQueue;