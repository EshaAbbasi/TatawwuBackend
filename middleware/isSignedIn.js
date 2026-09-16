const jwt = require("jsonwebtoken");

const isSignedIn = (req, res, next) => {
  try {
    const bearerToken = req.headers.authorization;
    if (!bearerToken) {
      return res.status(401).json({ error: "Sign in required" });
    }
    const token = bearerToken.split(" ")[1];
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    res.status(401).json({ error: "Sign in required" });
  }
};

module.exports = isSignedIn;
