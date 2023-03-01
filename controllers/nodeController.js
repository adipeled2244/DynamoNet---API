const nodeService = require("../services/nodeService");
const logger = require("../helpers/winston");
const path = require("path");

exports.nodeController = {
  async getNode(req, res) {
    logger.info(`[getNode] - ${path.basename(__filename)}`);
    let node;
    const screenName = req.params.nodeId;
    try {
      node = await nodeService.getNode(screenName);
      if (node) {
        return res.status(200).json({ node });
      } else {
        return res.status(404).json({ error: "Node id not found" });
      }
    } catch (err) {
      res.status(500).send({ error: `Error get node: ${screenName} : ${err}` });
      return;
    }
  },

  async getNodes(req, res) {
    logger.info(`[getNodes] - ${path.basename(__filename)}`);
    const ids = req.query.ids;
    if (!ids || ids.length == 0) {
      return res.status(400).json({ error: "No ids provided" });
    }
    const screenNames = ids.split(",");
    let nodes;
    try {
      nodes = await nodeService.getNodes(screenNames);
      res.status(200).json({ nodes });
    } catch (err) {
      res.status(500).json({ error: `Error get nodes : ${err}` });
      return;
    }
  },

  //TO DO: Change according to noor
  async addNode(req, res) {
    logger.info(`[addNode] - ${path.basename(__filename)}`);
    const nodeParams = req.body;

    try {
      const newNode = await nodeService.addNode(nodeParams);
      res.status(200).json({ node: newNode });
    } catch (err) {
      res.status(400).json({ error: ` ${err}` });
      return;
    }
  },
  async updateNode(req, res) {
    logger.info(`[updateNode] - ${path.basename(__filename)}`);
    const nodeIdParam = req.params.nodeId;
    const nodeParams = req.body;
    let updateResult;

    try {
      updateResult = await nodeService.updateNode(nodeIdParam, nodeParams);
      if (updateResult.matchedCount == 1) {
        return res.status(200).json({ message: "Node updated" });
      } else {
        return res.status(404).json({ error: "Node id not found" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ error: `Error update node ${nodeIdParam} : ${err}` });
      return;
    }
  },
  async deleteNode(req, res) {
    logger.info(`[deleteNode] - ${path.basename(__filename)}`);
    const nodeIdParam = req.params.nodeId;
    let deleteResult;
    try {
      deleteResult = await nodeService.deleteNode(nodeIdParam);
      return res.status(200).json({ message: `Node deleted` });
    } catch (err) {
      res
        .status(500)
        .json({ error: `Error deleting node ${nodeIdParam} : ${err}` });
      return;
    }
  },
};
