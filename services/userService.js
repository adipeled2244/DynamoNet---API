const User=require('../models/user')
const logger= require('../helpers/winston')

module.exports={
    addUser,
    updateUser,
    getUserById,
    getUserByTwitterId,
    deleteUser,
    getUsers,
    getProjectByUserId
}

async function addUser(params){
    logger.info("[addUser] - db.js");
    const newUser=new User(params);
    await newUser.save();
    return newUser;
}

async function updateUser(id,params){
    logger.info("[updateUser] - db.js");
    return await User.findByIdAndUpdate(id,params);
}

async function getProjectByUserId(userId){
    //לוודא שהוא אובגקט איידי
    logger.info(`[getProjectByUserId] - ${path.basename(__filename)}`);
    return await Project.find({userRef:userId});
}

async function getUser(id){
    logger.info(`[getUser] - ${path.basename(__filename)}`);
    return await User.find({_id:id});
}

async function getUserByTwitterId(twitterId){
    logger.info("[getUserByTwitterId] - db.js");
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





