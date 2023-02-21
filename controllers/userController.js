const userService = require('../services/userService')
const path = require('path');

const logger= require('../helpers/winston')

exports.userController = {
    async getUser(req, res) {
        let user;
        const userIdParam = req.params.userId;
        try {
            user = await userService.getUser(userIdParam);
            res.status(200).json({user})
        } catch (err) {
            res.status(500).send({ error: `Error get user: ${userIdParam} : ${err}` });
            return;
        }
    },

    //signup
    async addUser(req, res) {
        const userParams = req.body;
        if(!userParams){
            res.status(400).send({error: 'invalid params'})
        }       
        userParams.registrationDate =  Date.now();
        try {
            const newUser = await userService.addUser(userParams);
            res.status(200).json({user: userParams});
        } catch (err) {
            res.status(400).json({ error: ` ${err}` });
            return;
        }
    },
    async updateUser(req, res) {

        let updateResult;

        if (!req.body.flightDate || !req.body.origin || !req.body.destination) {
            res.status(400).json({ error: `Parameters for update  are missing` });
            return;
        }

        try {
            updateResult = await Flight.updateOne({ flightId: req.params.flightId }, { flightDate: req.body.flightDate, origin: req.body.origin, destination: req.body.destination });
        } catch (err) {
            res.status(500).json({ error: `Error update flight ${req.params.flightId} : ${err}` });
            return;
        }

        if (updateResult.matchedCount == 1) {
            res.status(200).json({ message: "The flight updated" });
        } else {
            res.status(404).json({ error: "Flight id not found" });
        }

    },
 
    async updateUser(req, res) {
        logger.info(`[updateUser] - ${path.basename(__filename)}`);
        const userIdParam = req.params.userId;
        const  userParams = req.body;
        let updateResult;

        try {
            updateResult = await userService.updateUser(userIdParam,userParams);
            if (updateResult.matchedCount == 1) {
                return res.status(200).json({ message:"User updated"});
            } else {
                return res.status(404).json({ error: "User id not found" });
            }
        } catch (err) {
            res.status(500).json({ error: `Error update user ${userIdParam} : ${err}` });
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
            res.status(500).json({ error: `Error deleting user ${userIdParam} : ${err}` });
            return;
        }
    }
 
};