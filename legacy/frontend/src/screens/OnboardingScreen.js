// US-03: As a user, I want to complete a guided onboarding wizard
// so that I can set up my allergy profile quickly.
// US-07: As a user, I want to select my allergy categories
// so that the app knows what to check for.
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { updateProfile } from "../services/api";
import { getAccessToken } from "../services/authStorage";

const ALLERGEN_CATEGORIES = [
  "peanuts", "tree_nuts", "milk", "eggs", "wheat",
  "soy", "fish", "shellfish", "sesame",
];

export default function OnboardingScreen({ navigation }) {
  const [selected, setSelected] = useState([]);

  const toggle = (category) => {
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleContinue = async () => {
    const accessToken = await getAccessToken();
    await updateProfile(accessToken, { allergyCategories: selected });
    navigation.replace("Home");
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Let's set up your allergy profile</Text>
      <View style={styles.chipContainer}>
        {ALLERGEN_CATEGORIES.map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.chip, selected.includes(category) && styles.chipSelected]}
            onPress={() => toggle(category)}
          >
            <Text style={[styles.chipText, selected.includes(category) && styles.chipTextSelected]}>
              {category.replace("_", " ")}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <TouchableOpacity style={styles.button} onPress={handleContinue}>
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 20, fontWeight: "700", marginBottom: 20, marginTop: 40 },
  chipContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderColor: "#028090", borderRadius: 20, paddingVertical: 8, paddingHorizontal: 16, marginRight: 8, marginBottom: 8 },
  chipSelected: { backgroundColor: "#028090" },
  chipText: { color: "#028090", textTransform: "capitalize" },
  chipTextSelected: { color: "#fff" },
  button: { backgroundColor: "#028090", borderRadius: 8, padding: 14, alignItems: "center", marginTop: 32 },
  buttonText: { color: "#fff", fontWeight: "600" },
});
