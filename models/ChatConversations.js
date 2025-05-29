// models/v7/ChatConversations.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelizeDb");
const ChatMessages = require("./ChatMessages");
const ChatQueue = require("./ChatQueue");

const ChatConversations = sequelize.define(
  "chat_conversations",
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
    crm_agent_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    subject: {
      type: DataTypes.STRING(200),
      allowNull: true,
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    status: {
      type: DataTypes.ENUM("waiting", "active", "closed"),
      defaultValue: "waiting",
    },
    queue_position: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    closed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
  
);

module.exports = ChatConversations;