const express = require("express");
const multer = require("multer");
const isSignedIn = require("../middleware/isSignedIn");
const uploadCtrl = require("../controllers/uploadCtrl");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/", isSignedIn, (req, res) => {
  if (req.user.role !== "Organizer") {
    return res.status(403).json({ error: "Only organizers can upload images" });
  }
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    uploadCtrl.upload(req, res);
  });
});

module.exports = router;
