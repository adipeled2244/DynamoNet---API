const User = require("../models/user");
const moment = require("moment");
const logger = require("../helpers/winston");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const userService = require("../services/userService");
const path = require("path");
let jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_PRIVATE_KEY || "jwtPrivateKey";

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
    const token = jwt.sign(
      { _id: user._id, email: user.email },
      process.env.JWT_PRIVATE_KEY || "jwtPrivateKey",
      { expiresIn: "30d" }
    );
    user.token = token;
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
      if (userParams.token && user.token == userParams.token) {
        user.token = null;
        await user.save();
      }
      return res.status(200).json({ message: "Logged out" });
    } catch (error) {
      console.log(error);
      return res.status(400).json({ message: "Logout failed" });
    }
  },
};
