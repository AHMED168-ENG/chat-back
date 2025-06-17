module.exports = (app) => {
    app.use((req, res, next) => {
        global.currentRequest = req;
        global.fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
        const url = new URL(fullUrl);
        global.baseUrl = `${url.protocol}//${url.host}${url.pathname}`;
        next();
    });
};