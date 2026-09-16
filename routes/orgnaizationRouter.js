const express = require("express");
const organizationCtrl = require("../controllers/orgnaizationCtrl");
const isSignedIn = require("../middleware/isSignedIn");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

router.get("/", organizationCtrl.index);
router.post("/", isSignedIn, organizationCtrl.create);
router.get("/mine", isSignedIn, organizationCtrl.showMine);
router.get("/review", isSignedIn, isAdmin, organizationCtrl.reviewList);
router.put("/:id/review", isSignedIn, isAdmin, organizationCtrl.review);
router.get("/:id", organizationCtrl.show);
router.put("/:id", isSignedIn, organizationCtrl.update);
router.delete("/:id", isSignedIn, organizationCtrl.deleteOrganization);

module.exports = router;
