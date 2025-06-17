const  catchError  = require('./../../utils/catchError');

const assignLang = catchError(async(req, res, next) => {
    let lang = req.headers['accept-language'] || req.headers['lang'];
    if (!lang) {
        return next();
    }
    if (typeof lang === 'string') {
        lang = lang.trim();
    }
    req.lang = lang;
    next();
});
module.exports = assignLang;