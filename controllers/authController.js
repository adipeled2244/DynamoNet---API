const User = require("../models/user");
const moment = require("moment");
const logger = require("../helpers/winston");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const userService = require("../services/userService");
const path = require("path");

exports.authController = {
  async register(req, res) {
    logger.info(`[register] - ${path.basename(__filename)}`);
    const userParams = req.body;
    const user = await userService.getUserByEmail(userParams.email);
    if (user) {
      return res.status(400).json({ error: "Email already exists" });
    }
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(userParams.password, salt);
      userParams.password = hashedPassword;
    } catch (error) {
      return res.status(400).json({ error: "Password hashing failed" });
    }
    userParams.registerationDate = moment().format("YYYY-MM-DD HH:mm:ss");
    const newUser = await userService.addUser(userParams);
    // remove password from response
    newUser.password = undefined;
    res.status(200).json({ user: newUser });
  },
  async login(req, res) {
    logger.info(`[login] - ${path.basename(__filename)}`);
    const userParams = req.body;
    const user = await userService.getUserByEmail(userParams.email);
    if (!user) {
      return res.status(400).json({ error: "Email or password is incorrect" });
    }
    try {
      const isPasswordValid = await bcrypt.compare(
        userParams.password,
        user.password
      );
      if (!isPasswordValid) {
        return res
          .status(400)
          .json({ error: "Email or password is incorrect" });
      }
    } catch (error) {
      return res.status(400).json({ error: "Password hashing failed" });
    }
    const token = user.generateAuthToken();
    res.status(200).json({ token: token });
  },
  async logout(req, res) {
    logger.info(`[logout] - ${path.basename(__filename)}`);
    const user = req.user;
    user.token = null;
    user.tokenExp = null;
    await user.save();
    res.status(200).json({ message: "Logged out" });
  },
  async refreshToken(req, res) {
    logger.info(`[refreshToken] - ${path.basename(__filename)}`);
    const user = req.user;
    const token = user.generateAuthToken();
    res.status(200).json({ token: token });
  },
};
