// Implements US-03 (onboarding wizard), US-07 (select allergy categories),
// and US-09 (edit profile at any time)
const express = require("express");
const { findUserById, updateUser } = require("../models/User");
const requireAuth = require("../middleware/requireAuth");

const router = express.Router();

const ALLERGEN_CATEGORIES = [
  "peanuts", "tree_nuts", "milk", "eggs", "wheat",
  "soy", "fish", "shellfish", "sesame",
];

router.get("/", requireAuth, async (req, res) => {
  const user = await findUserById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  return res.json({
    name: user.name,
    allergyCategories: user.allergyCategories,
    severity: user.severity,
    emergencyMedication: user.emergencyMedication,
    emergencyContact: user.emergencyContact,
  });
});

router.put("/", requireAuth, async (req, res) => {
  const { allergyCategories, severity, emergencyMedication, emergencyContact } = req.body;

  if (allergyCategories) {
    const invalid = allergyCategories.filter((c) => !ALLERGEN_CATEGORIES.includes(c));
    if (invalid.length > 0) {
      return res.status(400).json({ error: `Unknown allergy categories: ${invalid.join(", ")}` });
    }
  }

  const updated = await updateUser(req.userId, {
    allergyCategories: allergyCategories ?? [],
    severity: severity ?? {},
    emergencyMedication: emergencyMedication ?? null,
    emergencyContact: emergencyContact ?? null,
  });

  return res.json({
    name: updated.name,
    allergyCategories: updated.allergyCategories,
    severity: updated.severity,
    emergencyMedication: updated.emergencyMedication,
    emergencyContact: updated.emergencyContact,
  });
});

router.get("/allergen-categories", (req, res) => {
  res.json({ categories: ALLERGEN_CATEGORIES });
});

module.exports = router;
