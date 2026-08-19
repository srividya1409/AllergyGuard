// US-09: As a user, I want to edit my profile at any time
// so that I can keep my information up to date.
import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { getProfile, updateProfile } from "../services/api";
import { getAccessToken } from "../services/authStorage";

const ALLERGEN_CATEGORIES = [
  "peanuts", "tree_nuts", "milk", "eggs", "wheat",
  "soy", "fish", "shellfish", "sesame",
];

export default function ProfileScreen() {
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      const accessToken = await getAccessToken();
      const profile = await getProfile(accessToken);
      setSelected(profile.allergyCategories || []);
      setLoading(false);
    })();
  }, []);

  const toggle = (category) => {
    setSaved(false);
    setSelected((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const handleSave = async () => {
    const accessToken = await getAccessToken();
    await updateProfile(accessToken, { allergyCategories: selected });
    setSaved(true);
  };

  if (loading) return <View style={styles.container}><Text>Loading...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Your Allergy Profile</Text>
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
      <TouchableOpacity style={styles.button} onPress={handleSave}>
        <Text style={styles.buttonText}>Save Changes</Text>
      </TouchableOpacity>
      {saved ? <Text style={styles.savedText}>Profile updated</Text> : null}
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
  savedText: { color: "#2E7D32", textAlign: "center", marginTop: 12 },
});
