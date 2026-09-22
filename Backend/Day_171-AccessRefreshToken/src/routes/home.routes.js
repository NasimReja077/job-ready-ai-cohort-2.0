import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware.js";

let router = Router();

router.get("/", authMiddleware, (req, res) => {
  return res.status(200).json({
    message: "Home fetched",
  });
});

export default router;