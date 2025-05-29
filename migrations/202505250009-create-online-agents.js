// migrations/202505250004-create-online-agents.js
"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("online_agents", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      agent_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      agent_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      socket_id: {
        type: Sequelize.STRING(100),
        allowNull: "",
      },
      is_available: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      current_conversations: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      max_conversations: {
        type: Sequelize.INTEGER,
        defaultValue: 3,
      },
      last_ping: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
      created_at: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW,
      },
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("online_agents");
  },
};