// US-11: As a user, I want to scan a product barcode
// so that I get an instant safety verdict.
import React, { useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { scanBarcode } from "../services/api";
import { getAccessToken } from "../services/authStorage";

export default function ScannerScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const scannedOnce = useRef(false);

  const handleBarcodeScanned = async ({ data: barcode }) => {
    if (scannedOnce.current) return;
    scannedOnce.current = true;
    setScanned(true);
    setLoading(true);

    try {
      const accessToken = await getAccessToken();
      const result = await scanBarcode(accessToken, barcode);
      navigation.navigate("Result", { result });
    } catch (err) {
      navigation.navigate("Result", { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need camera access to scan barcodes.</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["ean13", "upc_a", "ean8"] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      {loading && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Checking product…</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  message: { color: "#fff", textAlign: "center", marginTop: 100, padding: 24 },
  button: { backgroundColor: "#028090", borderRadius: 8, padding: 14, alignItems: "center", margin: 24 },
  buttonText: { color: "#fff", fontWeight: "600" },
  overlay: { position: "absolute", bottom: 60, left: 0, right: 0, alignItems: "center" },
  overlayText: { color: "#fff", backgroundColor: "rgba(0,0,0,0.6)", padding: 12, borderRadius: 8 },
});
