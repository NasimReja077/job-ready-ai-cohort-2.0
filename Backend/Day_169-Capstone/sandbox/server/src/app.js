import express from 'express';
import morgan from 'morgan';

// import { createPod } from './kubernetes/pod.js';
// import { createService } from './kubernetes/service.js';
// import { v7 as uuid } from "uuid"
// import { createSandboxKey } from './config/redis.js';

import cookieParser from 'cookie-parser';
import sandboxRouter from './routes/sandbox.routes.js';


const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());


app.get('/api/sandbox/livez', (req, res) => {
    res.status(200).json({ status: 'ok' });
});


app.get('/api/sandbox/health', (req, res) => {
    res.status(200).json({
        message: 'Sandbox API is healthy',
        status: 'ok'
    });
});

// app.post("/api/sandbox/start", async (req, res) => {

//     const sandboxId = uuid();

//     try {
//         await Promise.all([
//             createPod(sandboxId),
//             createService(sandboxId),
//             createSandboxKey(sandboxId)
//         ]);
//     } catch (err) {
//         console.error(`Failed to create sandbox ${sandboxId}:`, err.message);
//         return res.status(500).json({ error: 'Failed to create sandbox environment' });
//     }

//     return res.status(201).json({
//         message: 'Sandbox environment created successfully',
//         sandboxId,
//         previewUrl: `/api/sandbox/preview/${encodeURIComponent(sandboxId)}`
//     })
// })

app.use('/api/sandbox', sandboxRouter);

export default app;