'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('aiCountPerSessions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      entered: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      deletedAt: {
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
      tableName: 'aiCountPerSessions' // Specify the table name
  });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('aiCountPerSessions');
  }
};