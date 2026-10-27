
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
}));
app.use(express.json());

const feedbackSchema = new mongoose.Schema({
  q1: { type: String, required: true, trim: true },
  q2: { type: String, required: true, trim: true },
  q3: { type: String, required: true, trim: true },
  q4: { type: String, required: true, trim: true },
  q5: { type: String, default: "", trim: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  submittedAt: { type: Date, default: Date.now },
});

const Feedback = mongoose.model("Feedback", feedbackSchema);

app.get("/", (req, res) => {
  res.send("PulseSurvey backend is running");
});

app.get("/api/health", (req, res) => {
  res.json({
    server: "running",
    database: mongoose.connection.readyState === 1
      ? "connected"
      : "disconnected",
  });
});

app.post("/api/feedback", async (req, res) => {
  try {
    const { q1, q2, q3, q4, q5, rating } = req.body;

    if (
      !q1?.trim() ||
      !q2?.trim() ||
      !q3?.trim() ||
      !q4?.trim() ||
      !Number.isInteger(Number(rating)) ||
      Number(rating) < 1 ||
      Number(rating) > 5
    ) {
      return res.status(400).json({
        message: "Please complete all required fields and select a rating.",
      });
    }

    const feedback = await Feedback.create({
      q1, q2, q3, q4,
      q5: q5 || "",
      rating: Number(rating),
    });

    res.status(201).json({
      message: "Feedback saved successfully",
      feedback,
    });
  } catch (error) {
    console.error("Save error:", error);
    res.status(500).json({
      message: "Could not save feedback",
    });
  }
});

app.get("/api/getfeedback", async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .sort({ submittedAt: -1 })
      .lean();

    res.json(feedbacks);
  } catch (error) {
    console.error("Fetch error:", error);
    res.status(500).json({
      message: "Could not retrieve feedback",
    });
  }
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    const mongoUri =
      process.env.MONGO_URI ||
      "mongodb://127.0.0.1:27017/feedback";

    await mongoose.connect(mongoUri);
    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
