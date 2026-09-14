const jwt = require("jsonwebtoken");

const isSignedIn = (req, res, next) => {
  try {
    const brearerToken = req.headers.authorization;

    if (!brearerToken) throw new Error("Login Required");

    const token = brearerToken.split(" ")[1];

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (payload.role !== "admin") {
      return res.status(403).json({ err: "Admin Access Required" });
    }
    next();
  } catch (err) {
    res.status(401).json({ err: "Login Required" });
  }
};

module.exports = isSignedIn;
