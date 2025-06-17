const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelizeDb");

const PendingQuestionsModel = sequelize.define(
  "pending_questions",
  {
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
  },
  {
    tableName: "pending_questions",
    timestamps: true,
  }
);

module.exports = PendingQuestionsModel;
