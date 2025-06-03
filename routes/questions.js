// routes/questions.js
import express from "express";
import questions from "../utils/questions.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json(questions);
});

export default router;