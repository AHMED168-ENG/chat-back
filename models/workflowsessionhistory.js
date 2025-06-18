'use strict';
const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class WorkflowSessionHistory extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  WorkflowSessionHistory.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    session_id: DataTypes.INTEGER,
    selectedOptions: DataTypes.JSON,
    lang: DataTypes.STRING,
    deletedAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'WorkflowSessionHistory',
    tableName: 'workflowSessionHistories',
    paranoid: true,
    timestamps: true});
  
  return WorkflowSessionHistory;
};
