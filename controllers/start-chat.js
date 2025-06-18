const { DataTypes } = require('sequelize');
const {Op} = require('sequelize');
const sequelize = require('../config/sequelizeDb.js');
const defineAiSession= require('../models/aicountpersession.js');
const aicountpersession = defineAiSession(sequelize,DataTypes); 
const startChat = async (req, res, next) => {
  try {
    await aicountpersession.create({
      entered: true})
    return res.status(200).json({ message: 'Chat started successfully' });
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
module.exports = {startChat};