const { Schema, model } = require('mongoose');
// const mongoose = require('mongoose');

const projectSchema = new Schema({
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    numberOfNodes: { type: Number, required: true },
    numberOfEdges: { type: Number, required: true },
    density: { type: Number, required: true },
    reciprocity: { type: Number, required: true },
    periphery: { type: Number, required: true },
    diameter: { type: Number, required: true },
    clustetingCoefficient: { type: Number, required: true },
    network: { type: Network, required: true },
    
}, { collection: 'projects' });


const Project = model('Project', projectSchema);
module.exports = Project;