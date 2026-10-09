import express from "express";
import catsRoute from "./routes/cat.routes.ts";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api/cats", catsRoute);

export default app;