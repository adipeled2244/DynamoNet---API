const { Schema, model } = require("mongoose");
// const mongoose = require('mongoose');
// const Network = require('./network');

const projectSchema = new Schema(
  {
    createdDate: { type: Date, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dataset: { type: [String] ,default: []},
    keywords: { type: [String] ,default: []},
    startDate: { type: Date },
    endDate: { type: Date },
    edgeType: { type: String, default: "all" },
    edgeTypes: { type: [String], default: [] },
    timeRanges: {
      type: [Schema.Types.ObjectId],
      ref: "TimeRange",
      default: [],
    },
    sourceNetwork: { type: Schema.Types.ObjectId, ref: "Network" },
    favoriteNodes: { type: [String], default: [] },
    status: { type: String, default: "in progress" },
  },
  { collection: "projects" }
);

const Project = model("Project", projectSchema);
module.exports = Project;
