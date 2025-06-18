const { DataTypes } = require('sequelize');
const {Op} = require('sequelize');
const sequelize = require('../../../config/sequelizeDb.js');
const catchError = require("../../../utils/catchError.js");
const defineSessionHistory = require('../../../models/workflowsessionhistory.js');
const workflowSessionModel = defineSessionHistory(sequelize,DataTypes); 
const ChatConversations= require('../../../models/ChatConversations.js');
const defineAiSession= require('../../../models/aicountpersession.js');
const aicountpersession = defineAiSession(sequelize,DataTypes); 
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

const getAnalysis = catchError(async (req, res) => {
    const { from,to } = req.query;
    const fromDate = new Date(from);
    const toDate = new Date(to);
    // Get chatbot counts per month
    const chatbotRaw = await workflowSessionModel.findAll({
        attributes: [
            [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'chatbot'],
        ],
        where: {
            createdAt: {
                [Op.between]: [fromDate, toDate]
            }
        },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
        raw: true
    });

    const agentRaw = await ChatConversations.findAll({
        attributes: [
            [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'agent'],
        ],
        where: {
            created_at: {
                [Op.between]: [fromDate, toDate],
            },
        },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('created_at'), '%Y-%m'), 'ASC']],
        raw: true,
    });

    const gptRaw = await aicountpersession.findAll({
        attributes: [
            [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'month'],
            [sequelize.fn('COUNT', sequelize.col('id')), 'ai'],
        ],
        where: {
            createdAt: {
                [Op.between]: [fromDate, toDate],
            },
            entered: true
        },
        group: [sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m')],
        order: [[sequelize.fn('DATE_FORMAT', sequelize.col('createdAt'), '%Y-%m'), 'ASC']],
        raw: true
    });

    const months = getMonthsBetween(fromDate, toDate);

    const chatbotMap = Object.fromEntries(chatbotRaw.map(r => [r.month, Number(r.chatbot)]));
    const agentMap = Object.fromEntries(agentRaw.map(r => [r.month, Number(r.agent)]));
    const aiMap = Object.fromEntries(gptRaw.map(r => [r.month, Number(r.ai)]));

    let totalChatbot = 0;
    let totalAgent = 0;
    let totalAi = 0;

    const data = months.map(month => {
        const chatbot = chatbotMap[month] || 0;
        const agent = agentMap[month] || 0;
        const ai = aiMap[month] || 0;
        totalChatbot += chatbot;
        totalAgent += agent;
        totalAi += ai;
        return { month, chatbot, humanAgent: agent, ai };
    });

    data.push({
        total: {
            chatbot: totalChatbot,
            agent: totalAgent,
            ai: totalAi
        }
    });

    res.status(200).json({
        data
    });
});

module.exports = {
  getAnalysis,
};