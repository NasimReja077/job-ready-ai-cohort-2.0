import express from "express";
import { registerController, loginController, getAccessTokenController } from "../controllers/auth.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";


const router = express.Router();

router.get("/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Currently loggedIn user",
    user: req.user,
  });
});

router.get("/get-accessToken", getAccessTokenController);

router.post("/register", registerController);
router.post("/login", loginController);

export default router;