const express = require("express");
const tenController = require("../controllers/ten.controller.js");
const router = express.Router();

router.post("/get_user_info", tenController.getUserInfo);
router.post("/set_user_info", tenController.setUserInfo);

// router.post("/get_list_videos", tenController.getListVideos);

module.exports = router;
