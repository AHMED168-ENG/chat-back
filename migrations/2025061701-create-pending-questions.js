module.exports = {
  up: async (queryInterface, DataTypes) => {
    await queryInterface.createTable("pending_questions", {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userEmail: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      questionEn: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      questionAr: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      originalLang: {
        type: DataTypes.STRING(2),
        allowNull: false,
        validate: {
          isIn: [["en", "ar"]],
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("pending_questions");
  },
};
