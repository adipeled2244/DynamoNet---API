const projectService = require("../services/projectService");
const logger = require("../helpers/winston");
const path = require("path");
const { spawn } = require("child_process");
const { isErrored } = require("stream");
const timeRangeService = require("../services/timeRangeService");
const { ProjectStatus } = require("../constants");

exports.timeRangeController = {
  async getTimeRange(req, res) {
    logger.info(`[getTimeRange] - ${path.basename(__filename)}`);
    let timeRange;
    const timeRangeIdParam = req.params.timeRangeId;
    try {
      timeRange = await timeRangeService.getTimeRange(timeRangeIdParam);
      if (timeRange) {
        return res.status(200).json({ timeRange });
      } else {
        return res.status(404).json({ error: "Cannot get time range: time range not found" });
      }
    } catch (err) {
      res
        .status(500)
        .send({ error: `Cannot get time range, please try again later` });
      return;
    }
  },
  async getTimeRangeWithNetwork(req, res) {
    logger.info(`[getTimeRangeWithNetwork] - ${path.basename(__filename)}`);
    let timeRange;
    const timeRangeIdParam = req.params.timeRangeId;
    try {
      timeRange = await timeRangeService.getTimeRangeWithNetwork(
        timeRangeIdParam
      );
      if (timeRange) {
        return res.status(200).json({ timeRange });
      } else {
        return res.status(404).json({ error: "Cannot get time range: time range not found" });
      }
    } catch (err) {
      res
        .status(500)
        .send({ error: `Cannot get time range, please try again later` });
      return;
    }
  },
  async getTimeRanges(req, res) {
    logger.info(`[getTimeRange] - ${path.basename(__filename)}`);
    let timeRanges;
    try {
      timeRanges = await timeRangeService.getTimeRanges();
      res.status(200).json({ timeRanges });
    } catch (err) {
      res.status(500).json({ error: `Cannot get time ranges, please try again later` });
      return;
    }
  },

  /**
   *
   * @param {*} req
   * @param {*} res
   * @param {*} req.body { projectId, networkId, edgeType, timeWindows }
   * @param {*} req.body.timeWindows [{'startDate': Date, 'endDate': Date},...]
   * @returns
   */
  async addTimeRanges(req, res) {
    logger.info(`[addTimeRange] - ${path.basename(__filename)}`);
    const timeRangeParams = req.body;

    if (!timeRangeParams) {
      res.status(400).send({ error: "Cannot add new time range: invalid params sent" });
    }
    try {
      const { projectId, networkId, edgeType, timeWindows } = timeRangeParams;
      await projectService.updateProject(projectId, {
        status: ProjectStatus.CREATING_TIME_RANGES,
      });
      const favoriteNodes = await projectService.getFavoriteNodes(projectId);

      const pythonProcess = spawn(
        "python",
        [
          "./python/create_time_ranges.py",
          `--project_id=${projectId}`,
          `--network_id=${networkId}`,
          `--favorite_nodes=${JSON.stringify(favoriteNodes.favoriteNodes)}`,
          `--edgeType=${edgeType}`,
          `--time_windows=${JSON.stringify(timeWindows)}`,
        ],
        (options = { detached: true })
      );
      pythonProcess.unref();
      pythonProcess.stdout.on("data", (data) => {
        logger.info(`PYTHON TR stdout:${data}`);
      });
      pythonProcess.stderr.on("data", (data) => {
        logger.error(`PYTHON TR stderr: ${data}`);
      });
      pythonProcess.on("close", (data) => {
        try {
          logger.info(`PYTHON TR close stdout: ${data}`);
        } catch (err) {
          logger.error(`PYTHON TR close stderr: ${err}`);
        }
      });
      res.status(200).json({ message: "Data processing " });
    } catch (err) {
      res.status(400).json({ error: `Cannot add new time ranges, please try again later` });
      return;
    }
  },

  async deleteTimeRange(req, res) {
    logger.info(`[deleteTimeRange] - ${path.basename(__filename)}`);
    //noy sent it in url params
    const timeRangeIdParam = req.params.timeRangeId;
    const projectIdParam = req.params.projectId;

    let deleteResult;
    try {
      deleteResult = await timeRangeService.deleteTimeRange(
        timeRangeIdParam,
        projectIdParam
      );
      return res.status(200).json({ message: `Time Range deleted` });
    } catch (err) {
      res.status(500).json({
        error: `Cannot delete time range, please try again later`,
      });
      return;
    }
  },
  async deleteTimeRanges(req, res) {
    logger.info(`[deleteTimeRanges] - ${path.basename(__filename)}`);
    const projectId = req.body.projectId;
    const timeRanges = req.body.timeRanges;
    if (!timeRanges || !projectId) {
      res.status(400).send({ error: "Cannot delete time ranges: invalid params sent" });
    }
    let deleteResult;
    try {
      deleteResult = await timeRangeService.deleteTimeRanges(
        timeRanges,
        projectId
      );
      return res.status(200).json({ message: `Time Ranges deleted` });
    } catch (err) {
      res.status(500).json({
        error: `Cannot delete time ranges, please try again later`,
      });
      return;
    }
  },
  async updateTimeRange(req, res) {
    logger.info(`[updateTimeRange] - ${path.basename(__filename)}`);
    const timeRangeParams = req.body;
    const timeRangeIdParam = req.params.timeRangeId;
    const projectIdParam = req.params.projectId;
    if (!timeRangeParams || !timeRangeIdParam || !projectIdParam) {
      res.status(400).send({ error: "Cannot update time range: invalid params sent" });
    }
    let updateResult;
    try {
      updateResult = await timeRangeService.updateTimeRange(
        timeRangeIdParam,
        projectIdParam,
        timeRangeParams
      );
      return res.status(200).json({ message: `Time Range updated` });
    } catch (err) {
      res.status(500).json({
        error: `Cannot update time range, please try again later`,
      });
      return;
    }
  },
};
