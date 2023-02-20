const moment = require('moment');
const fs = require('fs');


class Logger {
    constructor(name_user, pathLogs = './logs/logs.txt', pathError = './logs/error.txt') {
        this.name = name_user;
        this.pathLogs = pathLogs;
        this.pathError = pathError;

        try {
            this.loggerStream = fs.createWriteStream(this.pathLogs, { flags: 'a+' });
            this.errorStream = fs.createWriteStream(this.pathError, { flags: 'a+' });
        } catch (err) {
            console.err("Cant open file");
        }
    }

    warn(str) {
        this.loggerStream.write(` "Warn:" [${this.name }][${str}]  [${ moment()}]\n`);
    }

    log(str) {
        this.loggerStream.write(`  [${this.name }][${str}]  [${ moment()}]\n`);
    }

    error(str) {
        this.errorStream.write(` "Error:" [${this.name }][${str}]  [${ moment()}]\n`);
    }

    logDetailsReq = (req, res, next) => {
        this.loggerStream.write(` [${req.method}] [${req.path}]  [${ moment()}]\n`);
        next();
    }

}

module.exports = Logger;