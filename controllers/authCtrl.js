const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const SALT_ROUNDS = 10;

const signup = async (req, res) => {
  try {
    const { username, password, name, city, role } = req.body;
    if (!username || !password || !name) {
      return res.status(400).json({ error: "Name, username, and password are required" });
    }
    if (!["Volunteer", "Organizer"].includes(role)) {
      return res.status(400).json({ error: "Choose Volunteer or Organizer" });
    }

    const existingUser = await User.findOne({ username, role });
    if (existingUser) {
      return res.status(409).json({ error: "Username is already taken for this role" });
    }

    const hashedPassword = bcrypt.hashSync(password, SALT_ROUNDS);
    const user = await User.create({ username, password: hashedPassword, name, city, role });
    const token = jwt.sign(
      { username: user.username, role: user.role, _id: user._id },
      process.env.JWT_SECRET,
    );
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    if (!username || !password || !role) {
      return res.status(400).json({ error: "Username, password, and role are required" });
    }

    const user = await User.findOne({ username, role });
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ error: "Username, password, or role is incorrect" });
    }

    const token = jwt.sign(
      { username: user.username, role: user.role, _id: user._id },
      process.env.JWT_SECRET,
    );
    res.json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const me = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    user.name = req.body.name;
    user.city = req.body.city || "";
    await user.save();
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = { signup, login, me, updateProfile };
