import express from "express";
const router = express.Router();

import postController from "../controllers/post.controller.mjs";

router.post("/add_post", postController.addPost);
// router.post("/signup", postController.signup);
// router.post("/logout", postController.login);

// router.post("/get_verify_code", postController.getVerifyCode);
// router.post("/check_verify_code", postController.checkVerifyCode);

// router.post("/change_info_after_signup", postController.changeInfoAfterSignup);
export default router;
