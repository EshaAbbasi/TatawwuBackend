const express = require("express");
const router = express.Router();

const campaignCtrl = require("../controllers/campaignCtrl");

router.post("/", campaignCtrl.create);
router.get("/index", campaignCtrl.index);
router.get("/:id", campaignCtrl.show);
router.put("/:id/update", campaignCtrl.update);
router.delete("/:id/delete", campaignCtrl.delete);

module.exports = router;
