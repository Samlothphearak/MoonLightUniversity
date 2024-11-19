// models/Admin.js
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// Admin schema
const adminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  adminName: { type: String, required: true },
});

// Encrypt password before saving
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Admin model
const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;
