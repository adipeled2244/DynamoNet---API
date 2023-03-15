const { Router } = require("express");
const { graphController } = require("../controllers/graphController");
const graphRouter = new Router();

graphRouter.patch("/:graphId", graphController.updateLayout);

module.exports = { graphRouter };
