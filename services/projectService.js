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
  getEdgeTypes,
  removeFavoriteNodeFromFavoriteNodes,
  removeFavoriteNodeFromTimeRangesNetwork,
  getProjectWithTimeRanges,
  projectExists,
  getProjectNetwork,
};
async function addProject(params) {
  logger.info(`[addProject] - ${path.basename(__filename)}`);
  const newProject = new Project(params);
  await newProject.save();
  return newProject;
}

async function updateProject(id, params) {
  logger.info(`[updateProject] - ${path.basename(__filename)}`);
  const project = await getProject(id, false);
  if (!project) {
    throw Error(`Project id : ${id} not found`);
  }
  if (params.title) {
    project.title = params.title;
    project.markModified("title");
  }
  if (params.description) {
    project.description = params.description;
    project.markModified("description");
  }
  if (params.edgeType) {
    project.edgeType = params.edgeType;
    project.markModified("edgeType");
  }
  if (params.favoriteNodes) {
    project.favoriteNodes = params.favoriteNodes;
    project.markModified("favoriteNodes");
  }
  if (params.status) {
    project.status = params.status;
    project.markModified("status");
  }
  await project.save();
  return project;
}

async function getProjectByUserId(userId) {
  logger.info(`[getProjectByUserId] - ${path.basename(__filename)}`);
  return await Project.find({ userRef: userId });
}

async function getProject(projectId, populate = true) {
  logger.info(`[getProject] - ${path.basename(__filename)}`);
  if (!populate) {
    return await Project.findOne({ _id: projectId });
  }
  return await Project.findOne({ _id: projectId }).populate(
    "sourceNetwork timeRanges",
    "-edges -nodes"
  );
}

async function getProjects(populate = false) {
  logger.info(`[getProjects] - ${path.basename(__filename)}`);
  if (!populate) {
    return await Project.find({});
  }
  return await Project.find({}).populate(
    "sourceNetwork timeRanges",
    "-edges -nodes"
  );
}

async function deleteProject(projectId) {
  logger.info(`[deleteProject] - ${path.basename(__filename)}`);
  const project = await getProject(projectId, false);
  if (!project) {
    throw Error(`Project id : ${projectId} not found`);
  }
  await timeRangeService.deleteTimeRanges(project.timeRanges, projectId);
  await networkService.deleteNetwork(project.sourceNetwork);
  return await Project.deleteOne({ _id: projectId });
}

async function getFavoriteNodes(projectId) {
  logger.info(`[getFavoriteNodes] - ${path.basename(__filename)}`);
  return await Project.findOne(
    { _id: projectId },
    { favoriteNodes: 1, _id: 0 }
  );
}
async function getEdgeTypes(projectId) {
  logger.info(`[getFavoriteNodes] - ${path.basename(__filename)}`);
  return await Project.findOne({ _id: projectId }, { edgeTypes: 1, _id: 0 });
}
async function getFavoriteNode(projectId, twitterId) {
  logger.info(`[getFavoriteNode] - ${path.basename(__filename)}`);
  return await Project.findOne({
    _id: projectId,
    favoriteNodes: { $in: [twitterId] },
  });
}

async function addFavoriteNode(projectId, username) {
  logger.info(`[addFavoriteNode] - ${path.basename(__filename)}`);

  return await Project.updateOne(
    { _id: projectId, favoriteNodes: { $ne: username } },
    { $addToSet: { favoriteNodes: username } }
  );

  // return await Project.updateOne({ _id: projectId }, { $push: { favoriteNodes: twitterId } });
}

async function removeFavoriteNodeFromFavoriteNodes(projectId, username) {
  logger.info(
    `[removeFavoriteNodeFromFavoriteNodes] - ${path.basename(__filename)}`
  );
  return await Project.updateOne(
    { _id: projectId },
    { $pull: { favoriteNodes: username } }
  );
}

async function removeFavoriteNodeFromTimeRangesNetwork(projectId, username) {
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
    if (nodeMetrics.has(username)) {
      nodeMetrics.delete(username);
      network.markModified("nodeMetrics");
      promises.push(network.save());
    }
  }
  return Promise.all(promises);
}

async function getProjectWithTimeRanges(projectId) {
  logger.info(`[getProjectWithTimeRanges] - ${path.basename(__filename)}`);
  const project = await Project.findOne({ _id: projectId }).populate(
    "sourceNetwork timeRanges timeRanges.network",
    "-edges -nodes -nodePositions -retweetCommunities -quoteCommunities -communitiesPerEdgeType"
  );
  if (!project) {
    throw new Error("Project not found");
  }
  for (let i = 0; i < project.timeRanges.length; i++) {
    const timeRange = project.timeRanges[i];
    timeRange.network = await Network.findOne(
      { _id: timeRange.network },
      "-edges -nodes -nodePositions -retweetCommunities -quoteCommunities -communitiesPerEdgeType"
    );
  }
  project.timeRanges.sort((tr1, tr2) => {
    if (tr1.startDate === tr2.startDate) {
      return tr1.endDate - tr2.endDate;
    } else {
      return tr1.startDate - tr2.startDate;
    }
  });

  return project;
}

async function projectExists(projectId) {
  logger.info(`[projectExists] - ${path.basename(__filename)}`);
  return await Project.exists({ _id: projectId });
}

async function getProjectNetwork(projectId, populate = false) {
  logger.info(`[getProjectNetwork] - ${path.basename(__filename)}`);
  if (!populate) {
    return await Project.findOne({ _id: projectId }, { sourceNetwork: 1 });
  }
  return await Project.findOne(
    { _id: projectId },
    { sourceNetwork: 1 }
  ).populate("sourceNetwork", "-edges -nodes");
}
