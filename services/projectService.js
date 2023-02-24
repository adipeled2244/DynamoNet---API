const Project = require("../models/project");
const Network = require("../models/network");

const logger = require("../helpers/winston");
const path = require("path");
const timeRangeService = require("../services/timeRangeService");
const networkService = require("../services/networkService");

module.exports = {
  addProject,
  updateProject,
  getProjectByUserId,
  getProject,
  deleteProject,
  getProjects,
  getFavoriteNodes,
  addFavoriteNode,
  getFavoriteNode,
  removeFavoriteNodeFromFavoriteNodes,
  removeFavoriteNodeFromTimeRangesNetwork,
};
async function addProject(params) {
  logger.info(`[addProject] - ${path.basename(__filename)}`);
  const newProject = new Project(params);
  await newProject.save();
  return newProject;
}

async function updateProject(id, params) {
  logger.info(`[updateProject] - ${path.basename(__filename)}`);
  return await Project.updateOne({ _id: id }, params);
}

async function getProjectByUserId(userId) {
  logger.info(`[getProjectByUserId] - ${path.basename(__filename)}`);
  return await Project.find({ userRef: userId });
}

async function getProject(projectId) {
  logger.info(`[getProject] - ${path.basename(__filename)}`);
  return await Project.findOne({ _id: projectId }).populate(
    "networks timeRanges",
    "-edges"
  );
}

async function getProjects() {
  logger.info(`[getProject] - ${path.basename(__filename)}`);
  return await Project.find({}).populate("networks timeRanges", "-edges");
}

async function deleteProject(projectId) {
  logger.info(`[deleteProject] - ${path.basename(__filename)}`);
  const project = await projectService.getProject(projectId);
  if (!project) {
    throw Error(`Project id : ${projectId} not found`);
  }
  await timeRangeService.deleteTimeRanges(project.timeRanges, projectId);
  await networkService.deleteNetworks(project.networks);
  return await Project.deleteOne({ _id: projectId });
}

async function getFavoriteNodes(projectId) {
  logger.info(`[getFavoriteNodes] - ${path.basename(__filename)}`);
  return await Project.findOne(
    { _id: projectId },
    { favoriteNodes: 1, _id: 0 }
  );
}

async function getFavoriteNode(projectId, twitterId) {
  logger.info(`[getFavoriteNode] - ${path.basename(__filename)}`);
  return await Project.findOne({
    _id: projectId,
    favoriteNodes: { $in: [twitterId] },
  });
}

async function addFavoriteNode(projectId, twitterId) {
  logger.info(`[addFavoriteNode] - ${path.basename(__filename)}`);

  return await Project.updateOne(
    { _id: projectId, favoriteNodes: { $ne: twitterId } },
    { $addToSet: { favoriteNodes: twitterId } }
  );

  // return await Project.updateOne({ _id: projectId }, { $push: { favoriteNodes: twitterId } });
}

async function removeFavoriteNodeFromFavoriteNodes(projectId, twitterId) {
  logger.info(
    `[removeFavoriteNodeFromFavoriteNodes] - ${path.basename(__filename)}`
  );
  return await Project.updateOne(
    { _id: projectId },
    { $pull: { favoriteNodes: twitterId } }
  );
}

async function removeFavoriteNodeFromTimeRangesNetwork(projectId, twitterId) {
  logger.info(
    `[removeFavoriteNodeFromTimeRangesNetwork] - ${path.basename(__filename)}`
  );
  const project = await Project.findOne({ _id: projectId }).populate(
    "timeRanges"
  );
  if (!project) {
    throw new Error("Project not found");
  }

  const timeRanges = project.timeRanges;
  const promises = [];

  for (let i = 0; i < timeRanges.length; i++) {
    const timeRange = timeRanges[i];
    const network = await Network.findOne({ _id: timeRange.network });
    if (!network) {
      throw new Error("Network not found");
    }
    const nodeMetrics = network.nodeMetrics;
    if (!nodeMetrics) continue;
    if (nodeMetrics.has(twitterId)) {
      nodeMetrics.delete(twitterId);
      network.markModified("nodeMetrics");
      promises.push(network.save());
    }
  }
  return Promise.all(promises);
}
