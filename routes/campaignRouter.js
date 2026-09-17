const express = require("express");
const campaignCtrl = require("../controllers/campaignCtrl");
const campaignUpdateCtrl = require("../controllers/campaignUpdateCtrl");
const isSignedIn = require("../middleware/isSignedIn");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

router.get("/", campaignCtrl.index);
router.post("/", isSignedIn, campaignCtrl.create);
router.get("/mine", isSignedIn, campaignCtrl.mine);
router.get("/mine/:id/updates", isSignedIn, campaignUpdateCtrl.mine);
router.get("/mine/:id", isSignedIn, campaignCtrl.showOwn);
router.get("/review", isSignedIn, isAdmin, campaignCtrl.reviewList);
router.get("/review/:id", isSignedIn, isAdmin, campaignCtrl.showReview);
router.get("/activities", isSignedIn, campaignCtrl.activities);
router.get("/favorites", isSignedIn, campaignCtrl.favorites);
router.get("/certificates", isSignedIn, campaignCtrl.certificates);

router.get("/:id/updates", campaignUpdateCtrl.index);
router.post("/:id/updates", isSignedIn, campaignUpdateCtrl.create);
router.put("/:id/updates/:updateId", isSignedIn, campaignUpdateCtrl.update);
router.delete("/:id/updates/:updateId", isSignedIn, campaignUpdateCtrl.remove);

router.post("/:id/submit", isSignedIn, campaignCtrl.submit);
router.post("/:id/cancel", isSignedIn, campaignCtrl.cancel);
router.post("/:id/complete", isSignedIn, campaignCtrl.complete);
router.put("/:id/review", isSignedIn, isAdmin, campaignCtrl.review);
router.get("/:id/participants", isSignedIn, campaignCtrl.participants);
router.post("/:id/participants", isSignedIn, campaignCtrl.join);
router.delete("/:id/participants/me", isSignedIn, campaignCtrl.leave);
router.put("/:id/participants/:volunteerId", isSignedIn, campaignCtrl.markAttendance);
router.put("/:id/favorite", isSignedIn, campaignCtrl.favorite);
router.delete("/:id/favorite", isSignedIn, campaignCtrl.unfavorite);
router.put("/:id/certificates/:volunteerId", isSignedIn, campaignCtrl.grantCertificate);
router.delete("/:id/certificates/:volunteerId", isSignedIn, campaignCtrl.removeCertificate);
router.get("/:id/certificate", isSignedIn, campaignCtrl.certificate);

router.get("/:id", campaignCtrl.show);
router.put("/:id", isSignedIn, campaignCtrl.update);
router.delete("/:id", isSignedIn, campaignCtrl.delete);

module.exports = router;
