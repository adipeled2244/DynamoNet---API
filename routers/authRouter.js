const { Router } = require("express");
const { authController } = require("../controllers/authController");
const authRouter = new Router();

authRouter.post("/login", authController.login);
authRouter.post("/register", authController.register);
authRouter.post("/logout", authController.logout);
// authRouter.post("/refresh-token", authController.refreshToken);

module.exports = { authRouter };
