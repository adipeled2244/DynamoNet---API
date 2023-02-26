const User=require('../models/user')
const logger= require('../helpers/winston')
const path = require("path");
const ObjectId = require("mongoose").Types.ObjectId;

module.exports={
    addUser,
    updateUser,
    getUserByTwitterId,
    deleteUser,
    getUsers,
    getProjectByUserId,
    getUserByEmail,
    getUser,
    addProjectToUser
}

async function addUser(params){
    logger.info(`[addUser] - ${path.basename(__filename)}`);
    const newUser=new User(params);
    await newUser.save();
    return newUser;
}

async function updateUser(id,params){
    logger.info(`[updateUser] - ${path.basename(__filename)}`);
    return await User.findByIdAndUpdate(id,params);
}

async function addProjectToUser(id,params){
    logger.info(`[addProjectToUser] - ${path.basename(__filename)}`);
    return await User.updateOne({ _id: id }, { $push: { projectsRefs: ObjectId(params) } });
}

async function getProjectByUserId(userId){
    logger.info(`[getProjectByUserId] - ${path.basename(__filename)}`);
    return await Project.find({userRef:userId});
}

async function getUser(id){
    logger.info(`[getUser] - ${path.basename(__filename)}`);

    return await User.findOne({_id:id});
}

async function getUserByEmail(email) {
    logger.info(`[getUser] - ${path.basename(__filename)}`);
    const user= await User.findOne({email});
    if(user) return user;
    return null;
}

async function getUserByTwitterId(twitterId){
    logger.info(`[getUserByTwitterId] - ${path.basename(__filename)}`);
    return await User.find({twitterId});
}

async function getUsers(){
    logger.info(`[getUsers] - ${path.basename(__filename)}`);
    return await User.find({});
}

async function deleteUser(usertId){
    logger.info(`[deleteProject] - ${path.basename(__filename)}`);
    return await User.deleteOne({_id: userId});
}





