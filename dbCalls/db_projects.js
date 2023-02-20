const Project=require('../models/project')
const logger= require('../helpers/winston')

module.exports={
    addProject,
    updateProject,
    getProjectByUserId,
    getProjectByProjectId
}
async function addProject(params){
    logger.info("[addProject] - db.js");
    const newProject=new Project(params);
    await newProject.save();
    return newProject;
}

async function updateProject(id,params){
    logger.info("[updateProject] - db.js");
    return await Project.findByIdAndUpdate(id,params);
}

async function getProjectByUserId(userId){
    logger.info("[getProjectByUserId] - db.js");
    return await Project.find({userRef:userId});
}

async function getProjectByProjectId(projectId){
    logger.info("[getProjectByProjectId] - db.js");
    return await Project.find({_id: projectId});
}