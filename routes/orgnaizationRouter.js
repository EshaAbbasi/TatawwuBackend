const express = require("express");
const router = express.Router();
// Controllers
const orgnaizationCtrl = require("../controllers/orgnaizationCtrl");
// Middleware
const isSignedIn = require("../middleware/isSignedIn");

router.post("/",isSignedIn,orgnaizationCtrl.create);
module.exports=router;