const logger= require('../helpers/winston')
const path = require('path');
const TimeRange = require('../models/timeRange');
const projectService= require('./projectService')
const mongoose = require("mongoose");
const ObjectId=mongoose.Types.ObjectId;

module.exports={
    deleteTimeRange,
    getTimeRange,
    getTimeRanges,
    deleteTimeRanges
}

async function getTimeRange(timeRangeId){
    logger.info(`[getTimeRange] - ${path.basename(__filename)}`);
    return await TimeRange.findOne({_id: timeRangeId});
}

async function getTimeRanges(){
    logger.info(`[getTimeRanges] - ${path.basename(__filename)}`);
    return await TimeRange.find({});
}

async function deleteTimeRange(timeRangeId, projectId){
    logger.info(`[deleteTimeRange] - ${path.basename(__filename)}`);
    const project=await projectService.getProject(projectId);
    if(!project){
        throw Error(`Project id : ${projectId} not found`);
    }
    if(!project.timeRanges.includes(ObjectId(timeRangeId))){
        throw Error(`TimeRange id : ${timeRangeId} not found in project ${projectId} `);
    }
    project.timeRanges= project.timeRanges.filter((timeRange)=>timeRange.toString()!=timeRangeId);
    await projectService.updateProject(projectId,{timeRanges:  project.timeRanges})
    return await TimeRange.deleteOne({_id: timeRangeId}); 
}

async function deleteTimeRange(timeRangeId, projectId){
    logger.info(`[deleteTimeRange] - ${path.basename(__filename)}`);
    const project=await projectService.getProject(projectId);
    if(!project){
        throw Error(`Project id : ${projectId} not found`);
    }
    if(!project.timeRanges.includes(ObjectId(timeRangeId))){
        throw Error(`TimeRange id : ${timeRangeId} not found in project ${projectId} `);
    }
    project.timeRanges= project.timeRanges.filter((timeRange)=>timeRange.toString()!=timeRangeId);
    await projectService.updateProject(projectId,{timeRanges:  project.timeRanges})
    return await TimeRange.deleteOne({_id: timeRangeId}); 
}

async function deleteTimeRanges(timeRangeIds, projectId){
    logger.info(`[deleteTimeRanges] - ${path.basename(__filename)}`);
    const project=await projectService.getProject(projectId);
    if(!project){
        throw Error(`Project id : ${projectId} not found`);
    }
    const invalidTimeRanges = timeRangeIds.filter(id => !project.timeRanges.includes(ObjectId(id)));
    if (invalidTimeRanges.length > 0) {
        throw Error(`The following timeRangeIds are not found in project ${projectId}: ${invalidTimeRanges}`);
    }
    project.timeRanges= project.timeRanges.filter((timeRange)=> !timeRangeIds.includes(timeRange.toString()));
    await projectService.updateProject(projectId,{timeRanges:  project.timeRanges})
    return await TimeRange.deleteMany({_id: { $in: timeRangeIds } }); 
}