const { DataTypes } = require('sequelize');
const {Op} = require('sequelize');
const sequelize = require('../../../config/sequelizeDb.js');
const catchError = require("../../../utils/catchError.js");
const defineSessionHistory = require('../../../models/workflowsessionhistory.js');
const workflowSessionModel = defineSessionHistory(sequelize,DataTypes); 
const ChatConversations= require('../../../models/ChatConversations.js');
const getAnalysis = catchError(async (req, res) => {
    const { from,to } = req.query;
    console.log(from,to)
    // Get chatbot counts per month
    const chatbotRaw = await workflowSessionModel.findAll({
        attributes: [
            [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'chatbot'],
        ],
        where: {
            createdAt: {
                [Op.between]: [new Date(from), new Date(to)]
            }
        },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'DESC']],
        raw: true
    });

    const agentRaw = await ChatConversations.findAll({
        attributes: [
            [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'agent'],
        ],
        where: {
            created_at: {
                [Op.between]: [new Date(from), new Date(to)],
            },
        },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'DESC']],
        raw: true,
    });

    function getMonthsBetween(start, end) {
        const result = [];
        const date = new Date(start.getFullYear(), start.getMonth(), 1);
        const endDate = new Date(end.getFullYear(), end.getMonth(), 1);
        while (date <= endDate) {
            result.push(date.toISOString().slice(0, 7));
            date.setMonth(date.getMonth() + 1);
        }
        return result;
    }

    const months = getMonthsBetween(new Date(from), new Date(to));

    const chatbotMap = Object.fromEntries(chatbotRaw.map(r => [r.month, Number(r.chatbot)]));
    const agentMap = Object.fromEntries(agentRaw.map(r => [r.month, Number(r.agent)]));

    let totalChatbot = 0;
    let totalAgent = 0;

    const data = months.map(month => {
        const chatbot = chatbotMap[month] || 0;
        const agent = agentMap[month] || 0;
        totalChatbot += chatbot;
        totalAgent += agent;
        return { month, chatbot, humanAgent:agent };
    });

    data.push({
        total: {
            chatbot: totalChatbot,
            agent: totalAgent
        }
    });
    
    res.status(200).json({
        data
    });
});

module.exports = {
  getAnalysis,
};