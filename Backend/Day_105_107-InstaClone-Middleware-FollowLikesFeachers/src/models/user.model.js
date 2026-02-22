const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
     username: {
        type: String,
        unique: [ true, "User name already exists" ],
        required: [ true, "User name is required" ]
    },
    email: {
        type: String,
        unique: [ true, "Email already exists" ],
        required: [ true, "Email is required" ]
    },
    password: {
        type: String,
        required: [ true, "Password is required" ]
    },
    bio: String,
    profileImage: {
        type: String,
        default: "https://ik.imagekit.io/l69sleaxn1/New%20Folder1/pngtree-account-icon-profiles-and-users-vector-info-silhouette-vector-png-image_12585549.png"
    }

})

const userModel = mongoose.model("users", userSchema);
module.exports = userModel;