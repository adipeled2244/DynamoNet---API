const { workerData, parentPort } = require("worker_threads");
const graphology = require("graphology");
const forceAtlas2 = require("graphology-layout-forceatlas2");
const { random } = require("graphology-layout");
const logger = require("../helpers/winston");
const networkService = require("../services/networkService");

async function run() {
  try {
    // const network = await networkService.getNetwork(workerData);
    // if (!network) {
    //   throw Error(`Network id : ${workerData} not found`);
    // }
    // if (network.nodes.length === 0 || network.edges.length === 0) {
    //   return { message: "Graph is empty." };
    // }
    const network = JSON.parse(workerData);
    const graph = new graphology();
    logger.info(`[updateLayoutWorker] - adding nodes`);
    network.nodes.forEach((node) => {
      if (!graph.hasNode(node)) {
        graph.addNode(node);
      }
    });
    logger.info(`[updateLayoutWorker] - adding edges`);
    network.edges.forEach((edge) => {
      if (!graph.hasEdge(edge.source, edge.destination)) {
        graph.addEdge(edge.source, edge.destination);
      }
    });
    logger.info(`[updateLayoutWorker] - assigning positions`);
    const settings = {
      iterations: 2000,
      tolerance: 0.005,
      stableIterations: 100,
      settings: {
        linLogMode: true,
        outboundAttractionDistribution: false,
        strongGravityMode: false,
        gravity: 1,
        scalingRatio: 1,
        slowDown: 10, // + Math.log10(network.nodes.length),
        barnesHutOptimize: true,
        barnesHutTheta: 0.5,
        startingIterations: 0,
        edgeWeightInfluence: 0,
        jitterTolerance: 0.05,
        jitterSpeed: 1,
        //   maxIterations: network.nodes.length,
        //   easing: "quadraticInOut",
        //   timeLimit: 60000,
        //   active: true,
        autoStop: true,
        autoStopThreshold: 0.01,
      },
    };
    random.assign(graph);
    forceAtlas2.assign(graph, settings);
    logger.info(`[updateLayoutWorker] - updating network`);
    const nodes = graph.export().nodes;
    network.nodePositions = new Map();
    nodes.forEach((node) => {
      network.nodePositions.set(node.key, [
        node.attributes.x,
        node.attributes.y,
      ]);
    });
    logger.info(`[updateLayout] - received network update result from worker`);
    parentPort.postMessage(JSON.stringify(network));
  } catch (err) {
    console.error(err);
    parentPort.postMessage({ error: err.message });
  }
}

run();
