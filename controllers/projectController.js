const projectService = require("../services/projectService");
const logger = require("../helpers/winston");
const path = require("path");
const { spawn } = require("child_process");
const { isErrored } = require("stream");
const userService = require("../services/userService");

exports.projectController = {
  async getProject(req, res) {
    logger.info(`[getProject] - ${path.basename(__filename)}`);
    let project;
    const projectIdParam = req.params.projectId;
    try {
      project = await projectService.getProject(projectIdParam);
      if (project) {
        return res.status(200).json({ project });
      } else {
        return res.status(404).json({ error: "Project id not found" });
      }
    } catch (err) {
      res
        .status(500)
        .send({ error: `Error get project: ${projectIdParam} : ${err}` });
      return;
    }
  },

  async getProjects(req, res) {
    logger.info(`[getProjects] - ${path.basename(__filename)}`);
    let projects;
    try {
      projects = await projectService.getProjects();
      res.status(200).json({ projects });
    } catch (err) {
      res.status(500).json({ error: `Error get projects : ${err}` });
      return;
    }
  },

  //TO DO: Change according to noor
  /**
   * @param {Object} req
   * @param {Object} res
   * @param {string} req.body.title
   * @param {string} req.body.description
   * @param {string} req.body.dataset
   * @param {string} req.body.startDate
   * @param {string} req.body.endDate
   * @param {string} req.body.edgeType
   * @param {string} req.body.timeRanges // optional
   * @param {string} req.body.networks // optional
   * @param {string} req.body.userId // not part of the project schema
   * @param {string} req.body.userEmail // not part of the project schema -- optional
   *
   */
  async addProject(req, res) {
    logger.info(`[addProject] - ${path.basename(__filename)}`);
    const projectParams = req.body;
    const userId = projectParams.userId;
    const userEmail = projectParams.userEmail;
    if (!projectParams) {
      res.status(400).send({ error: "invalid params" });
    }
    projectParams.createdDate = Date.now();
    try {
      const newProject = await projectService.addProject(projectParams);

      const pythonProcess = spawn(
        "python",
        [
          "./python/virtual_twitter.py",
          `--project_id=${newProject._id}`,
          `--user_email=${userEmail}`,
        ],
        (options = {
          detached: true,
        })
      );
      pythonProcess.unref();
      pythonProcess.stdout.on("data", (data) => {
        logger.info(`PYTHON import stdout: ${data}`);
      });
      pythonProcess.stderr.on("data", (data) => {
        logger.error(`PYTHON import stderr: ${data}`);
      });
      pythonProcess.on("close", (data) => {
        try {
          logger.info(`PYTHON import close stdout: ${data}`);
        } catch (err) {
          logger.error(`PYTHON import close stderr: ${err}`);
        }
      });
      // TODO: needs fixing - updateUser recieves user id and params object
      //add projectRef to user projects
      const updateUserRes = await userService.updateUser(newProject._id);

      res.status(200).json({ project: newProject });
    } catch (err) {
      res.status(400).json({ error: ` ${err}` });
      return;
    }
  },
  async updateProject(req, res) {
    logger.info(`[updateProject] - ${path.basename(__filename)}`);
    const projectIdParam = req.params.projectId;
    const projectParams = req.body;
    let updateResult;

    try {
      updateResult = await projectService.updateProject(
        projectIdParam,
        projectParams
      );
      if (updateResult.matchedCount == 1) {
        return res.status(200).json({ message: "Project updated" });
      } else {
        return res.status(404).json({ error: "Project id not found" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ error: `Error update project ${projectIdParam} : ${err}` });
      return;
    }
  },
  async deleteProject(req, res) {
    logger.info(`[deleteProject] - ${path.basename(__filename)}`);
    const projectIdParam = req.params.projectId;
    let deleteResult;
    try {
      deleteResult = await projectService.deleteProject(projectIdParam);
      return res.status(200).json({ message: `Project deleted` });
    } catch (err) {
      res
        .status(500)
        .json({ error: `Error deleting project ${projectIdParam} : ${err}` });
      return;
    }
  },
};
