const networkService = require("../services/networkService");
const logger = require("../helpers/winston");
const path = require("path");
const { Worker } = require("worker_threads");

module.exports = {
  updateLayout,
};

async function updateLayout(graphId) {
  logger.info(`[updateLayout] - ${path.basename(__filename)}`);
  const network = await networkService.getNetwork(graphId);
  if (!network) {
    throw Error(`Network id : ${graphId} not found`);
  }
  if (network.nodes.length === 0 || network.edges.length === 0) {
    return { message: "Graph is empty." };
  }
  return new Promise((resolve, reject) => {
    // create a new worker thread to run updateLayout function
    const worker = new Worker(
      path.join(__dirname, "../workers/updateLayoutWorker.js"),
      {
        workerData: JSON.stringify(network),
      }
    );

    // listen for messages from the worker thread
    worker.on("message", async (result) => {
      resolve(result);
    });

    // listen for errors from the worker thread
    worker.on("error", (err) => {
      logger.error(err);
      // reject the promise with the error
      reject(err);
    });

    // listen for when the worker thread exits
    worker.on("exit", (code) => {
      if (code !== 0) {
        logger.error(new Error(`Worker stopped with exit code ${code}`));
      }
    });
  });
}
