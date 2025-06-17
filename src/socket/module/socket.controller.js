const { DataTypes } = require('sequelize');
const sequelize = require('../../../config/sequelizeDb.js');
const defineWorkflowConfig = require('../../../models/workflow_config');
const WorkflowConfig = defineWorkflowConfig(sequelize, DataTypes);
const defineWorkflowNodes = require('../../../models/workflownodes');
const workflowNodes = defineWorkflowNodes(sequelize,DataTypes); 


const getGreetingMessage = async (lang) => {
  const message = await WorkflowConfig.findOne();
  if (!message) return '';
  return lang === "ar" ? message.greetingAr : message.greeting || '';
};
const getRoots = async (lang = "en") => {
    // Default attributes
    const defaultAttributes = [
        "id", "textType", "parentId", "optionType", "icon", "notes"
    ];
    if (lang === "ar") {
        defaultAttributes.push("nameAr", "guidingTextAr", "guidingImagesAr");
    } else {
        defaultAttributes.push("name", "guidingText", "guidingImages");
    }
    // Fetch root nodes (parentId: null)
    const nodes = await workflowNodes.findAll({
        where: { parentId: null },
        order: [["createdAt", "DESC"]],
        attributes: defaultAttributes
    });
    return nodes;
};

    
const parentOffSprings = async (parentId, lang = "en") => {
    // Default attributes
    const defaultAttributes = [
        "id", "textType", "parentId", "optionType", "icon", "notes"
    ];
    if (lang === "ar") {
        defaultAttributes.push("nameAr", "guidingTextAr", "guidingImagesAr");
    } else {
        defaultAttributes.push("name", "guidingText", "guidingImages");
    }
    // Fetch child nodes of the given parentId
    const nodes = await workflowNodes.findAll({
        where: { parentId: parentId },
        order: [["createdAt", "DESC"]],
        attributes: defaultAttributes
    });
    return nodes;
}

module.exports = {
    getRoots,
    parentOffSprings,
    getGreetingMessage
};