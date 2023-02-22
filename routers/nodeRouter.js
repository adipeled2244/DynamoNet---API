const { Router } = require('express');
const { nodeController } = require('../controllers/nodeController');
const nodeRouter = new Router();

nodeRouter.get('/', nodeController.getNodes);
nodeRouter.get('/:nodeId', nodeController.getNode);
nodeRouter.post('/', nodeController.addNode);
nodeRouter.patch('/:nodeId', nodeController.updateNode);
nodeRouter.delete('/:nodeId', nodeController.deleteNode);

module.exports = { nodeRouter };