const { Router } = require('express');
const { projectController } = require('../controllers/projectController');
const projectRouter = new Router();

projectRouter.get('/', projectController.getProjects);
projectRouter.get('/:projectId', projectController.getProject);
projectRouter.post('/', projectController.addProject);
projectRouter.patch('/:projectId', projectController.updateProject);
projectRouter.delete('/:projectId', projectController.deleteProject);

module.exports = { projectRouter };