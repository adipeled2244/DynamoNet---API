const Project = require("../models/project");
const logger = require("../helpers/winston");
const path = require("path");

module.exports = {
  addProject,
  updateProject,
  getProjectByUserId,
  getProject,
  deleteProject,
  getProjects,
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
  return await Project.deleteOne({ _id: projectId });
}
