const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["Admin", "Volunteer", "Organizer"],
    default: "Volunteer",
    required: true,
  },
});

userSchema.index({ username: 1, role: 1 }, { unique: true });

userSchema.set("toJSON", {
  transform: (document, userObj) => {
    delete userObj.password;
  },
});

module.exports = mongoose.model("User", userSchema);
