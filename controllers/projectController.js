const projectService = require("../services/projectService");
const networkService = require("../services/networkService");
const logger = require("../helpers/winston");
const path = require("path");
const { spawn } = require("child_process");
const { isErrored } = require("stream");
const userService = require("../services/userService");
const ObjectId = require("mongoose").Types.ObjectId;

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
        return res.status(404).json({ error: "Cannot get project: project not found" });
      }
    } catch (err) {
      res
        .status(500)
        .send({ error: `Cannot get project, please try again later` });
      return;
    }
  },
  async getProjects(req, res) {
    logger.info(`[getProjects] - ${path.basename(__filename)}`);
    let projects;
    try {
      projects = await projectService.getProjects();
      res.status(200).json({ projects });
      return;
    } catch (err) {
      res.status(500).json({ error: `Cannot get projects, please try again later` });
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
   * @param {string} req.body.userId // not part of the project schema
   * @param {string} req.body.userEmail // not part of the project schema -- optional
   * @param {string} req.body.limit // not part of the project schema -- optional
   *
   */
  async addProject(req, res) {
    logger.info(`[addProject] - ${path.basename(__filename)}`);
    const projectParams = req.body;
    const userId = projectParams.userId;
    const userEmail = projectParams.userEmail;
    if (!projectParams) {
      res.status(400).send({ error: "Cannot add new project: invalid params sent" });
    }
    projectParams.createdDate = Date.now();
    if (
      !projectParams.favoriteNodes ||
      projectParams.favoriteNodes.length === 0
    ) {
      projectParams.favoriteNodes = projectParams.dataset;
    }
    try {
      const newProject = await projectService.addProject(projectParams);
      const pythonArguments = [
        "./python/virtual_twitter.py",
        `--project_id=${newProject._id}`,
        `--user_email=${userEmail}`,
      ];
      if (projectParams.limit !== undefined) {
        pythonArguments.push(`--limit=${projectParams.limit}`);
      }
      logger.info(`PYTHON import arguments: ${pythonArguments}`);
      const pythonProcess = spawn(
        "python",
        pythonArguments,
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
      // TODO: needs fixing - updateUser recieves user id and params object:change this id to currentUserId when we will do autheniccation
      //add projectRef to user projects
      const updateUserRes = await userService.updateUser(
        ObjectId("63f54084512dd78a25a3646a"),
        newProject._id
      );

      res.status(200).json({ project: newProject });
    } catch (err) {
      res.status(400).json({ error: "Cannot add new project, please try again" });
      return;
    }
  },
  async updateProject(req, res) {
    logger.info(`[updateProject] - ${path.basename(__filename)}`);
    const projectIdParam = req.params.projectId;
    const projectParams = req.body;
    let project;

    try {
      project = await projectService.updateProject(
        projectIdParam,
        projectParams
      );
      if (project) {
        return res.status(200).json({ project });
      } else {
        return res.status(404).json({ error: "Cannot update project: project not found" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ error: `Cannot update project, please try again later` });
      return;
    }
  },
  async deleteProject(req, res) {
    logger.info(`[deleteProject] - ${path.basename(__filename)}`);
    const projectIdParam = req.params.projectId;
    let deleteResult;
    try {
      //deleteResult = await projectService.deleteProject(projectIdParam);
      return res.status(200).json({ message: `Project deleted successfully` });
    } catch (err) {
      res
        .status(500)
        .json({ error: `Cannot delete project, please try again later` });
      return;
    }
  },

  async addFavoriteNode(req, res) {
    logger.info(`[addFavoriteNode] - ${path.basename(__filename)}`);
    const projectIdParam = req.params.projectId;
    const usernameParam = req.params.username;
    let addResult;
    try {
      const project = await projectService.getProject(projectIdParam, false);
      if (!project) {
        return res.status(404).json({ error: "Cannot add new favorite node: Project not found" });
      }
      const node = await networkService.getNode(
        project.sourceNetwork,
        usernameParam
      );
      if (!node) {
        //not fount in the project
        return res.status(404).json({ error: `Username: ${usernameParam} not found in this project` });
      }
      const nodeAlreadyExist = await projectService.getFavoriteNode(
        projectIdParam,
        usernameParam
      );
      if (!nodeAlreadyExist) {
        addResult = await projectService.addFavoriteNode(
          projectIdParam,
          usernameParam
        );
      } else {
        return res.status(404).json({
          error: `Username : ${usernameParam} already exist in favorite Nodes`,
        });
      }
    } catch (err) {
      res.status(500).json({
        error: `Cannot add new favorite node: ${usernameParam} `,
      });
      return;
    }

    const pythonProcess = spawn(
      "python",
      [
        "./python/add_node_metrics.py",
        `--project_id=${projectIdParam}`,
        `--screen_name=${usernameParam}`,
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

    if (addResult.matchedCount == 1) {
      return res.status(200).json({ message: "New favorite node added" });
    } else {
      return res
        .status(404)
        .json({ error: `Cannot add new favorite node: ${usernameParam}, please try again later` });
    } //ProjectId or Favorite node not found
  },

  async removeFavoriteNode(req, res) {
    logger.info(`[removeFavoriteNode] - ${path.basename(__filename)}`);
    const projectIdParam = req.params.projectId;
    const usernameParam = req.params.username;
    let deleteResultA = null;
    let deletePromises = [];
    try {
      deletePromises.push(
        projectService.removeFavoriteNodeFromFavoriteNodes(
          projectIdParam,
          usernameParam
        )
      );
      deletePromises.push(
        projectService.removeFavoriteNodeFromTimeRangesNetwork(
          projectIdParam,
          usernameParam
        )
      );

      [deleteResultA] = await Promise.all(deletePromises);
    } catch (err) {
      res.status(500).json({
        error: `Cannot remove node :${usernameParam} from favorite node list  `,
      });
      return;
    }

    if (deleteResultA.matchedCount == 1) {
      return res.status(200).json({ message: "favorite node remove" });
    } else {
      return res.status(404).json({ error: `Cannot remove node ${usernameParam} from favorite node list. ` });
    }
  },
  async getProjectWithTimeRanges(req, res) {
    logger.info(`[getProjectWithTimeRanges] - ${path.basename(__filename)}`);
    const projectIdParam = req.params.projectId;
    let project;
    try {
      project = await projectService.getProjectWithTimeRanges(projectIdParam);
    } catch (err) {
      res.status(500).json({
        error: `Cannot get this project, please try again later`,
      });
      return;
    }

    if (project) {
      return res.status(200).json({ project: project });
    } else {
      return res.status(404).json({ error: "Project not found" });
    }
  },
};
