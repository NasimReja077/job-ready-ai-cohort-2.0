import { Router } from "express";
import agent from "../agents/code.agent.js";

const agentRouter = Router();

agentRouter.post("/invoke", async (req, res) => {
    const { message, projectId } = req.body;

    if (!message || !projectId) {
        return res.status(400).json({ error: "message and projectId are required" });
    }

    try {
        const response = await agent.stream(
            { messages: [{ role: "user", content: message }] },
            { context: { projectId }, streamMode: "custom" }
        );

        // Open the stream only after the agent has started successfully
        res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",   // stops nginx buffering SSE
        });

        for await (const chunk of response) {
            res.write(`data: ${chunk}\n\n`);
        }
        res.end();                        // was res.json({ response })
    } catch (error) {
        console.error("Error invoking agent:", error);
        if (res.headersSent) {
            res.write(`event: error\ndata: ${error.message}\n\n`);
            res.end();
        } else {
            res.status(500).json({ error: "Failed to invoke agent" });
        }
    }
});

export default agentRouter;