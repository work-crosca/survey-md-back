import express from "express";
import SurveyResponse from "../models/SurveyResponse.js";
import Campaign from "../models/Campaign.js";
import { Parser } from "json2csv";

const router = express.Router();

// [POST] Trimite răspunsuri
router.post("/submit", async (req, res) => {
  try {
    let data = {
      ...req.body,
      completedAt: new Date(),
      userAgent: req.headers["user-agent"],
    };

    // Transformă campanie din nume în ObjectId
    if (data.campanie && typeof data.campanie === "string") {
      const found = await Campaign.findOne({ name: data.campanie });
      if (!found) {
        return res.status(400).json({ error: "Campania specificată nu există." });
      }
      data.campanie = found._id;
    }

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
    if (campaign) {
      const found = await Campaign.findOne({ name: campaign });
      if (found) {
        filter.campanie = found._id;
      } else {
        return res.json([]);
      }
    }
    if (token) filter.token = { $regex: token, $options: "i" };
    if (dateStart || dateEnd) filter.completedAt = {};
    if (dateStart) filter.completedAt.$gte = new Date(dateStart);
    if (dateEnd) filter.completedAt.$lte = new Date(dateEnd);

    const responses = await SurveyResponse.find(filter).populate("campanie", "name color");

    if (format === "csv") {
      // câmpuri statice
      const baseFields = ["token", "lang", "completedAt", "userAgent", "campanie.name", "campanie.color"];

      // câmpuri dinamice din answers
      const allKeys = new Set();
      responses.forEach((r) => {
        if (r.answers && typeof r.answers === "object") {
          Object.keys(r.answers).forEach((key) => allKeys.add(`answers.${key}`));
        }
      });

      const dynamicFields = Array.from(allKeys);
      const fields = [...baseFields, ...dynamicFields];

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