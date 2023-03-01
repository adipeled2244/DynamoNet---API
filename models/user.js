const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    email: { type: String, required: true },
    name: { type: String, required: true },
    projectsRefs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
      },
    ],
    registrationDate: { type: Date },
    password: { type: String, required: true },
  },
  { collection: "users" }
);

const User = model("User", userSchema);

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWT_PRIVATE_KEY || "jwtPrivateKey"
  );
  return token;
};

module.exports = User;
