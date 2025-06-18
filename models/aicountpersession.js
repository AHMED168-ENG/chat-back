'use strict';
const { Model } = require('sequelize');


module.exports = (sequelize, DataTypes) => {
  class aiCountPerSession extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  aiCountPerSession.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    entered: DataTypes.BOOLEAN,
    deletedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'aiCountPerSession',
    tableName: 'aiCountPerSessions',
    paranoid: true,
    timestamps: true});
  
  return aiCountPerSession;
};
