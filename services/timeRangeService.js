const logger = require("../helpers/winston");
const path = require("path");
const TimeRange = require("../models/timeRange");
const Project = require("../models/project");
const mongoose = require("mongoose");
const Network = require("../models/network");
const ObjectId = mongoose.Types.ObjectId;

module.exports = {
  deleteTimeRange,
  getTimeRange,
  getTimeRanges,
  deleteTimeRanges,
  updateTimeRange,
  getTimeRangeWithNetwork,
};

async function getTimeRange(timeRangeId) {
  logger.info(`[getTimeRange] - ${path.basename(__filename)}`);
  return await TimeRange.findOne({ _id: timeRangeId }).populate(
    "network",
    "-edges -nodes"
  );
}

async function getTimeRangeWithNetwork(timeRangeId) {
  logger.info(`[getTimeRangeWithNetwork] - ${path.basename(__filename)}`);
  return await TimeRange.findOne({ _id: timeRangeId }).populate("network");
}

async function getTimeRanges() {
  logger.info(`[getTimeRanges] - ${path.basename(__filename)}`);
  return await TimeRange.find({}).populate("network", "-edges -nodes");
}

async function deleteTimeRange(timeRangeId, projectId) {
  logger.info(`[deleteTimeRange] - ${path.basename(__filename)}`);
  const project = await Project.findOne({ _id: projectId });
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
  await Project.updateOne(
    { _id: projectId },
    {
      timeRanges: project.timeRanges,
    }
  );
  const timeRange = await TimeRange.findOne({ _id: timeRangeId });
  await Network.deleteOne({ _id: timeRange.network });
  return await TimeRange.deleteOne({ _id: timeRangeId });
}

async function deleteTimeRanges(timeRangeIds, projectId) {
  logger.info(`[deleteTimeRanges] - ${path.basename(__filename)}`);
  const project = await Project.findOne({ _id: projectId }).populate(
    "timeRanges"
  );
  if (!project) {
    throw Error(`Project id : ${projectId} not found`);
  }
  projectTimeRangeIds = project.timeRanges.map((timeRange) =>
    timeRange._id.toString()
  );

  const invalidTimeRanges = timeRangeIds.filter(
    (id) => !projectTimeRangeIds.includes(id.toString())
  );

  if (invalidTimeRanges.length > 0) {
    throw Error(
      `The following timeRangeIds are not found in project ${projectId}: ${invalidTimeRanges}`
    );
  }

  projectTimeRangeIdsToKeep = project.timeRanges.filter(
    (timeRange) => !timeRangeIds.includes(timeRange._id.toString())
  );

  await Project.updateOne(
    { _id: projectId },
    {
      timeRanges: projectTimeRangeIdsToKeep,
    }
  );

  const networkIds = project.timeRanges.map((timeRange) => {
    if (timeRangeIds.includes(timeRange._id.toString())) {
      return timeRange.network;
    }
  });
  await Network.deleteMany({ _id: { $in: networkIds } });
  return await TimeRange.deleteMany({ _id: { $in: timeRangeIds } });
}

async function updateTimeRange(timeRangeId, projectId, timeRangeParams) {
  logger.info(`[updateTimeRange] - ${path.basename(__filename)}`);
  const project = await Project.findOne({ _id: projectId });
  if (!project) {
    throw Error(`Project id : ${projectId} not found`);
  }
  if (!project.timeRanges.includes(ObjectId(timeRangeId))) {
    throw Error(
      `TimeRange id : ${timeRangeId} not found in project ${projectId} `
    );
  }
  const timeRange = await TimeRange.findOne({ _id: timeRangeId });
  if (!timeRange) {
    throw Error(`TimeRange id : ${timeRangeId} not found`);
  }
  const { title } = timeRangeParams;
  if (title) {
    timeRange.title = title;
  }
  return await timeRange.save();
}
