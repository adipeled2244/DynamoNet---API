const User=require('../models/user')
const logger= require('../helpers/winston')

module.exports={
    addUser,
    updateUser,
    getUserById,
    getUserByTwitterId
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

async function getUserById(id){
    logger.info("[getUserById] - db.js");
    return await User.find({_id:id});
}

async function getUserByTwitterId(twitterId){
    logger.info("[getUserByTwitterId] - db.js");
    return await User.find({twitterId});
}



