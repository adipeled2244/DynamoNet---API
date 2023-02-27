const { Schema, model } = require("mongoose");

const networkSchema = new Schema(
  {
    networkMetrics: { type: Map, of: Object },
    retweetNetworkMetrics: { type: Map, of: Object },
    quoteNetworkMetrics: { type: Map, of: Object },
    nodeMetrics: { type: Map, of: Object },
    nodes: { type: [String], required: true },
    edges: [{ type: Schema.Types.ObjectId, ref: "Edge" }],
  },
  { collection: "networks" }
);

const Network = model("Network", networkSchema);
module.exports = Network;
