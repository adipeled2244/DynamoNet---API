const { Schema, model } = require("mongoose");

const networkSchema = new Schema(
  {
    networkMetrics: { type: Map, of: Object },
    metricsPerEdgeType: { type: Map, of: Object, default: {} },
    nodeMetrics: { type: Map, of: Object },
    nodes: { type: [String], required: true },
    communities: { type: Map, of: Array, default: {} },
    communitiesPerEdgeType: { type: Map, of: Object, default: {} },
    centralNodes: { type: Map, of: Array, default: {} },
    edges: [{ type: Schema.Types.ObjectId, ref: "Edge" }],
    nodePositions: { type: Map, of: Object },
  },
  { collection: "networks" }
);

const Network = model("Network", networkSchema);
module.exports = Network;
