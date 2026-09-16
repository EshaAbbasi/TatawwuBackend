const express = require("express");
const authCtrl = require("../controllers/authCtrl");
const isSignedIn = require("../middleware/isSignedIn");

const router = express.Router();

router.post("/sign-up", authCtrl.signup);
router.post("/sign-in", authCtrl.login);
router.get("/me", isSignedIn, authCtrl.me);
router.put("/me", isSignedIn, authCtrl.updateProfile);

module.exports = router;
