import { verify } from "jsonwebtoken";
import { findById } from "../models/user.model.js";

let authMiddleware = async (req, res, next) => {
  try {
    let accessToken = req.cookies.accessToken;

    if (!accessToken)
      return res.status(401).json({
        message: "Unauthorized request",
      });

    let decode = verify(accessToken, process.env.JWT_ACCESS_SECRET);

    if (!decode)
      return res.status(401).json({
        message: "Unauthorized request",
      });

    let user = await findById(decode.id);

    req.user = user;
    next();
  } catch (error) {
    return res.status(404).json({
      message: "Unauthorized",
    });
  }
};

export default authMiddleware;