require("dotenv").config();
require("./config/database");

const express = require("express");

const app = express();

const isProduction = process.env.NODE_ENV === "production";

if (isProduction) {
  app.set("trust proxy", 1);
}

// Middleware
const cors = require("cors");
const logger = require("morgan");
const isSignedIn = require("./middleware/isSignedIn");
const isAdmin = require("./middleware/isAdmin");

// Routers
const authRouter = require("./routes/authRouter");
const campaignRouter = require("./routes/campaignRouter");
const orgnaizationRouter = require("./routes/orgnaizationRouter");
const registerationRouter = require("./routes/RegisterationRouter");

app.use(cors());
app.use(express.json());
app.use(logger("dev"));

// ROUTES

// PUBLIC
app.use("/auth", authRouter);
app.use("/campaigns", campaignRouter);
app.use("/organizations", orgnaizationRouter);

// PROTECTED
app.use(isSignedIn);
// Admin access
app.use(isAdmin);
app.use("/Registeration", registerationRouter);

app.listen(3000, "0.0.0.0", () => {
  console.log(`The express app is ready on port ${port}!`);
});
