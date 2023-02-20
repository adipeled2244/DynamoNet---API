const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    email: { type: String, required: true },
    name: { type: String, required: true },
    projectsRef: {type: Schema.Types.ObjectId, ref: "Project"},
    registrationDate: { type: Date },
}, { collection: 'users' });

const User = model('User', userSchema);
module.exports = User;