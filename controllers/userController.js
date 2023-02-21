const userService = require("../services/userService");
const path = require("path");
const logger = require("../helpers/winston");

exports.userController = {
  async getUser(req, res) {
    logger.info(`[getUser] - ${path.basename(__filename)}`);
    let user;
    const userIdParam = req.params.userId;
    try {
      user = await userService.getUser(userIdParam);
      if (user) {
        return res.status(200).json({ user });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (err) {
      res
        .status(500)
        .send({ error: `Error get user: ${userIdParam} : ${err}` });
      return;
    }
  },


  async addProjectToUser(req, res) {
    logger.info(`[addProjectToUser] - ${path.basename(__filename)}`);
    let result;
    const params=req.body.projectRef;
    const userIdParam = req.params.userId;
    try {
      result = await userService.addProjectToUser(userIdParam,params);
      if (result.matchedCount==1) {
        return res.status(200).json({ message: "add success" });
      } else {
        return res.status(404).json({ error: "User not found" });
      }
    } catch (err) {
      res
        .status(500)
        .send({ error: `Error add project to user: ${userIdParam} : ${err}` });
      return;
    }
  },
  async addUser(req, res) {
    logger.info(`[addUser] - ${path.basename(__filename)}`);
    const userParams = req.body;

    if (!userParams) {
      res.status(400).send({ error: "invalid params" });
    }
    userParams.registrationDate = Date.now();
    try {
      const newUser = await userService.addUser(userParams);
      res.status(200).json({ user: newUser });
    } catch (err) {
      res.status(400).json({ error: ` ${err}` });
      return;
    }
  },

  async getUsers(req, res) {
    logger.info(`[getUsers] - ${path.basename(__filename)}`);
    let users;
    try {
        users = await userService.getUsers();
        res.status(200).json({users})
    } catch (err) {
        res.status(500).json({ error: `Error get users : ${err}` });
        return;
    }
},

  async updateUser(req, res) {
    logger.info(`[updateUser] - ${path.basename(__filename)}`);
    const userIdParam = req.params.userId;
    const userParams = req.body;
    let updateResult;

    try {
      updateResult = await userService.updateUser(userIdParam, userParams);
      if (updateResult.matchedCount == 1) {
        return res.status(200).json({ message: "User updated" });
      } else {
        return res.status(404).json({ error: "User id not found" });
      }
    } catch (err) {
      res
        .status(500)
        .json({ error: `Error update user ${userIdParam} : ${err}` });
      return;
    }
  },
  async deleteUser(req, res) {
    logger.info(`[deleteUser] - ${path.basename(__filename)}`);
    const userIdParam = req.params.userId;
    let deleteResult;
    try {
      deleteResult = await userService.deleteUser(userIdParam);
      return res.status(200).json({ message: `User deleted` });
    } catch (err) {
      res
        .status(500)
        .json({ error: `Error deleting user ${userIdParam} : ${err}` });
      return;
    }
  },
};
