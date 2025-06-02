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
     const { lang, campaign, token, dateStart, dateEnd, format } = req.query;
 
     const filter = {};
     if (lang) filter.lang = lang;
     if (campaign) filter.campanie = campaign;
     if (token) filter.token = { $regex: token, $options: "i" };
     if (dateStart || dateEnd) filter.completedAt = {};
     if (dateStart) filter.completedAt.$gte = new Date(dateStart);
     if (dateEnd) filter.completedAt.$lte = new Date(dateEnd);
 
     const responses = await SurveyResponse.find(filter);
 
     if (format === "csv") {
       const fields = ["token", "lang", "completedAt", "userAgent", "answers"];
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