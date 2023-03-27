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
      return res.status(400).json({ message: "Email already exists" });
    }
    try {
      const salt = await bcrypt.genSalt(saltRounds);
      const hashedPassword = await bcrypt.hash(userParams.password, salt);
      userParams.password = hashedPassword;
    } catch (error) {
      return res.status(400).json({ message: "Password hashing failed" });
    }
    userParams.registrationDate = new Date();
    try {
      const newUser = await userService.addUser(userParams);
      newUser.password = undefined;
      res.status(200).json({ user: newUser });
    } catch (error) {
      return res.status(400).json({ message: "User creation failed" });
    }
  },
  async login(req, res) {
    logger.info(`[login] - ${path.basename(__filename)}`);
    const userParams = req.body;
    const user = await userService.getUserByEmail(userParams.email);
    if (!user) {
      return res
        .status(400)
        .json({ message: "Email or password is incorrect" });
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
      return res.status(400).json({ message: "Password hashing failed" });
    }
    const token = user.generateAuthToken();
    const tokenExp = moment().add(2, "days").toDate();
    user.token = token;
    user.tokenExp = tokenExp;
    await user.save();
    user.password = undefined;
    res.status(200).json({ user });
  },
  async logout(req, res) {
    logger.info(`[logout] - ${path.basename(__filename)}`);
    if (!req.body.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    try {
      userParams = req.body.user;
      const user = await userService.getUserByEmail(userParams.email);
      if (!user) {
        return res
          .status(400)
          .json({ message: "Email or password is incorrect" });
      }
      if (!user.tokenExp || user.tokenExp < new Date()) {
        return res.status(400).json({ message: "Token expired" });
      }
      if (!user.token || user.token !== userParams.token) {
        return res.status(400).json({ message: "Invalid token" });
      }
      user.token = null;
      user.tokenExp = null;
      await user.save();
      res.status(200).json({ message: "Logged out" });
    } catch (error) {
      return res.status(400).json({ message: "Logout failed" });
    }
  },
  async refreshToken(req, res) {
    logger.info(`[refreshToken] - ${path.basename(__filename)}`);
    const user = req.user;
    const token = user.generateAuthToken();
    res.status(200).json({ token: token });
  },
};
