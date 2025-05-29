const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelizeDb");

const QuestionsLocalesModel = sequelize.define(
  "questions_locales",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    questionId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    locale: {
      type: DataTypes.STRING(2),
      allowNull: false,
    },
    question: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    answer: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "questions_locales",
    timestamps: false,
  }
);

module.exports = QuestionsLocalesModel;
