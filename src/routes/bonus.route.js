const express = require("express");
const bonusController = require("../controllers/bonus.controller.js");
const router = express.Router();

router.post("/set_conversation", bonusController.setConversation);

module.exports = router;
