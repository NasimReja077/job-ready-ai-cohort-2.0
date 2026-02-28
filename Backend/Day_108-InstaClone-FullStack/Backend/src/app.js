const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require("cors");
const morgan = require("morgan");

const authRouter = require("./routes/auth.routes");
const postRouter = require("./routes/post.routes");
const userRouter = require("./routes/user.routes");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(cors({
    credentials: true,
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use("/api/auth", authRouter);
app.use("/api/posts", postRouter);
app.use("/api/users", userRouter);

// ✅ Global error handler — MUST be defined after all routes
// Without this, Express sends [object Object] when an async error is thrown
app.use((err, req, res, next) => {
    console.error("Global error handler:", err);
    res.status(err.status || 500).json({
        message: err.message || "Internal server error",
    });
});

module.exports = app;