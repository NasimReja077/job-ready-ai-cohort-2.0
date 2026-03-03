const followModel = require("../models/follow.model");
const userModel = require("../models/user.model");


async function followUserController(req, res) {
     // 
     const followerUsername = req.user.username; // req.user.followerUsername , followerUsername is typically sored in req.user object,
     const followeeUsername = req.params.username; // req.params.username is passed as a URL parameter,


     if (followerUsername == followeeUsername){
          return res.status(400).json({
               message: "You cannot follow yourself"
          })
     }

     const isFolloweeExist = await userModel.findOne({
          username: followeeUsername
     })

     if (!isFolloweeExist) {
          return res.status(404).json({
               message: "User you are trying to follow does not exist"
          })
     }

     const isAlreadyFollowing = await followModel.findOne({
          follower: followerUsername,
          followee: followeeUsername,
     })

     if (isAlreadyFollowing){
          return res.status(400).json({
               message: `You are already following ${followeeUsername}`,
               follow: isAlreadyFollowing
          })
     }

     // Create a new follow record in the database
     const followRecord = await followModel.create({ // create is a method by mongoose to create new document in DB, 
          follower: followerUsername, // followerUsername is the user who is following, and followeeUsername is the user being followed.
          followee: followeeUsername // followeeUsername is the user being followed.
     })

     res.status(200).json({
          message: `You are now following ${followeeUsername}`,
          follow: followRecord
     })

}

async function unfollowUserController(req, res) {
     const followerUsername = req.user.username
     const followeeUsername = req.params.username


     if (followerUsername === followeeUsername) {
        return res.status(400).json({
            message: "You cannot unfollow yourself"
        });
    }

    const unfollowRecord = await followModel.findOneAndDelete({
          follower: followerUsername,
          followee: followeeUsername
    })

//     if (!unfollowRecord) {
//           return res.status(404).json({
//                message: "You are not following this user"
//           })
//     }

    if (!unfollowRecord) {
        return res.status(200).json({
            message: `You are not following ${followeeUsername}`
        })
    }

//     await followModel.findByIdAndDelete({ _id: isUserFollowing._id });
    

    res.status(200).json({
          message: `You have unfollowed ${followeeUsername}`,
          unfollow: unfollowRecord
     })
}

module.exports = {
     followUserController,
     unfollowUserController
}