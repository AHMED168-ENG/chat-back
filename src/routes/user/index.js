const workFlowRouter = require('./workflow');
const express = require('express');
const clientRouter = express.Router();
const prefix= '/client';
const authMiddleware = require('../../middleware/auth');
const assignLang = require('../../middleware/lang');
clientRouter.use(
    // authMiddleware.Authenticate,
    // authMiddleware.Authorize.allowedTo('vendor','admin'),
    assignLang);
clientRouter.use(`${prefix}/workflow`, workFlowRouter);

module.exports = clientRouter;
