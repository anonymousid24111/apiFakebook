const express = require("express");
const sevenController = require("../controllers/seven.controller.js");
const router = express.Router();

router.post("/get_requested_friends", sevenController.getRequestedFriends);
// router.post("/get_saved_search", sevenController.getSavedSearch);
// router.post("/del_saved_search", sevenController.delSavedSearch);

module.exports = router;
