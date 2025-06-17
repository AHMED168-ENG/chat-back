'use strict';
const { Model } = require('sequelize');

const Parser = (val) => {
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return typeof parsed === 'string' ? JSON.parse(parsed) : parsed;
    } catch {
      return [];
    }
  }
  return val;
};

module.exports = (sequelize, DataTypes) => {
  class WorkflowNodes extends Model {
    static associate(models) {
      // Define associations here if needed
    }
  }

  WorkflowNodes.init({
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    parentId: DataTypes.UUID,
    name: DataTypes.STRING,
    nameAr: DataTypes.STRING,
    icon: DataTypes.JSON,
    guidingText: DataTypes.STRING,
    guidingImages: DataTypes.JSON,
    guidingTextAr: DataTypes.STRING,
    guidingImagesAr: DataTypes.JSON,
    textType: DataTypes.ENUM('text', 'question', 'html'),
    optionType: DataTypes.ENUM('ai', 'agent', 'answer'),
    notes: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'WorkflowNodes',
    paranoid: true,
    hooks: {
      afterFind: (nodes) => {
        if (Array.isArray(nodes)) {
          nodes.forEach(node => {
            node.guidingImages = Parser(node.guidingImages);
            node.guidingImagesAr = Parser(node.guidingImagesAr);
            node.icon = Parser(node.icon);
          });
        } else if (nodes) {
          nodes.guidingImages = Parser(nodes.guidingImages);
          nodes.guidingImagesAr = Parser(nodes.guidingImagesAr);
          nodes.icon = Parser(nodes.icon);
        }
      }
    }
  });

  return WorkflowNodes;
};
