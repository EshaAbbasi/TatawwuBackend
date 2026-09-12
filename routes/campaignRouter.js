const express = require("express");
const router = express.Router();
// Controllers
const campaignCtrl = require("../controllers/campaignCtrl");
// Middleware
const isSignedIn = require("../middleware/isSignedIn");

// Routes
router.post("/", isSignedIn, campaignCtrl.create);
router.get("/", campaignCtrl.index);
router.get("/:id", campaignCtrl.show);
router.put("/:id", isSignedIn, campaignCtrl.update);
router.delete("/:id", isSignedIn, campaignCtrl.delete);

module.exports = router;
