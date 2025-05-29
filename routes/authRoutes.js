const express = require('express');
const { signup, signin } = require('../controllers/authController');
const validateJoi = require('../middleware/validationJoi');
const { signupSchema, signinSchema } = require('../validation/authValidation');

const router = express.Router();

router.post('/signup', validateJoi(signupSchema , "body"), signup);
router.post('/signin', validateJoi(signinSchema, "body"), signin);

module.exports = router;