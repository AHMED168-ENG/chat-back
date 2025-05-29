// models/v7/OnlineAgents.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelizeDb");

const OnlineAgents = sequelize.define(
  "online_agents",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    agent_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    agent_name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    current_conversations: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    max_conversations: {
      type: DataTypes.INTEGER,
      defaultValue: 3,
    },
    last_ping: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    socket_id: {
      type: DataTypes.STRING,
      defaultValue: "",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "online_agents", 
    timestamps: true,
    createdAt: "created_at",
    updatedAt: false,
  }
);

module.exports = OnlineAgents;