const express = require("express");
const router = express.Router();

const campaignCtrl = require("../controllers/campaignCtrl");

router.post("/", campaignCtrl.create);
router.get("/", campaignCtrl.index);
router.get("/:id", campaignCtrl.show);
router.put("/:id", campaignCtrl.update);
router.delete("/:id", campaignCtrl.delete);

module.exports = router;
