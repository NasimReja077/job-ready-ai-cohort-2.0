const express = require('express')
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const authRouter = express.Router()

/**
 * /api/auth/register
 */

authRouter.post("/register", async (req, res) => {
     const { email, name, password } = req.body // we are getting the email, name and password from the request body.

     const isUserAlreadyExists = await userModel.findOne({ email })

     if (isUserAlreadyExists){
          return res.status(400).json({
               message: "User already exists with this email address"
          })
     }

     const user = await userModel.create({
          email, password, name
     })

     const token = jwt.sign(
          {
               id: user._id, // we are storing the user id and email in the token so that we can use it for authentication in future requests.
               email: user.email
          },
          process.env.JWT_SECRET
     )

     res.cookie("jwt_token", token) // why we are setting cookie here? because we want to store the token in the browser so that we can use it for authentication in future requests.
     // more explanation - we are setting the token in the cookie so that we can use it for authentication in future requests. when the user logs in, we will set the token in the cookie and then in future requests, we can check if the token is present in the cookie and if it is valid or not. if it is valid, the we will allow the user to access the protected routes. if it is not valid, we will return an error message.

     res.status(201).json({
          message: "User registered successfully",
          user,
          token
     })
})

module.exports = authRouter