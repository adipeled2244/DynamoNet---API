const graphService = require("../services/graphService");
const logger = require("../helpers/winston");
const path = require("path");

exports.graphController = {
  updateLayout: async (req, res) => {
    try {
      const graphId = req.params.graphId;
        const result = await graphService.updateLayout(graphId);
        res.status(200).json(result);
    } catch (err) {
      logger.error(err);
      res.status(500).json({ message: err.message });
    }
  },
};
