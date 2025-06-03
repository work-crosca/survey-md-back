import express from "express";
import SurveyResponse from "../models/SurveyResponse.js";
import Campaign from "../models/Campaign.js";
import { Parser } from "json2csv";
import allQuestions from "../utils/questions.js";

const router = express.Router();

// [POST] Trimite răspunsuri
router.post("/submit", async (req, res) => {
  try {
    let data = {
      ...req.body,
      completedAt: new Date(),
      userAgent: req.headers["user-agent"],
    };

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
    let campaignDoc = null;

    if (lang) filter.lang = lang;
    if (campaign) {
      campaignDoc = await Campaign.findOne({ name: campaign });
      if (campaignDoc) {
        filter.campanie = campaignDoc._id;
      } else {
        return res.json([]);
      }
    }
    if (token) filter.token = { $regex: token, $options: "i" };
    if (dateStart || dateEnd) filter.completedAt = {};
    if (dateStart) filter.completedAt.$gte = new Date(dateStart);
    if (dateEnd) filter.completedAt.$lte = new Date(dateEnd);

    const rawResponses = await SurveyResponse.find(filter)
      .populate("campanie", "name color")
      .lean();

    // 🧠 Normalizează answers dacă e array
    const responses = rawResponses.map((r) => {
      if (Array.isArray(r.answers) && r.answers.length === 1 && typeof r.answers[0] === "object") {
        r.answers = r.answers[0];
      }
      return r;
    });

    if (format === "csv") {
      const baseFields = ["token", "lang", "completedAt", "userAgent", "campanie", "color"];
      let questionFields = [];

      let relevantQuestions = campaignDoc?.questions?.length
        ? allQuestions.filter((q) => campaignDoc.questions.includes(q.id))
        : [];

      if (!relevantQuestions.length) {
        const usedIds = new Set();
        responses.forEach((r) => {
          if (r.answers && typeof r.answers === "object") {
            Object.keys(r.answers).forEach((id) => usedIds.add(id));
          }
        });
        relevantQuestions = allQuestions.filter((q) => usedIds.has(q.id));
      }

      questionFields = relevantQuestions.map((q) => ({
        label: q.question_ro,
        value: (row) => {
          const val = row.answers?.[q.id];
          if (Array.isArray(val)) return val.join(", ");
          return val ?? "";
        },
      }));

      const fields = [
        ...baseFields.map((f) => ({
          label: f,
          value: (row) =>
            f === "campanie" ? row.campanie?.name :
            f === "color" ? row.campanie?.color :
            row[f] ?? "",
        })),
        ...questionFields,
      ];

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