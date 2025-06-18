const express = require('express');
const router = express.Router();
const workflowController = require('./../../modules/workflow/workflow.controller');
const { uploadFields } = require('./../../../services/fileUploads/uploads');
const validationSchema = require('./../../modules/workflow/workflow.validation');
const validation = require('../../middleware/validation');
// Greeting message routes
router.get('/config/greeting', workflowController.getGreeting);
router.put('/config/greeting',
    validation(validationSchema.greetingVal),
    workflowController.updateGreeting
);
router.post('/config/greeting',
    validation(validationSchema.greetingVal),
    workflowController.createGreeting
);
// workflow nodes routes

router.get('/', workflowController.getNodes);
router.get('/main', workflowController.getRoots);
router.get('/ordered', workflowController.NodesTraversal);
router.get('/:nodeId/offsprings',validation(validationSchema.paramId), workflowController.nodeOffsprings);
router.get('/:nodeId',validation(validationSchema.paramId), workflowController.singleNode);


router.post('/',
    uploadFields([
        { name: 'icon', maxCount: 1 },
        { name: 'guidingImages', maxCount: 10 },
        { name: 'guidingImagesAr', maxCount: 10 }
    ], 'workflow/nodes'),
    validation(validationSchema.createNodeVal),
    workflowController.createNode
);
router.put('/:nodeId',
    uploadFields([
        { name: 'icon', maxCount: 1 },
        { name: 'guidingImages', maxCount: 10 },
        { name: 'guidingImagesAr', maxCount: 10 }
    ], 'workflow/nodes'),
    validation(validationSchema.updateNodeVal),
    workflowController.updateNode
);
router.delete('/:nodeId/forced', validation(validationSchema.paramId), workflowController.removeNodeWithItsBranch);
router.delete('/:nodeId', validation(validationSchema.paramId), workflowController.removeNode);

module.exports = router;
