const Edge=require('../models/edge')
const logger= require('../helpers/winston')
const path = require('path');

module.exports={
    addEdge,
    updateEdge,
    getEdge,
    deleteEdge,
    getEdges
    
}
async function addEdge(params){
    logger.info(`[addEdge] - ${path.basename(__filename)}`);
    const newEdge=new Edge(params);
    await newEdge.save();
    return newEdge;
}

async function updateEdge(id,params){
    logger.info(`[updateEdge] - ${path.basename(__filename)}`);
    return await Edge.updateOne({_id: id},params);
}

async function getEdge(edgeId){
    logger.info(`[getEdge] - ${path.basename(__filename)}`);
    return await Edge.findOne({_id: edgeId});
}
async function getEdges(){
    logger.info(`[getEdge] - ${path.basename(__filename)}`);
    return await Edge.find({});
}

async function deleteEdge(edgeId){
    logger.info(`[deleteEdge] - ${path.basename(__filename)}`);
    return await Edge.deleteOne({_id: edgeId});
}

