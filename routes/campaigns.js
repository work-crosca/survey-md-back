import express from "express";
import Campaign from "../models/Campaign.js";

const router = express.Router();

// [GET] Lista campaniilor, ordonat după data creării descrescător
router.get("/", async (req, res) => {
  try {
    const campaigns = await Campaign.find().sort({ createdAt: -1 });
    res.json(campaigns);
  } catch (err) {
    console.error("Eroare la preluarea campaniilor:", err);
    res.status(500).json({ error: "Eroare la preluarea campaniilor" });
  }
});

// [POST] Creare campanie nouă
router.post("/", async (req, res) => {
  try {
    const { name, description, active } = req.body;

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
    const { name, description, active } = req.body;

    if (name && name.trim() === "") {
      return res.status(400).json({ error: "Numele campaniei nu poate fi gol" });
    }

    // Verifică dacă există altă campanie cu același nume
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

export default router;