const Node=require('../models/node')
const logger= require('../helpers/winston')
const path = require('path');

module.exports={
    addNode,
    updateNode,
    getNode,
    deleteNode,
    getNodes
}
async function addNode(params){
    logger.info(`[addNode] - ${path.basename(__filename)}`);
    const newNode=new Node(params);
    await newNode.save();
    return newNode;
}

async function updateNode(id,params){
    logger.info(`[updateNode] - ${path.basename(__filename)}`);
    return await Node.updateOne({_id: id},params);
}


async function getNode(nodeId){
    logger.info(`[getNode] - ${path.basename(__filename)}`);
    return await Node.findOne({twitterId: nodeId});
}
async function getNodes(){
    logger.info(`[getNode] - ${path.basename(__filename)}`);
    return await Node.find({});
}

async function deleteNode(nodeId){
    logger.info(`[deleteNode] - ${path.basename(__filename)}`);
    return await Node.deleteOne({_id: nodeId});
}