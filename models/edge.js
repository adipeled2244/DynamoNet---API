const { Schema, model } = require("mongoose");

const edgeSchema = new Schema(
  {
    source: { type: String, required: true },
    destination: { type: String, required: true },
    edgeContent: { type: String, required: true },
    timestamp: { type: Date },
    edgeType:{type: String, required: true}
  },
  { collection: "edges" }
);

const Edge = model("Edge", edgeSchema);
module.exports = Edge;
