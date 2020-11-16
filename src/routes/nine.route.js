const express = require("express");
const nineController = require("../controllers/nine.controller.js");
const router = express.Router();

router.post("/change_password", nineController.change_password);


module.exports = router;
