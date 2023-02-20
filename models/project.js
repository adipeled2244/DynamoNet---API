const { Schema, model } = require('mongoose');
// const mongoose = require('mongoose');
// const Network = require('./network');

const projectSchema = new Schema({
   createdDate: { type: Date, required: true },
   //userRef: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dataset: { type: [String], required: true },
    edgeType: { type: String, required: true },
    timeRanges: { type: [Object] },
    // networks: { type: [Network] },
}, { collection: 'projects' });

const Project = model('Project', projectSchema);
module.exports = Project;