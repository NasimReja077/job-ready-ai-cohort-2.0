const postModel = require("../models/post.model");
const ImageKit = require("@imagekit/nodejs").default;
const { toFile } = require("@imagekit/nodejs");
const jwt = require("jsonwebtoken")
const likeModel = require("../models/like.model")

const client = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function createPostController(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    const uploadResponse = await client.files.upload({
        file: await toFile(req.file.buffer, req.file.originalname),
        fileName: req.file.originalname,
        folder: "cohort20_instaclone_posts",
    });

    const post = await postModel.create({
      caption: req.body.caption || "",
      imgUrl: uploadResponse.url,
      user: req.user.id,
    });

    res.status(201).json({
      message: "Post created successfully.",
      post,
    });
  } catch (error) {
    console.log("UPLOAD ERROR:", error);
    res.status(500).json({
      message: "Something went wrong while uploading post.",
      error: error.message,
    });
  }
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

async function unLikePostController(req, res) {
    const postId = req.params.postId
    const username = req.user.username

    const isLiked = await likeModel.findOne({
        post: postId,
        user: username
    })

    if (!isLiked){
        return res.status(400).json({
            message: "Post didn't like"
        })
    }

    await likeModel.findOneAndDelete({ _id: isLiked._id})

    return res.status(200).json({
        message: "Post Un-Liked Successfully."
    })

}

async function getFeedController(req, res) {
    const user = req.user

    const posts = await Promise.all((await postModel.find().populate("user").lean())
    .map(async (post) => {

        //  typeof post => object

        const isLiked = await likeModel.findOne({
            user: user.username,
            post: post._id
        })

        // post.isLiked = Boolean(isLiked)
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
    getFeedController,
    unLikePostController
}