const { Router } = require('express');
const { authController } = require('../controllers/authController');
const authRouter = new Router();
authRouter.post('/', authController.addAuth);

module.exports = { authRouter };