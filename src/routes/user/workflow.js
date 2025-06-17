const express = require('express');
const router = express.Router();
const workflowController = require('./../../modules/workflow/workflow.controller');
const validationSchema = require('./../../modules/workflow/workflow.validation');
const validation = require('../../middleware/validation');


router.get('/main',workflowController.getRoots);
router.get('/:nodeId/offsprings',validation(validationSchema.paramId), workflowController.nodeOffsprings);

module.exports = router;