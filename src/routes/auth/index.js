const router = require('./auth');
const express = require('express');
const authRouter = express.Router();
authRouter.use(`/auth`, router);

module.exports = authRouter;
