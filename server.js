const express = require("express");
const { authRouter } = require("./routers/authRouter");
const { projectRouter } = require("./routers/projectRouter");
const { userRouter } = require("./routers/userRouter");
const winston = require("winston");
const moment = require("moment");
const path = require("path");
const { networkRouter } = require("./routers/networkRouter");
const { edgeRouter } = require("./routers/edgeRouter");
const { nodeRouter } = require("./routers/nodeRouter");
const { timeRangeRouter } = require("./routers/timeRangeRouter");
const { graphRouter } = require("./routers/graphRouter");
const authJwt = require("./middlewares/authJwt");

const app = express();
const port = process.env.PORT || 3000;
const sizeLimit = 50 * 1024 * 1024; // 50MB

app.use(express.json({ limit: sizeLimit }));
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

const logger = winston.createLogger({
  level: "debug",
  format: winston.format.simple(),
  transports: [new winston.transports.File({ filename: "logs/dev.log" })],
});

app.use("/", (req, res, next) => {
  logger.info(` ${req.method} |  ${req.url}  | ${moment()}  `);
  next();
});

app.use("/api/auth", authRouter);
app.use(authJwt.verifyToken);

app.use("/api/projects", projectRouter);
app.use("/api/users", userRouter);
app.use("/api/networks", networkRouter);
app.use("/api/edges", edgeRouter);
app.use("/api/nodes", nodeRouter);
app.use("/api/timeRanges", timeRangeRouter);
app.use("/api/graphs", graphRouter);

app.use((req, res) => {
  res.status(404).send(`Page not found`);
});

app.listen(port, () =>
  console.log(`Express server is running on port ${port}`)
);
