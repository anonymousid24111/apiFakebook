const express = require("express");
const nineController = require("../controllers/nine.controller.js");
const router = express.Router();

router.post("/change_password", nineController.change_password);
router.post("/set_block", nineController.setBlock);




module.exports = router;
