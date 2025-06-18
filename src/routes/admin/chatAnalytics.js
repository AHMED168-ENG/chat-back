const express = require('express');
const router = express.Router();
const chatAnalysis = require('./../../modules/analytics/chatAnalysis.controller');
const { uploadFields } = require('./../../../services/fileUploads/uploads');
const valSchema = require('./../../modules/analytics/chatAnalysis.validation');
const validation = require('../../middleware/validation');
router.get('/',validation(valSchema.chatAnalysisSchema), chatAnalysis.getAnalysis);
module.exports = router;