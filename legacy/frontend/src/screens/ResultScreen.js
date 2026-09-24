// Shared result display for scan verdicts (Safe / Caution / Unsafe),
// per SPEC F4: "Result screen renders identically whether verdict
// came from barcode or OCR."
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const VERDICT_STYLES = {
  unsafe: { backgroundColor: "#FBEAEA", color: "#B14A3D", label: "Unsafe" },
  caution: { backgroundColor: "#FFF7E6", color: "#B8860B", label: "Caution" },
  safe: { backgroundColor: "#EAF7ED", color: "#2E7D32", label: "Safe" },
  unknown: { backgroundColor: "#F0F0F0", color: "#555", label: "Unknown" },
};

export default function ResultScreen({ route }) {
  const { result, error } = route.params || {};

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const verdictStyle = VERDICT_STYLES[result.status || result.verdict] || VERDICT_STYLES.unknown;

  return (
    <View style={styles.container}>
      <View style={[styles.badge, { backgroundColor: verdictStyle.backgroundColor }]}>
        <Text style={[styles.badgeText, { color: verdictStyle.color }]}>{verdictStyle.label}</Text>
      </View>
      <Text style={styles.productName}>{result.productName || "Unknown product"}</Text>
      {result.flagged && result.flagged.length > 0 && (
        <View style={styles.flaggedContainer}>
          <Text style={styles.sectionTitle}>Why this verdict?</Text>
          {result.flagged.map((f, i) => (
            <Text key={i} style={styles.flaggedItem}>
              • {f.category.replace("_", " ")} (matched "{f.matched_alias}")
              {f.is_user_allergen ? " — this is one of your allergens" : ""}
            </Text>
          ))}
        </View>
      )}
      <Text style={styles.disclaimer}>
        This verdict is not medical advice. Always double-check with the physical
        packaging if you have a severe allergy.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  badge: { alignSelf: "flex-start", paddingVertical: 8, paddingHorizontal: 20, borderRadius: 20, marginBottom: 16 },
  badgeText: { fontWeight: "700", fontSize: 16 },
  productName: { fontSize: 20, fontWeight: "700", marginBottom: 20 },
  sectionTitle: { fontWeight: "600", marginBottom: 8 },
  flaggedContainer: { marginBottom: 24 },
  flaggedItem: { marginBottom: 4, color: "#3E5250" },
  errorText: { color: "#B14A3D", textAlign: "center", marginTop: 100 },
  disclaimer: { color: "#8A9391", fontSize: 12, marginTop: "auto" },
});
