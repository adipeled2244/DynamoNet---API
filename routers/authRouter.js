const { Router } = require('express');
const { authController } = require('../controllers/authController');
const authRouter = new Router();


authRouter.post('/signup', authController.signUp);
authRouter.post('/signin', authController.signIn);

module.exports = { authRouter };