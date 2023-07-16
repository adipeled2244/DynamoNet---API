const { Router } = require("express");
const { userController } = require("../controllers/userController");
const userRouter = new Router();

userRouter.get("/", userController.getUsers);
userRouter.get("/:userId", userController.getUser);
userRouter.post("/", userController.addUser);
userRouter.post("/:userId/projects", userController.addProjectToUser);

module.exports = { userRouter };
