require("dotenv").config();
require("./config/database");

const express = require("express");
const cors = require("cors");
const logger = require("morgan");
const authRouter = require("./routes/authRouter");
const campaignRouter = require("./routes/campaignRouter");
const organizationRouter = require("./routes/orgnaizationRouter");
const uploadRouter = require("./routes/uploadRouter");

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger("dev"));

app.use("/auth", authRouter);
app.use("/campaigns", campaignRouter);
app.use("/organizations", organizationRouter);
app.use("/uploads", uploadRouter);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0");
