const { Router } = require('express');
const { networkController } = require('../controllers/networkController');
const networkRouter = new Router();

networkRouter.get('/', networkController.getNetworks);
networkRouter.get('/:networkId', networkController.getNetwork);
networkRouter.post('/', networkController.addNetwork);
networkRouter.patch('/:networkId', networkController.updateNetwork);
networkRouter.delete('/:networkId', networkController.deleteNetwork);

module.exports = { networkRouter };