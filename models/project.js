const { Schema, model } = require("mongoose");
// const mongoose = require('mongoose');
// const Network = require('./network');

const projectSchema = new Schema(
  {
    createdDate: { type: Date, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dataset: { type: [String], required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    edgeType: { type: String, required: true },
    timeRanges: [{ type: Schema.Types.ObjectId, ref: "TimeRange" }],
    networks: [{ type: Schema.Types.ObjectId, ref: "Network" }],
    favoriteNodes: [{ type: String }],
  },
  { collection: "projects" }
);

const Project = model("Project", projectSchema);
module.exports = Project;
