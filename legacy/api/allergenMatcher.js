// Shared allergen-matching logic (SPEC F7).
// Used by both the barcode scan flow (US-11) and, in a later sprint,
// the OCR label scan flow, so verdicts are identical regardless of
// which scan method was used.

const ALLERGEN_ALIASES = {
  peanuts: ["peanut", "peanuts", "arachis oil", "groundnut"],
  tree_nuts: ["almond", "cashew", "walnut", "pecan", "hazelnut", "pistachio"],
  milk: ["milk", "casein", "whey", "lactose", "butter"],
  eggs: ["egg", "eggs", "albumin", "ovalbumin"],
  wheat: ["wheat", "gluten", "flour"],
  soy: ["soy", "soybean", "soya", "lecithin"],
  fish: ["fish", "anchovy", "cod", "salmon", "tuna"],
  shellfish: ["shrimp", "crab", "lobster", "shellfish", "prawn"],
  sesame: ["sesame", "tahini", "sesame oil"],
};

/**
 * Matches ingredient text against a user's allergy categories.
 *
 * @param {string} ingredientText - raw ingredient list from a product
 * @param {string[]} userAllergyCategories - category keys the user has flagged
 * @returns {{ status: 'unsafe'|'caution'|'safe', flagged: Array }}
 */
function analyzeIngredients(ingredientText, userAllergyCategories = []) {
  const text = (ingredientText || "").toLowerCase();
  const flagged = [];

  for (const [category, aliases] of Object.entries(ALLERGEN_ALIASES)) {
    const sortedAliases = [...aliases].sort((a, b) => b.length - a.length);

    for (const alias of sortedAliases) {
      const pattern = new RegExp(`\\b${escapeRegex(alias)}\\b`, "i");
      if (pattern.test(text)) {
        flagged.push({
          category,
          matched_alias: alias,
          is_user_allergen: userAllergyCategories.includes(category),
        });
        break;
      }
    }
  }

  const hasUserMatch = flagged.some((f) => f.is_user_allergen);
  const hasAnyFlag = flagged.length > 0;
  const status = hasUserMatch ? "unsafe" : hasAnyFlag ? "caution" : "safe";

  return { status, flagged };
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

module.exports = { analyzeIngredients, ALLERGEN_ALIASES };
