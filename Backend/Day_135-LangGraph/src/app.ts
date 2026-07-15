import express from "express";
import useGraph from "./services/grap.ai.service.js"

const app = express();

app.get("/health", (req, res) => {
     res.status(200).json({
          status: "Success",
     })
})

app.post("/use-graph", async (req, res) => {
     await useGraph("Write a factorial in java")
})

export default app;
