const logger = require("../helpers/winston");
const path = require("path");
const TimeRange = require("../models/timeRange");
const projectService = require("./projectService");
const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
  deleteTimeRange,
  getTimeRange,
  getTimeRanges,
};

async function getTimeRange(timeRangeId) {
  logger.info(`[getTimeRange] - ${path.basename(__filename)}`);
  return await TimeRange.findOne({ _id: timeRangeId }).populate(
    "network",
    "-edges"
  );
}

async function getTimeRanges() {
  logger.info(`[getTimeRanges] - ${path.basename(__filename)}`);
  return await TimeRange.find({}).populate("network", "-edges");
}

async function deleteTimeRange(timeRangeId, projectId) {
  logger.info(`[deleteTimeRange] - ${path.basename(__filename)}`);
  const project = await projectService.getProject(projectId);
  if (!project) {
    throw Error(`Project id : ${projectId} not found`);
  }
  if (!project.timeRanges.includes(ObjectId(timeRangeId))) {
    throw Error(
      `TimeRange id : ${timeRangeId} not found in project ${projectId} `
    );
  }
  project.timeRanges = project.timeRanges.filter(
    (timeRange) => timeRange.toString() != timeRangeId
  );
  await projectService.updateProject(projectId, {
    timeRanges: project.timeRanges,
  });
  return await TimeRange.deleteOne({ _id: timeRangeId });
}
