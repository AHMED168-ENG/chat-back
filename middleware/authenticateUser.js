const jwt = require('jsonwebtoken');
const language = require('../language');
require('dotenv').config();

module.exports = (req, res, next) => {
  const lang = req.headers.lang || 'en';
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        ack: 0,
        message: language[lang].auth.token_missing,
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.auth_data = decoded; // { email, account_type }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        ack: 0,
        message: language[lang].auth.token_expired,
      });
    }
    return res.status(401).json({
      ack: 0,
      message: language[lang].auth.invalid_token,
    });
  }
};