const User = require("../models/user");
const moment = require("moment");
const logger = require("../helpers/winston");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const userService = require("../services/userService");
const path = require("path");

exports.authController = {
  async signUp(req, res) {
    const userParams = req.body;

    // check if user exist
    try {
      const user = await userService.getUserByEmail(userParams.email);
      console.log(user)
      if (user) {
        res.status(400).json({ error: `User already exist` });
        return;
      }
    } catch (err) {
      res
        .status(500)
        .json({ error: `Error get user: ${userParams.email} : ${err}` });
      return;
    }
    // if user does not exist, create new user
    const salt = bcrypt.genSaltSync(saltRounds);
    const newUser = new User({
      email: userParams.email,
      name: userParams.name,
      registrationDate: moment().format("YYYY-MM-DD HH:mm:ss"),
      salt: salt,
      password: bcrypt.hashSync(userParams.password, salt),
    });
    // save new user
    try {
      const user = await userService.addUser(newUser);
      res.status(200).json({ user: user });
    } catch (err) {
      res.status(400).json({ error: ` ${err}` });
      return;
    }
  },
  async signIn(req, res) {
    const userParams = req.body;
    const email = userParams.email;
    const password = userParams.password;
    // check if user exist
    try {
      const user = await userService.getUserByEmail(email);
      if (!user) {
        res.status(400).json({ error: `User does not exist` });
        return;
      }
    } catch (err) {
      res.status(500).json({ error: `Error get user: ${email} : ${err}` });
      return;
    }
    // if user exist, check password
    try {
      const user = await userService.getUserByEmail(email);
      const hash = bcrypt.hashSync(password, user.salt);
      if (hash === user.password) {
        res.status(200).json({ user: user });
      } else {
        res.status(400).json({ error: `Wrong password` });
      }
    } catch (err) {
      res.status(500).json({ error: `Error get user: ${email} : ${err}` });
      return;
    }
  },
};
