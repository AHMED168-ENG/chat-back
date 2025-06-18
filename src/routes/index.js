const express = require('express');
const logger = require('./../../config/logger');
const chalk = require('chalk');
const AdminRouter = require('./admin/index');
// const authRouter = require('./auth/index');
const clientRouter = require('./user/index');
function bootstartp(app){
    const prefix= '/api/v1';
    app.use((req, res, next) => {
        if(req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE'){
            console.log(chalk.hex('#800080')(`[${new Date().toISOString()}] -> ${req.method} ${req.url}`));
        }
        else{console.log(chalk.blue(`[${new Date().toISOString()}] -> ${req.method} ${req.url}`));}
        next();
    });
    // app.use(prefix,authRouter)
    // app.use(prefix,clientRouter)
    app.use(prefix,AdminRouter)
    
    

    // Fallback middleware for unmatched routes
    app.use((req, res) => {
        res.status(404).send('Not Found');
    });
    app.use(require('../../utils/globalError'))
    // Log uncaught exceptions
    process.on('uncaughtException', (err) => {
        logger.error('Uncaught Exception:', err);
        process.exit(1);
    });

    // Log unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        logger.error('Unhandled Rejection:', reason);
        process.exit(1);
    });

}
module.exports = bootstartp;