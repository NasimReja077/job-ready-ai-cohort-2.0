const userModl = require("../models/user.model");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

/**
 * step 1: get the data from the request body.
 * step 2: find user by email and username, if user already exists then send error response, otherwise create a new user in the database and send success response.
 * step 3: if user already exists then send error response.
 * step 4: password hashing.
 * step 5: creating a new user in the database.
 * step 6: creating a token for the user and sending it in the response.
 * step 8: sending the success response with the user data and token.
 */

async function registerController(req, res) {
     const { email, username, password, bio, profileImage } = req.body; // destructuring the data from the request body
     // creating a new user in the database.
     // find user by email and username, if user already exists then send error response, otherwise create a new user in the database and send success response.

     const isUserAlreadyExists = await userModl.findOne({
          $or: [ // it will check for both the conditions, if any one of the condition is true then it will return the user document.
               { username },
               { email }
          ]
     })

     // if user already exists then send error response.

     if (isUserAlreadyExists){
          return res.status(409)
          .json({
               message: "User already exists " + (isUserAlreadyExists.email === email ? "Email already exists" : "Username already exists")
          })
     }

     // password hashing 
     const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")

     const user = await userModl.create({ // creating a new user in the database.
          username,
          email,
          password: hashedPassword, // storing the hashed password in the database.
          bio,
          profileImage
     })

     // creating a token for the user and sending it in the response.

     // why token is required? token is required for authentication and authorization. token will be sent in the request header for every request that requires authentication and authorization. token will be verified in the middleware and if token is valid then the request will be processed, otherwise an error response will be sent.

     const token = jwt.sign( // sing method is used to create a new token.
          {id: user._id},
          process.env.JWT_SECRET_KEY,
          { expiresIn: '1d' } // token will expire in 1 day
     )

     res.cookie("token",token) // setting the token in the cookie, so that it can be sent in the request header for every request that requires authentication and authorization.

     // sending the success response with the user data and token.
     res.status(201).json({
          message: "User registered successfully",
          user: {
               email: user.email,
               username: user.username,
               bio: user.bio,
               profileImage: user.profileImage
          }
     })

}

async function loginController(req, res) {
    const { username, email, password } = req.body

    /**
     * username & password /// email & password
     * 
     * { username:undefined,email:test@test.com,password:test } = req.body
     */

    const user = await userModl.findOne({
     $or: [
          { username: username },
          { email: email }
     ]
    })

    if (!user){
     return res.status(404).json({
          message: "User not found"
     })
    }

    const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")

    const isPasswordValid = hashedPassword === user.password

    if (!isPasswordValid) {
        return res.status(401).json({
            message: "password invalid"
        })
    }

    const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
    )

    res.cookie("token", token)

    res.status(200)
        .json({
            message: "User loggedIn successfully.",
            user: {
                username: user.username,
                email: user.email,
                bio: user.bio,
                profileImage: user.profileImage
            }
        })
}

module.exports = {
    registerController,
    loginController
}