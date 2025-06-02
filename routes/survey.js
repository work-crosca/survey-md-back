import express from "express";
import SurveyResponse from "../models/SurveyResponse.js";
import { Parser } from "json2csv";

const router = express.Router();

// [POST] Trimite răspunsuri
router.post("/submit", async (req, res) => {
  try {
    const data = {
      ...req.body,
      completedAt: new Date(),
      userAgent: req.headers["user-agent"],
    };

    const saved = await SurveyResponse.create(data);
    res.status(201).json({ message: "Response saved", id: saved._id });
  } catch (err) {
    console.error("Error saving response:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// [GET] Export răspunsuri
router.get("/export", async (req, res) => {
   try {
     const filters = {};
     if (req.query.lang) filters.lang = req.query.lang;
     if (req.query.campaign) filters.campaign = req.query.campaign;
     if (req.query.dateStart) filters.completedAt = { $gte: new Date(req.query.dateStart) };
     if (req.query.dateEnd) {
       filters.completedAt = filters.completedAt || {};
       filters.completedAt.$lte = new Date(req.query.dateEnd);
     }
 
     const responses = await SurveyResponse.find(filters);
 
     if (req.query.format === "csv") {
       const fields = ["token", "lang", "completedAt", "userAgent", "answers", "campaign"];
       const parser = new Parser({ fields });
       const csv = parser.parse(responses);
 
       res.header("Content-Type", "text/csv");
       res.attachment("survey-responses.csv");
       return res.send(csv);
     }
 
     res.json(responses);
   } catch (err) {
     console.error("Export error:", err);
     res.status(500).json({ error: "Export failed" });
   }
 });

export default router;