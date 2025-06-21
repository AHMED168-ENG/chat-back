'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Products', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name_en: {
        type: Sequelize.STRING
      },
      name_ar: {
        type: Sequelize.STRING
      },
      description_en: {
        type: Sequelize.TEXT
      },
      description_ar: {
        type: Sequelize.TEXT
      },
      price: {
        type: Sequelize.DECIMAL
      },
      available_quantity: {
        type: Sequelize.INTEGER
      },
      unit: {
        type: Sequelize.STRING
      },
      barcode: {
        type: Sequelize.STRING
      },
      status: {
        type: Sequelize.BOOLEAN
      },
      categoryId: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Categories', // name of the target model
          key: 'id' // key in the target model that we're referencing
        },
        allowNull: false,
        onDelete: 'CASCADE', // optional, defines what happens on delete
        onUpdate: 'CASCADE' // optional, defines what happens on update
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
    await queryInterface.dropTable('Products');
  }
};