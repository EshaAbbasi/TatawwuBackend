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
  role: {
    type: String,
    enum: ["Admin", "Volunteer", "Organizer"],
    default: "Volunteer",
    required: true,
  },
});

userSchema.set("toJSON", {
  transform: (document, userObj) => {
    delete userObj.password;
  },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
