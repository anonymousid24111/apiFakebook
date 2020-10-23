import express from "express";
import authController from "./../controllers/auth.controller.js"
const router = express.Router();

router.get("/user", (req, res) => {
  console.log(req.jwtDecoded)
  return res.status(200).json("this is /user page");
});

router.post("/change_info_after_signup", authController.changeInfoAfterSignup)

export default router;
