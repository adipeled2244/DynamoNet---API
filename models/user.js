const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    projectsRefs:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project' }],
        // https://stackoverflow.com/questions/44995922/mongoose-nodejs-schema-with-array-of-refs
    registrationDate: { type: Date },
    password: { type: String, required: true },
}, { collection: 'users' });

const User = model('User', userSchema);
module.exports = User;