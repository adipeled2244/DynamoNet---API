const { Router } = require('express');
const { userController } = require('../controllers/userController');
const userRouter = new Router();

//userRouter.get('/', userController.getProjects);
userRouter.get('/:userId', userController.getUser);
userRouter.post('/', userController.addUser);
//userRouter.put('/:projectId', userController.updateProject);
//userRouter.delete('/:projectId', userController.deleteProject);

module.exports = { projectRouter };