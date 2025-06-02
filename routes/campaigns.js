import express from "express";
import Campaign from "../models/Campaign.js";
import SurveyResponse from "../models/SurveyResponse.js";

const router = express.Router();

// [GET] Listare campanii cu număr răspunsuri per campanie
router.get("/", async (req, res) => {
  try {
    // Preiau toate campaniile (sau doar active, dacă dorești)
    const campaigns = await Campaign.find().sort({ createdAt: -1 });

    // Agregare: număr răspunsuri pentru fiecare campanie
    // Mapăm fiecare campanie cu răspunsurile aferente
    const campaignsWithCounts = await Promise.all(
      campaigns.map(async (camp) => {
        const count = await SurveyResponse.countDocuments({
          campanie: camp._id,
        });
        return {
          _id: camp._id,
          name: camp.name,
          description: camp.description,
          createdAt: camp.createdAt,
          active: camp.active,
          responsesCount: count,
        };
      })
    );

    res.json(campaignsWithCounts);
  } catch (err) {
    console.error("Eroare la obținerea campaniilor:", err);
    res.status(500).json({ error: "Eroare server" });
  }
});

// [POST] Creare campanie nouă
router.post("/", async (req, res) => {
  try {
    const { name, description, active } = req.body;

    if (!name || name.trim() === "") {
      return res
        .status(400)
        .json({ error: "Numele campaniei este obligatoriu" });
    }

    const existing = await Campaign.findOne({ name: name.trim() });
    if (existing) {
      return res
        .status(400)
        .json({ error: "O campanie cu acest nume există deja" });
    }

    const campaign = new Campaign({
      name: name.trim(),
      description: description || "",
      active: active !== undefined ? active : true,
    });

    await campaign.save();

    res.status(201).json(campaign);
  } catch (err) {
    console.error("Eroare la crearea campaniei:", err);
    res.status(500).json({ error: "Eroare la crearea campaniei" });
  }
});

// [PATCH] Editare campanie existentă după ID
router.patch("/:id", async (req, res) => {
  try {
    const { name, description, active, color } = req.body;

    if (name && name.trim() === "") {
      return res
        .status(400)
        .json({ error: "Numele campaniei nu poate fi gol" });
    }

    // Verifică dacă există altă campanie cu același nume
    if (name) {
      const existing = await Campaign.findOne({
        name: name.trim(),
        _id: { $ne: req.params.id },
      });
      if (existing) {
        return res
          .status(400)
          .json({ error: "O altă campanie cu acest nume există deja" });
      }
    }

    const updatedCampaign = await Campaign.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(description !== undefined && { description }),
        ...(active !== undefined && { active }),
        ...(color !== undefined && { color }),
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

// routes/campaigns.js
router.get("/:name", async (req, res) => {
  console.log("Received campaign name:", req.params.name);
  try {
    const campanie = await Campaign.findOne({ name: req.params.name });
    if (!campanie) {
      console.log("Campanie negăsită");
      return res.status(404).json({ error: "Campania nu a fost găsită" });
    }
    res.json(campanie);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Eroare server" });
  }
});

export default router;
