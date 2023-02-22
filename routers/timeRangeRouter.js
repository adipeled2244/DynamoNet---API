const { Router } = require('express');
const { timeRangeController } = require('../controllers/timeRangeController');
const timeRangeRouter = new Router();

timeRangeRouter.get('/', timeRangeController.getTimeRanges);
timeRangeRouter.get('/:timeRangeId', timeRangeController.getTimeRange);
timeRangeRouter.delete('/:timeRangeId/projects/:projectId', timeRangeController.deleteTimeRange);

module.exports = { timeRangeRouter };