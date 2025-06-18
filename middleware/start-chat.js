const aicountpersession = require("../models/aicountpersession.js");

const startChat = async (req, res, next) => {
  try {
    await aicountpersession.create({
      entered: true,})
    return next();
  } catch (error) {
    console.error('Error starting chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
module.exports = {startChat};