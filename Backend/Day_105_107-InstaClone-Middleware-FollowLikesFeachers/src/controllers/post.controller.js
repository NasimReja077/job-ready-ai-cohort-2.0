const postModel = require("../models/post.model");
const ImageKit = require("@imagekit/nodejs")
const { toFile } = require("@imagekit/nodejs")
const jwt = require("jsonwebtoken")
const likeModel = require("../models/like.model")

const imagekit = new ImageKit({
     privateKey: process.env.imagekit_PrivateKey
})

async function createPostController(req, res) {
    
    const file = await imagekit.upload({
     file: await toFile(Buffer.from (req.file.buffer), 'file'),
     fileName: "Tests-Files",
     folder: "cohort-2.0-instaClone-posts"
    })

    const post = await postModel.create({
        caption: req.body.caption,
        imgUrl: file.url,
        user: decoded.id
    })

    res.status(201).json({
        message: "Post created successfully.",
        post
    })
}

async function getPostController(req, res) {
    const userId = req.user.id

    const posts = await postModel.find({
        user: userId
    })

    res.status(200)
        .json({
            message: "Posts fetched successfully.",
            posts
        })
}

async function getPostDetailsController(req, res) {
    const userId = req.user.id
    const postId = req.params.postId

    const post = await postModel.findById(postId)

    if (!post) {
        return res.status(404).json({
            message: "Post not found."
        })
    }

    const isValidUser = post.user.toString() === userId

    if (!isValidUser) {
        return res.status(403).json({
            message: "Forbidden Content."
        })
    }

    return res.status(200).json({
        message: "Post fetched  successfully.",
        post
    })

}

async function likePostController(req, res) {

    // 1. Get the username and postId from the request
    // 2. Check if the post exists
    // 3. Check if the user has already liked the post
    // 4. If not, create a new like document and increment the like count of the post
    const username = req.user.username
    const postId = req.params.postId
    // const username = req.user.username and const postId = req.params.postId why use -> get the username and postId from the request because we need to know which user is liking which post. The username helps us identify the user who is performing the like action, while the postId helps us identify the specific post that is being liked. This information is crucial for updating the like count of the post and ensuring that a user cannot like the same post multiple times.

    const post = await postModel.findById(postId)

    if (!post){
        return res.status(404).json({
            message: "Post not found."
        })
    }

    const like = await likeModel.create({
        post: postId,
        user: username

    })

    res.status(200).json({
        message: "Post Like Successfully.",
        like
    })

}

module.exports = {
    createPostController,
    getPostController,
    getPostDetailsController,
    likePostController
}