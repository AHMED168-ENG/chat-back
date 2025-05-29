const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const language = require('../language');
require('dotenv').config();

exports.signup = async (req, res) => {
  const lang = req.headers.lang || 'en';
  try {
    const { email, password, account_type } = req.body;
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        ack: 0,
        message: language[lang].auth.email_exists,
      });
    }

    const user = await User.create({ email, password, account_type, lang });
    const token = jwt.sign(
      { email: user.email, account_type: user.account_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      ack: 1,
      message: language[lang].auth.signup_success,
      token,
      user: { id: user.id, email: user.email, account_type: user.account_type },
    });
  } catch (err) {
    console.log('Signup error:', err.message);
    res.status(500).json({
      ack: 0,
      message: language[lang].error.internal_error,
    });
  }
};

exports.signin = async (req, res) => {
  const lang = req.headers.lang || 'en';
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        ack: 0,
        message: language[lang].auth.invalid_credentials,
      });
    }

    const token = jwt.sign(
      { email: user.email, account_type: user.account_type },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      ack: 1,
      message: language[lang].auth.signin_success,
      token,
      user: { id: user.id, email: user.email, account_type: user.account_type },
    });
  } catch (err) {
    console.log('Signin error:', err.message);
    res.status(500).json({
      ack: 0,
      message: language[lang].error.internal_error,
    });
  }
};