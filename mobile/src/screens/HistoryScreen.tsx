import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useStore } from "../store";
import { colors } from "../theme";

export function HistoryScreen() {
  const { session, weighings } = useStore();
  if (!session) return null;
  const kilos = weighings.filter((item) => item.status === "Aprobada").reduce((sum, item) => sum + item.kilos, 0);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.summary}>
        <View style={styles.col}>
          <Text style={styles.muted}>Total acopiado</Text>
          <Text style={styles.big}>{kilos} kg</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.muted}>Puntos</Text>
          <Text style={[styles.big, { color: colors.mint }]}>{session.puntos.toLocaleString("es-CO")}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.muted}>Pesajes</Text>
          <Text style={styles.big}>{weighings.length}</Text>
        </View>
      </View>
      {weighings.map((item) => (
        <View key={item.id} style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.title}>{item.material}</Text>
            <Text style={[styles.pill, item.status === "Aprobada" ? styles.ok : styles.wait]}>{item.status}</Text>
          </View>
          <Text style={styles.muted}>{item.createdAt}</Text>
          <View style={styles.row}>
            <Text style={styles.kg}>{item.kilos.toFixed(1)} kg</Text>
            <Text style={styles.points}>+{item.points} pts</Text>
          </View>
          <Text style={styles.muted}>Certificado #{item.id} · IA {item.fidelity}%</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 10, backgroundColor: colors.bg },
  summary: { flexDirection: "row", backgroundColor: colors.card, borderRadius: 16, padding: 12 },
  col: { flex: 1 },
  muted: { color: colors.muted, fontSize: 11 },
  big: { color: colors.text, fontSize: 20, fontWeight: "800" },
  card: { backgroundColor: colors.low, borderRadius: 16, padding: 12, gap: 4 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { color: colors.text, fontWeight: "700", fontSize: 16 },
  kg: { color: colors.text, fontSize: 22, fontWeight: "800" },
  points: { color: colors.mint, fontWeight: "800" },
  pill: { overflow: "hidden", borderRadius: 99, paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, fontWeight: "700" },
  ok: { backgroundColor: "rgba(75,221,181,0.15)", color: colors.mint },
  wait: { backgroundColor: colors.high, color: colors.muted },
});
