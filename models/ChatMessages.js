// models/v7/ChatMessages.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelizeDb");
const ChatConversations = require("./ChatConversations");

const ChatMessages = sequelize.define(
  "chat_messages",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    conversation_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    sender_type: {
      type: DataTypes.ENUM("customer", "agent"),
      allowNull: false,
    },
    sender_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    message_type: {
      type: DataTypes.ENUM("text", "image", "file"),
      defaultValue: "text",
    },
    file_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    is_read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "chat_messages", 
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = ChatMessages;