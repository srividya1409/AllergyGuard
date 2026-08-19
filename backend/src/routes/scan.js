// Implements US-11: As a user, I want to scan a product barcode
// so that I get an instant safety verdict.
const express = require("express");
const fetch = require("node-fetch");
const { findUserById } = require("../models/User");
const requireAuth = require("../middleware/requireAuth");
const { analyzeIngredients } = require("../../../api/allergenMatcher");

const router = express.Router();
const scanHistory = {};

router.post("/barcode", requireAuth, async (req, res) => {
  const { barcode } = req.body;
  if (!barcode) return res.status(400).json({ error: "barcode is required" });

  const user = await findUserById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });

  let product;
  try {
    const response = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
    );
    const data = await response.json();

    if (!data || data.status !== 1) {
      return res.status(404).json({
        error: "Product not found",
        fallback: "Try scanning the ingredient label instead",
      });
    }
    product = data.product;
  } catch (err) {
    return res.status(502).json({ error: "Could not reach the product database" });
  }

  const ingredientText = product.ingredients_text || "";
  if (!ingredientText) {
    return res.json({
      status: "unknown",
      message: "Ingredient data unavailable — try scanning the label instead",
      productName: product.product_name || "Unknown product",
    });
  }

  const verdict = analyzeIngredients(ingredientText, user.allergyCategories);

  const scanRecord = {
    id: Date.now(),
    barcode,
    productName: product.product_name || "Unknown product",
    ingredientText,
    verdict: verdict.status,
    flagged: verdict.flagged,
    scannedAt: new Date().toISOString(),
  };
  scanHistory[req.userId] = scanHistory[req.userId] || [];
  scanHistory[req.userId].push(scanRecord);

  return res.json(scanRecord);
});

router.get("/history", requireAuth, async (req, res) => {
  return res.json({ scans: scanHistory[req.userId] || [] });
});

module.exports = router;
