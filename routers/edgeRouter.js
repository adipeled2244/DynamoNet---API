const { Router } = require('express');
const { edgeController } = require('../controllers/edgeController');
const edgeRouter = new Router();

edgeRouter.get('/', edgeController.getEdges);
edgeRouter.get('/:edgeId', edgeController.getEdge);
edgeRouter.post('/', edgeController.addEdge);
edgeRouter.patch('/:edgeId', edgeController.updateEdge);
edgeRouter.delete('/:edgeId', edgeController.deleteEdge);

module.exports = { edgeRouter };