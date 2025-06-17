'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('workflowNodes', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUID
      },
      parentId: {
        type: Sequelize.UUID
      },
      name: {
        type: Sequelize.STRING
      },
      nameAr: {
        type: Sequelize.STRING
      },
      icon: {
        type: Sequelize.JSON
      },
      guidingText: {
        type: Sequelize.STRING
      },
      guidingImages: {
        type: Sequelize.JSON
      },
      guidingTextAr: {
        type: Sequelize.STRING
      },
      guidingImagesAr: {
        type: Sequelize.JSON
      },
      textType: {
        type: Sequelize.ENUM('text', 'html')
      },
      optionType: {
        type: Sequelize.ENUM('ai', 'agent', 'answer')
      },
      notes: {
        type: Sequelize.STRING
      },
      deletedAt: {
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('workflowNodes');
  }
};