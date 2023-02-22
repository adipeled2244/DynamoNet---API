const express = require("express");
const {authRouter} = require("./routers/authRouter");
const {projectRouter} = require("./routers/projectRouter");
const {userRouter} = require("./routers/userRouter");
const winston = require('winston');
const moment=require('moment');
const path = require("path");
const { networkRouter } = require("./routers/networkRouter");
const { edgeRouter } = require("./routers/edgeRouter");

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.simple(),
    transports: [
        new winston.transports.File({ filename: 'logs/dev.log' }),
    ],
});

app.use('/', (req, res,next) => {
    logger.info(` ${req.method} |  ${req.url}  | ${ moment()}  `);
    next();
});

app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/users', userRouter);
app.use('/api/networks', networkRouter);
app.use('/api/edges', edgeRouter);

app.use((req, res) => {
    res.status(404).send(`Page not found`);
});

app.listen(port, () => console.log(`Express server is running on port ${port}`));