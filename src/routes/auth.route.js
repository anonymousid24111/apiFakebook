import express from "express";
const router = express.Router();

import authController from "../controllers/auth.controller.js";

router.post("/login", authController.login);
router.post("/signup", authController.signup);
router.post("/logout", authController.login);

router.post("/get_verify_code", authController.getVerifyCode);
router.post("/check_verify_code", authController.checkVerifyCode);

// router.post("/change_info_after_signup", authController.changeInfoAfterSignup);
export default router;
