const { Schema, model } = require("mongoose");

const networkSchema = new Schema(
  {
    networkMetrics: { type: Map, of: Object },
    retweetNetworkMetrics: { type: Map, of: Object },
    quoteNetworkMetrics: { type: Map, of: Object },
    nodeMetrics: { type: Map, of: Object },
    nodes: { type: [String], required: true },
    retweetCommunities: { type: Map, of: Array, default: {} },
    quoteCommunities: { type: Map, of: Array, default: {} },
    communities: { type: Map, of: Array, default: {} },
    edges: [{ type: Schema.Types.ObjectId, ref: "Edge" }],
    nodePositions: { type: Map, of: Object },
  },
  { collection: "networks" }
);

const Network = model("Network", networkSchema);
module.exports = Network;
