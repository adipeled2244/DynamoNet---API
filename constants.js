module.exports = {
  DB_HOST: process.env.DB_HOST,
  DB_USER: process.env.DB_USER,
  DB_PASS: process.env.DB_PASS,
  ProjectStatus: {
    IN_PROGRESS: "in progress",
    READY: "ready",
    CREATING_TIME_RANGES: "creating time ranges",
    CALCULATING_NODE_METRICS: "calculating node metrics",
    FAILED: "failed",
  },
};
