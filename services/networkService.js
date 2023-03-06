const Network = require("../models/network");
const Edge = require("../models/edge");
const logger = require("../helpers/winston");
const path = require("path");
const mongoose = require("mongoose");

module.exports = {
  addNetwork,
  updateNetwork,
  getNetwork,
  getNetworks,
  deleteNetwork,
  getNode,
};
async function addNetwork(params) {
  logger.info(`[addNetwork] - ${path.basename(__filename)}`);
  params.edges = params.edges.map((id) => {
    return mongoose.Types.ObjectId(id);
  });
  // params.edges = mongoose.Types.ObjectId(params.edges)
  const newNetwork = new Network(params);
  const ans = await newNetwork.save();
  console.log("ans", ans, "\n\n");
  return ans;
}

async function updateNetwork(id, params) {
  logger.info(`[updateNetwork] - ${path.basename(__filename)}`);
  return await Network.updateOne({ _id: id }, params);
}

async function getNetwork(networkId) {
  logger.info(`[getNetwork] - ${path.basename(__filename)}`);
  return await Network.findOne({ _id: networkId }).populate("edges");
}

async function getNetworks() {
  logger.info(`[getNetwork] - ${path.basename(__filename)}`);
  return await Network.find({}).populate("edges");
}

async function deleteNetwork(networkId) {
  logger.info(`[deleteNetwork] - ${path.basename(__filename)}`);
  const network = await getNetwork(networkId);
  if (!network) {
    throw Error(`Network id : ${networkId} not found`);
  }
  const networkEdges = network.edges;
  await Edge.deleteMany({ _id: { $in: networkEdges } });
  await Network.deleteOne({ _id: networkId });
}

async function getNode(networkId, node) {
  logger.info(`[getNode] - ${path.basename(__filename)}`);
  const network = await Network.findOne({ _id: networkId }, { nodes: 1 });
  if (!network) {
    throw Error(`Network id : ${networkId} not found`);
  }
  const networkNodes = network.nodes;
  const nodeIndex = networkNodes.findIndex((n) => n === node);
  if (nodeIndex === -1) {
    throw Error(`Node : ${node} not found`);
  }
  return networkNodes[nodeIndex];
}
