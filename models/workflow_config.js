'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class workflow_config extends Model {}

  workflow_config.init(
    {
      greeting: DataTypes.STRING,
      greetingAr: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'workflow_config',
      paranoid: true,
    }
  );

  return workflow_config;
};
