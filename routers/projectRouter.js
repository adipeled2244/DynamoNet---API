const { Router } = require('express');
const { projectController } = require('../controllers/projectController');
const projectRouter = new Router();

//projectRouter.get('/', projectsController.getProjects);
projectRouter.get('/:projectId', projectController.getProjectByProjectId);
projectRouter.post('/', projectController.addProject);
//projectRouter.put('/:projectId', projectsController.updateProject);
//projectRouter.delete('/:projectId', projectsController.deleteProject);

module.exports = { projectRouter };