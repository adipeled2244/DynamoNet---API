const { Schema, model } = require("mongoose");

const networkSchema = new Schema(
  {
    edges: [{ type: Schema.Types.ObjectId, ref: "Edge" }],
    networkType: { type: String, required: true },
    numberOfNodes: { type: Number },
    numberOfEdges: { type: Number },
    density: { type: Number },
    diameter: { type: Number },
    radius: { type: Number },
    reciprocity: { type: Number },
    periphery: { type: Number },
    clustetingCoefficient: { type: Number },
  },
  { collection: "networks" }
);

const Network = model("Network", networkSchema);
module.exports = Network;
