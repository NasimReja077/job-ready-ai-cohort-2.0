import jwt from 'jsonwebtoken';
import UserModel from '../models/user.model.js';

const authMiddleware = async (req, res, next) => {
     try{
          const accessToken = req.cookies.accessToken;
          if (!accessToken){
               return res.status(401).json({
                    message: "Unauthorized request",
               });
          }

          let decode = jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET);

          if(!decode){
               return res.status(401).json({
                    message: "Unauthorized request",
               });
          }

          let user = await UserModel.findById(decode.id)

          req.user = user;
          next();
     } catch (error){
          return res.status(404).json({
               message: "Unauthorized",
          });
     }
};

export default authMiddleware;