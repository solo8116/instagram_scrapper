import express from "express";
import cors from "cors";
import { bot } from "./bot.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "*",
  })
);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;

app.get("/", (req, res) => {
  res.send("welcome");
});

app.post("/", async (req, res) => {
  try {
    const { instagramId } = req.body;
    const posts = await bot(instagramId);
    res.status(200).json({
      success: true,
      message: "posts fetched successfully",
      data: posts,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "internal server error",
    });
  }
});

app.listen(PORT, () => {
  console.log(`running on port ${PORT}`);
});
