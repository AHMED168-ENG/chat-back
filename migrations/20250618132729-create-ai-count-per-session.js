'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('aiCountPerSessions', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4
      },
      entered: {
        type: Sequelize.BOOLEAN
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
    }, {
      timestamps: true,
      paranoid: true, // Enable soft deletes
      tableName: 'aiCountPerSessions'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('aiCountPerSessions');
  }
};
