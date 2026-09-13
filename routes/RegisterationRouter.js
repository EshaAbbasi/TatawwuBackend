const express = require("express");
const router = express.Router();
// Controllers
const RegisterationCtrl = require("../controllers/RegisterationCtrl");
// Middleware
const isSignedIn = require("../middleware/isSignedIn");

// Routes
router.get("/", RegisterationCtrl.index);
router.get("/:id", RegisterationCtrl.show);
router.post("/", isSignedIn, RegisterationCtrl.create);
router.put("/:id", isSignedIn, RegisterationCtrl.update);
router.delete("/:id", isSignedIn, RegisterationCtrl.delete);

module.exports = router;