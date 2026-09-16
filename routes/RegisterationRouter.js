const express = require("express");
const router = express.Router();
// Controllers
const RegisterationCtrl = require("../controllers/RegisterationCtrl");

// Routes
router.get("/", RegisterationCtrl.index);
router.get("/campaign/:campaignId", RegisterationCtrl.byCampaign);
router.get("/:id", RegisterationCtrl.show);
router.post("/", RegisterationCtrl.create);
router.put("/:id", RegisterationCtrl.update);
router.delete("/:id", RegisterationCtrl.delete);

module.exports = router;