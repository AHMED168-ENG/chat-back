const { DataTypes } = require("sequelize");
const sequelize = require("../config/sequelizeDb");

const QuestionsModel = sequelize.define(
  "questions",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    keywords_en: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    keywords_ar: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "questions",
    timestamps: true,
  }
);

module.exports = QuestionsModel;
