const { Schema, model } = require("mongoose");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const validator = require("validator");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      validate: validator.isEmail,
      message: "Please provide a valid email",
    },
    name: { type: String, required: true },
    projectsRefs: {
      type: [Schema.Types.ObjectId],
      ref: "Project",
      default: [],
    },
    registrationDate: { type: Date },
    password: { type: String, required: true },
    token: { type: String, default: "" },
    tokenExp: { type: Date },
  },
  { collection: "users" }
);

userSchema.methods.generateAuthToken = () => {
  const token = jwt.sign(
    { _id: this._id, email: this.email },
    process.env.JWT_PRIVATE_KEY || "jwtPrivateKey"
  );
  return token;
};

const User = model("User", userSchema);

module.exports = User;
