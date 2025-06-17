const workFlowRouter = require('./workflow');
const express = require('express');
const routerAdmin = express.Router();
const authMiddleware = require('../../middleware/auth');
const prefix= '/admin';

// routerAdmin.use(
//    authMiddleware.Authenticate
// );
routerAdmin.use(`${prefix}/workflow`, workFlowRouter);

module.exports = routerAdmin;
