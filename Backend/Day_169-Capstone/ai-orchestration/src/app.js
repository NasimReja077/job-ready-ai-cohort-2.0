import express from 'express';
import morgan from 'morgan';
import agentRouter from './routes/agent.routes.js';

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json());


app.get("/api/status/healthz", (req, res) => {
    res.status(200).json({ status: "ok" });
})

app.use("/api/ai", agentRouter);

app.use((error, req, res, next) => {
    if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
        return res.status(400).json({ error: "Invalid JSON request body" });
    }

    next(error);
});

export default app;