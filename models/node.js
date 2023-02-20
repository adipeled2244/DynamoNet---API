const { Schema, model } = require('mongoose');

const nodeSchema = new Schema({
    name:{ type: String },
    screenName:{ type: String },
    friendsCount:{ type: Number },
    followersCount:{ type: Number },
    statusesCount:{ type: Number },
    twitterId:{ type: String , unique: true, index:true},
    location:{ type: String },
    description:{ type: String },
    registrationDateTwitter:{ type: Date },
}, { collection: 'users' });

const Node = model('Node', nodeSchema);
module.exports = Node;