'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workflowSessionHistories', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUID
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: false
      },
      selectedOptions: {
        type: Sequelize.JSON
      },
      lang: {
        type: Sequelize.STRING
      },
      deletedAt: {
        allowNull: true,
        type: Sequelize.DATE
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    },
    {
      timestamps: true,
      paranoid: true, // Enable soft deletes
      tableName: 'workflowSessionHistories' // Specify the table name
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('workflowSessionHistories');
  }
};