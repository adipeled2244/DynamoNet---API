const { Schema, model } = require("mongoose");

const nodeSchema = new Schema(
  {
    twitterId: { type: String, unique: true, index: true },
    name: { type: String },
    screenName: { type: String },
    location: { type: String },
    description: { type: String },
    followersCount: { type: Number },
    friendsCount: { type: Number },
    statusesCount: { type: Number },
    registrationDateTwitter: { type: Date },
  },
  { collection: "nodes" }
);

const Node = model("Node", nodeSchema);
module.exports = Node;
