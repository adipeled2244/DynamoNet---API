const { Router } = require("express");
const { projectController } = require("../controllers/projectController");
const projectRouter = new Router();

projectRouter.get("/", projectController.getProjects);
projectRouter.get("/:projectId", projectController.getProject);
projectRouter.get(
  "/:projectId/timeRanges",
  projectController.getProjectWithTimeRanges
);
projectRouter.post("/csv", projectController.addProjectByCSV);
projectRouter.patch("/csv/:projectId", projectController.updateProjectCSV);

projectRouter.post("/", projectController.addProject);
projectRouter.post(
  "/:projectId/favoriteNodes/:username",
  projectController.addFavoriteNode
);
projectRouter.delete(
  "/:projectId/favoriteNodes/:username",
  projectController.removeFavoriteNode
);
projectRouter.patch("/:projectId", projectController.updateProject);
projectRouter.delete("/:projectId", projectController.deleteProject);

module.exports = { projectRouter };
