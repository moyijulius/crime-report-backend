const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String, default: "" },

  role: { type: String, enum: ["user", "admin", "officer"], default: "user" },
});
module.exports = mongoose.model("User", userSchema);
