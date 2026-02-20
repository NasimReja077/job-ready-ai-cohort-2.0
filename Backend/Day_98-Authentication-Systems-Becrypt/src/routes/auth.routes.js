const express = require('express')
const userModel = require("../models/user.model")
const jwt = require("jsonwebtoken")
const authRouter = express.Router()
const crypto = require("crypto")



/**
 * /api/auth/register
 */

authRouter.post("/register", async (req, res) => {
     const { email, name, password } = req.body

     const isUserAlreadyExists = await userModel.findOne({ email })

     if (isUserAlreadyExists){
          return res.status(400).json({
               message: "User already exists with this email address"
          })
     }

     const hash = crypto.createHash("md5").update(password).digest("hex") // we are hashing the password using md5 algorithm and then storing it in the database. so that even if someone gets access to the database, they will not be able to see the actual password.
     const user = await userModel.create({
          email, password: hash, name
     })

     const token = jwt.sign(
          {
               id: user._id,
               email: user.email
          },
          process.env.JWT_SECRET
     )

     res.cookie("jwt_token", token) 

     res.status(201).json({
          message: "User registered successfully",
          user,
          token
     })
})

/**
 * POST /api/auth/login
 */
authRouter.post("/login", async (req, res) => {
     const { email, password } = req.body
     const user = await userModel.findOne({ email })

     if (!user){
          return res.status(404).json({
               message: "User not found with this email address"
          })
     }

     const isPasswordMatched = user.password === crypto.createHash("md5").update(password).digest("hex")

     if(!isPasswordMatched){
          return res.status(400).json({
               message: "Invalid password"
          })
     }
     const token = jwt.sign({
          id: user._id,
     }, process.env.JWT_SECRET)

     res.cookie("jwt_token", token)

     res.status(200).json({
          message: "User logged in successfully",
          user
     })
})

module.exports = authRouter