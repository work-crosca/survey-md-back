import express from "express";
import mongoose from "mongoose";
import Campaign from "../models/Campaign.js";
import SurveyResponse from "../models/SurveyResponse.js";
import allQuestions from "../utils/questions.js";

const router = express.Router();

// [GET] Listare campanii
router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    const campaignsWithCounts = await Promise.all(
      campaigns.map(async (camp) => {
        const count = await SurveyResponse.countDocuments({ campanie: camp._id });
        return {
          _id: camp._id,
          name: camp.name,
          description: camp.description,
          createdAt: camp.createdAt,
          active: camp.active,
          color: camp.color,
          responsesCount: count,
          questions: camp.questions || [],
        };
      })
    );
    res.json(campaignsWithCounts);
  } catch (err) {
    console.error("Eroare la obținerea campaniilor:", err);
    res.status(500).json({ error: "Eroare server" });
  }
});

// [POST] Creare campanie
router.post("/", async (req, res) => {
  try {
    const { name, description, active, color, questions } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Numele campaniei este obligatoriu" });
    }

    const existing = await Campaign.findOne({ name: name.trim() });
    if (existing) {
      return res.status(400).json({ error: "O campanie cu acest nume există deja" });
    }

    const campaign = new Campaign({
      name: name.trim(),
      description: description || "",
      active: active !== undefined ? active : true,
      color,
      questions: Array.isArray(questions) ? questions : [],
    });

    await campaign.save();
    res.status(201).json(campaign);
  } catch (err) {
    console.error("Eroare la crearea campaniei:", err);
    res.status(500).json({ error: "Eroare la crearea campaniei" });
  }
});

// [PATCH] Editare campanie
router.patch("/:id", async (req, res) => {
  try {
    const { name, description, active, color, questions } = req.body;

    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ error: "ID invalid" });
    }

    if (name && name.trim() === "") {
      return res.status(400).json({ error: "Numele campaniei nu poate fi gol" });
    }

    if (name) {
      const existing = await Campaign.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res.status(400).json({ error: "O altă campanie cu acest nume există deja" });
      }
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(active !== undefined && { active }),
        ...(color !== undefined && { color }),
        ...(questions !== undefined && { questions }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedCampaign) {
      return res.status(404).json({ error: "Campania nu a fost găsită" });
    }

    res.json(updatedCampaign);
  } catch (err) {
    console.error("Eroare la actualizarea campaniei:", err);
    res.status(500).json({ error: "Eroare la actualizarea campaniei" });
  }
});

// [GET] Campanie după nume
router.get("/name/:name", async (req, res) => {
  try {
    const campanie = await Campaign.findOne({ name: req.params.name });
    if (!campanie) {
      return res.status(404).json({ error: "Campania nu a fost găsită" });
    }
    res.json(campanie);
  } catch (err) {
    console.error("Eroare la obținerea campaniei după nume:", err);
    res.status(500).json({ error: "Eroare server" });
  }
});

// [GET] Campanie după ID
router.get("/:id", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "ID invalid" });
  }

  try {
    const campanie = await Campaign.findById(req.params.id);
    if (!campanie) {
      return res.status(404).json({ error: "Campania nu a fost găsită" });
    }
    res.json(campanie);
  } catch (err) {
    console.error("Eroare la obținerea campaniei după ID:", err);
    res.status(500).json({ error: "Eroare server" });
  }
});

// [GET] Întrebările campaniei (cu text complet)
router.get("/:id/questions", async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(400).json({ error: "ID invalid" });
  }

  try {
    const campanie = await Campaign.findById(req.params.id);
    if (!campanie) {
      return res.status(404).json({ error: "Campania nu a fost găsită" });
    }

    const selectedQuestions = allQuestions.filter((q) =>
      campanie.questions.includes(q.id)
    );

    res.json(selectedQuestions);
  } catch (err) {
    console.error("Eroare la obținerea întrebărilor campaniei:", err);
    res.status(500).json({ error: "Eroare server" });
  }
});


// [GET] întrebările campaniei după nume
router.get("/name/:name/questions", async (req, res) => {
  try {
    const campanie = await Campaign.findOne({ name: req.params.name });
    if (!campanie) {
      return res.status(404).json({ error: "Campania nu a fost găsită" });
    }

    const selectedQuestions = allQuestions.filter((q) =>
      campanie.questions.includes(q.id)
    );

    res.json(selectedQuestions);
  } catch (err) {
    console.error("Eroare la întrebări:", err);
    res.status(500).json({ error: "Eroare server" });
  }
});

export default router;