const express = require("express");
const router = express.Router();
// Controllers
const orgnaizationCtrl = require("../controllers/orgnaizationCtrl");
// Middleware
const isSignedIn = require("../middleware/isSignedIn");

router.post("/",isSignedIn,orgnaizationCtrl.create);
router.get("/",orgnaizationCtrl.index);
router.get("/:id",orgnaizationCtrl.show);


module.exports=router;
