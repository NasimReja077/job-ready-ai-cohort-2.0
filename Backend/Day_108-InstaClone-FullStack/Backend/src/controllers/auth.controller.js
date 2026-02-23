const userModl = require("../models/user.model");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");

async function registerController(req, res) {
     const { email, username, password, bio, profileImage } = req.body;

     const isUserAlreadyExists = await userModl.findOne({
          $or: [ 
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
     const hashedPassword = await bcrypt.hash(password, 10)

     const user = await userModl.create({ // creating a new user in the database.
          username,
          email,
          password: hashedPassword, // storing the hashed password in the database.
          bio,
          profileImage
     })

     const token = jwt.sign(
          {id: user._id},
          process.env.JWT_SECRET,
          { expiresIn: '1d' }
     )

     res.cookie("token",token)

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

//     const hashedPassword = crypto.createHash("sha256").update(password).digest("hex")

    //const isPasswordValid = hashedPassword === user.password

    const isPasswordValid = await bcrypt.compare(password, user.password)

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

async function getMeController(req, res) {
     const userId = req.user.id

     const user = await userModl.findById(userId)

     res.status(200).json({
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
    loginController,
    getMeController
}