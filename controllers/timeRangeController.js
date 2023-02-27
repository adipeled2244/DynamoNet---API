const projectService = require("../services/projectService");
const logger = require("../helpers/winston");
const path = require("path");
const { spawn } = require("child_process");
const { isErrored } = require("stream");
const timeRangeService = require("../services/timeRangeService");

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
        return res.status(404).json({ error: "TimeRange id not found" });
      }
    } catch (err) {
      res
        .status(500)
        .send({ error: `Error get timeRange: ${timeRangeIdParam} : ${err}` });
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
      res.status(500).json({ error: `Error get timeRanges : ${err}` });
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
      res.status(400).send({ error: "invalid params" });
    }
    try {
      const { projectId, networkId, edgeType, timeWindows } = timeRangeParams;
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
      res.status(400).json({ error: ` ${err}` });
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
        error: `Error deleting time range ${timeRangeIdParam} for project ${projectIdParam} : ${err}`,
      });
      return;
    }
  },
};
