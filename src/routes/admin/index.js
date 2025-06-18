const workFlowRouter = require('./workflow');
const chatAnalytics = require('./chatAnalytics');
const express = require('express');
const routerAdmin = express.Router();
const authMiddleware = require('../../middleware/auth');
const prefix= '/admin';

// routerAdmin.use(
//    authMiddleware.Authenticate
// );
routerAdmin.use(`${prefix}/workflow`, workFlowRouter);
routerAdmin.use(`${prefix}/analytics`, chatAnalytics);

module.exports = routerAdmin;
