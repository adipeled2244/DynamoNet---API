const { Schema, model } = require("mongoose");
const Edge = require("./edge");

const networkSchema = new Schema(
  {
    edges: [{ type: Schema.Types.ObjectId, ref: "Edge" }],
    networkType: { type: String, required: true },
  },
  { collection: "networks" }
);

const Network = model("Network", networkSchema);
module.exports = Network;
