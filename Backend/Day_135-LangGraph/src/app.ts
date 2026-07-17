import express from "express";
import useGraph from "./services/grap.ai.service.js"

const app = express();

app.get("/health", (req, res) => {
     res.status(200).json({
          status: "Success",
     })
})

app.post("/use-graph", async (req, res) => {
     await useGraph("give short description of Langchain in 15 words")
})

export default app;
