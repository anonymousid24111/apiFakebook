const express = require("express");
const bonusController = require("../controllers/bonus.controller.js");
const router = express.Router();

router.post("/set_conversation", bonusController.setConversation);
router.post("/unfriend", bonusController.unfriend);
router.post("/not_suggest", bonusController.notSuggest);

module.exports = router;
