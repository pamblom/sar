import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { MintButton } from "../ui";
import { useStore } from "../store";
import { colors } from "../theme";
import type { AppStack } from "../types";

export function WeighScreen({ navigation }: NativeStackScreenProps<AppStack, "Pesaje">) {
  const [kilos, setKilos] = useState("15");

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.sensor}>SENSOR LISTO · TOLVA 03</Text>
      <View style={styles.viewfinder}>
        <View style={styles.frame} />
        <Text style={styles.finderText}>Buscando QR de estación…</Text>
      </View>
      <Text style={styles.muted}>Apunta el visor al código QR de la báscula. Si no hay cámara, registra el peso manual.</Text>
      <Text style={styles.label}>Masa neta (kg)</Text>
      <TextInput keyboardType="decimal-pad" value={kilos} onChangeText={setKilos} style={styles.input} />
      <MintButton
        label="Capturar y continuar"
        onPress={() => {
          const value = Number(kilos.replace(",", "."));
          if (!value || value <= 0) return;
          navigation.navigate("Confirmar", { kilos: value, material: "PET cristal", fidelity: 98.4 });
        }}
      />
    </ScrollView>
  );
}

export function ConfirmScreen({ navigation, route }: NativeStackScreenProps<AppStack, "Confirmar">) {
  const { addWeighing } = useStore();
  const { kilos, material, fidelity } = route.params;
  const points = Math.round(kilos * 12);
  const [sent, setSent] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.sensor}>LECTURA QR EXITOSA · TOLVA 03</Text>
      <View style={styles.card}>
        <Text style={styles.muted}>Folio manifiesto</Text>
        <Text style={styles.folio}>#TK-8894-QR</Text>
        <Text style={styles.muted}>Estación central · Sensor dinámico A-24</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.muted}>MASA NETA CERTIFICADA</Text>
        <Text style={styles.mass}>{kilos.toFixed(2)} kg</Text>
      </View>
      <View style={styles.row}>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.muted}>Material</Text>
          <Text style={styles.title}>{material}</Text>
          <Text style={styles.muted}>Grado A+</Text>
        </View>
        <View style={[styles.card, { flex: 1 }]}>
          <Text style={styles.muted}>Abono estimado</Text>
          <Text style={styles.points}>+{points} PTS</Text>
        </View>
      </View>
      <View style={styles.card}>
        <Text style={styles.title}>Evidencia capturada</Text>
        <Text style={styles.muted}>OCR verificado {fidelity}%</Text>
      </View>
      {sent ? <Text style={styles.ok}>{sent}</Text> : null}
      <MintButton
        label="Enviar solicitud al administrador"
        onPress={() => {
          const created = addWeighing({ material, kilos, fidelity });
          setSent(`${created.id} quedó pendiente de validación.`);
        }}
      />
      <Pressable onPress={() => navigation.goBack()}>
        <Text style={styles.link}>Recalibrar o re-escanear</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 12, backgroundColor: colors.bg },
  sensor: { color: colors.mint, fontSize: 12, fontWeight: "700", letterSpacing: 0.6 },
  viewfinder: { height: 220, borderRadius: 24, backgroundColor: colors.lowest, alignItems: "center", justifyContent: "center" },
  frame: { width: 140, height: 140, borderRadius: 24, borderWidth: 2, borderColor: colors.mint },
  finderText: { position: "absolute", top: 16, color: colors.text, backgroundColor: colors.card, borderRadius: 99, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 4, fontSize: 12 },
  muted: { color: colors.muted, fontSize: 12 },
  label: { color: colors.primary, fontWeight: "600" },
  input: { minHeight: 48, borderRadius: 12, backgroundColor: colors.lowest, color: colors.text, paddingHorizontal: 14, fontSize: 18 },
  card: { backgroundColor: colors.card, borderRadius: 16, padding: 14, gap: 4 },
  folio: { color: colors.text, fontSize: 28, fontWeight: "800" },
  mass: { color: colors.text, fontSize: 36, fontWeight: "800" },
  row: { flexDirection: "row", gap: 10 },
  title: { color: colors.text, fontWeight: "700", fontSize: 16 },
  points: { color: colors.mint, fontSize: 22, fontWeight: "800" },
  ok: { color: colors.mint, fontWeight: "700" },
  link: { color: colors.sage, textAlign: "center" },
});
