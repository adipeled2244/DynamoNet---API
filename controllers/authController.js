const User = require('../models/user');
const moment = require('moment');

exports.authController = {
    
    async addAuth(req, res) {
        const generateKey = 1 + Math.floor(Math.random() * 10000000);
        let userUpdated;

        try {
            userUpdated = await User.updateOne({ userIdCard: req.body.userIdCard }, { userDateTimeKey: moment().unix(), userKey: generateKey })
        } catch (err) {
            res.status(500).json({ Error: `Error add key ${req.params.flightId} : ${err} ` });
            return;
        }
        if (userUpdated.matchedCount == 1) {
            res.status(200).json({ message: `user ${req.body.userIdCard} your key for 10 minutes is : ${generateKey}  ` });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    }
}