import "dotenv/config";
import express from "express";
import morgan from "morgan";
import mongoose from "mongoose";
import Redis from "ioredis";
import { User } from "./models/user.model.js";
import rateLimit from 'express-rate-limit';

// ---- MongoDB Connection ----
const connectToMongoDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
    }
};

connectToMongoDB();


// ---- Redis Connection ----
const redisHost = process.env.REDIS_HOST;
const redisPort = Number(process.env.REDIS_PORT);
const redisPassword = process.env.REDIS_PASSWORD;

if (
    !redisHost ||
    !Number.isInteger(redisPort) ||
    redisPort < 1 ||
    redisPort > 65535 ||
    !redisPassword
) {
    throw new Error("Redis configuration is incomplete. Set REDIS_HOST, REDIS_PORT, and REDIS_PASSWORD in .env.");
}

const redis = new Redis({
    host: redisHost,
    port: redisPort,
    password: redisPassword,
    ...(process.env.REDIS_TLS === "true" ? { tls: {} } : {})
});

redis.once("ready", () => {
    console.log("Connected to Redis");
});

redis.on("error", (err) => {
    console.error("Redis connection error:", err);
});


// ---- Express App Setup ----
const app = express();
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


// ---- ejs Template Engine Setup ----
app.set("view engine", "ejs");

app.set("views", "./views");

app.use(express.static("public"));

const globalLimiter = rateLimit({
    windowMs: 2 * 60 * 1000,  // 2 minutes
    max: 100,                    // 100 requests per window per IP
    message: {
        error: 'Too many requests. Please try again later.'
    },
    statusCode: 429,
    standardHeaders: true,   // sends RateLimit-* headers
});

// Apply to every route
app.use(globalLimiter);

const renderUserPage = async (res, options = {}) => {
    const users = await User.find().sort({ _id: -1 }).limit(3).lean();

    return res.status(options.statusCode || 200).render("index", {
        username: "Building",
        bio: "Something about Building",
        profilePicture: "https://images.unsplash.com/photo-1779206746296-b7d3f467e55d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxA3fHx8fGVufDB8fHx8fA%3D%3D",
        users,
        formError: options.formError,
        formValues: options.formValues || {},
        userCreated: options.userCreated || false
    });
};

// ---- Routes ----
app.get("/user/:id", async (req, res) => {
    try {

        const userFomCache = await redis.get(`user:${req.params.id}`);

        if (userFomCache) {
            return res.json({
                message: "User fetched from cache",
                data: JSON.parse(userFomCache)
            });
        }

        const user = await User.find();

        await redis.set(`user:${req.params.id}`, JSON.stringify(user), "EX", 60 * 60); // Cache for 1 hour

        res.json({
            message: "User fetched successfully",
            data: user
        });
    } catch (error) {
        res.status(500).json({ error: "Error fetching users" });
    }
});

app.post("/user", async (req, res) => {
    const isFormSubmission = req.is("application/x-www-form-urlencoded");
    const requestBody = req.body || {};
    const name = typeof requestBody.name === "string" ? requestBody.name.trim() : "";
    const email = typeof requestBody.email === "string" ? requestBody.email.trim() : "";

    try {
        if (isFormSubmission && (!name || !email)) {
            return renderUserPage(res, {
                statusCode: 400,
                formError: "Please enter both a name and an email address.",
                formValues: { name, email }
            });
        }

        const newUser = new User(isFormSubmission ? { name, email } : requestBody);
        await newUser.save();

        if (isFormSubmission) {
            return res.redirect(303, "/user?created=1");
        }

        res.json({
            message: "User created successfully",
            data: newUser
        });
    } catch (error) {
        if (isFormSubmission) {
            const isDuplicateEmail = error.code === 11000;
            const isValidationError = error.name === "ValidationError";
            const formError = isDuplicateEmail
                ? "That email address is already registered."
                : isValidationError
                    ? error.message
                    : "Could not create the user. Please try again.";

            return renderUserPage(res, {
                statusCode: isDuplicateEmail || isValidationError ? 400 : 500,
                formError,
                formValues: { name, email }
            });
        }

        res.status(500).json({ error: "Error creating user" });
    }
});

app.get(["/"], async (req, res) => {
    const users = await User.find().sort({ _id: -1 }).limit(3).lean();

    res.render("index", {
        username: "Building",
        bio: "Something about Building",
        profilePicture: "https://images.unsplash.com/photo-1779206746296-b7d3f467e55d?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0OHx8fGVufDB8fHx8fA%3D%3D",
        users,
        formError: undefined,
        formValues: {},
        userCreated: req.query.created === "1"
    });
});



// ---- Start Server ----
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
