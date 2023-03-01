const { Router } = require("express");
const { timeRangeController } = require("../controllers/timeRangeController");
const timeRangeRouter = new Router();

timeRangeRouter.get("/", timeRangeController.getTimeRanges);
timeRangeRouter.get("/:timeRangeId", timeRangeController.getTimeRange);
timeRangeRouter.get(
  "/:timeRangeId/network",
  timeRangeController.getTimeRangeWithNetwork
);
timeRangeRouter.post("/", timeRangeController.addTimeRanges);
timeRangeRouter.delete(
  "/:timeRangeId/projects/:projectId",
  timeRangeController.deleteTimeRange
);
timeRangeRouter.delete("/", timeRangeController.deleteTimeRanges);
timeRangeRouter.patch(
  "/:timeRangeId/projects/:projectId",
  timeRangeController.updateTimeRange
);

module.exports = { timeRangeRouter };
