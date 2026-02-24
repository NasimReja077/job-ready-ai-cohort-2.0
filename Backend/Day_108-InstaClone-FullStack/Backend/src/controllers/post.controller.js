const postModel = require("../models/post.model");
const ImageKit = require("@imagekit/nodejs")
// import ImageKit from '@imagekit/nodejs';
const { toFile } = require("@imagekit/nodejs")
const jwt = require("jsonwebtoken")
const likeModel = require("../models/like.model")

const imagekit = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY, 
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY,          
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT
})

async function createPostController(req, res) {

    if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
    }
    
    const uploadResponse = await imagekit.files.upload({
     file: req.file.buffer,
     fileName: req.file.originalname || `post-${Date.now()}.jpg`,
     folder: "/cohort-2.0-instaClone-posts", 
     useUniqueFileName: true,                     // optional: auto-rename if duplicate
    // tags: ["instaClone", "userPost"]
    })

    const post = await postModel.create({
        caption: req.body.caption || "",
        imgUrl: uploadResponse.url,
        user: req.user.id
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

async function getFeedController(req, res) {
    const user = req.user

    const posts = await Promise.all((await postModel.find().populate("user").lean()).map(async (post) => {

        const isLiked = await likeModel.findOne({
            user: user.username,
            post: post._id
        })

        post.isLiked = !!(isLiked)

        return post
    }))

    res.status(200).json({
        message: "Feed fetched successfully.",
        posts
    })
}

module.exports = {
    createPostController,
    getPostController,
    getPostDetailsController,
    likePostController,
    getFeedController
}