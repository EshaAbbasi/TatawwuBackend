const express = require("express");
const router = express.Router();
const campaignCtrl = require("../controllers/campaignCtrl");
const isSignedIn = require("../middleware/isSignedIn");

router.post("/", isSignedIn, campaignCtrl.create);
router.get("/", campaignCtrl.index);
router.get("/mine", isSignedIn, campaignCtrl.mine);
router.get("/:id", campaignCtrl.show);
router.put("/:id", isSignedIn, campaignCtrl.update);
router.delete("/:id", isSignedIn, campaignCtrl.delete);

module.exports = router;
