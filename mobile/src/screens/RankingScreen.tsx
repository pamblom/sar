import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useStore } from "../store";
import { colors } from "../theme";

export function RankingScreen() {
  const { ranking, session } = useStore();
  const mine = ranking.findIndex((item) => item.mine) + 1;
  const top = ranking.slice(0, 3);
  const rest = ranking.slice(3);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.muted}>Temporada actual · {session?.zona ?? "Todas las zonas"}</Text>
      <View style={styles.podium}>
        <Text style={styles.h2}>Podio de honor</Text>
        <View style={styles.row}>
          {top.map((item, index) => (
            <View key={item.name} style={[styles.person, index === 0 && styles.first]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.name.slice(0, 2).toUpperCase()}</Text>
              </View>
              <Text style={styles.name}>{item.name.split(" ")[0]}</Text>
              <Text style={styles.points}>{item.points.toLocaleString("es-CO")} pts</Text>
              <Text style={styles.muted}>{item.level}</Text>
            </View>
          ))}
        </View>
      </View>
      {mine > 0 ? <Text style={styles.banner}>Estás en el puesto #{mine}</Text> : null}
      {rest.map((item, index) => (
        <View key={item.name} style={styles.line}>
          <Text style={styles.pos}>{index + 4}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.muted}>{item.level} · {item.kilos} kg</Text>
          </View>
          <Text style={styles.points}>{item.points.toLocaleString("es-CO")}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, gap: 10, backgroundColor: colors.bg },
  muted: { color: colors.muted, fontSize: 12 },
  podium: { backgroundColor: colors.card, borderRadius: 18, padding: 14, gap: 12 },
  h2: { color: colors.text, fontWeight: "700", fontSize: 16 },
  row: { flexDirection: "row", justifyContent: "space-around" },
  person: { alignItems: "center", gap: 2, opacity: 0.9 },
  first: { opacity: 1, marginTop: -8 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: colors.pine, alignItems: "center", justifyContent: "center" },
  avatarText: { color: "white", fontWeight: "800" },
  name: { color: colors.text, fontWeight: "700" },
  points: { color: colors.mint, fontWeight: "700" },
  banner: { backgroundColor: "rgba(42,107,92,0.35)", color: colors.mint, padding: 12, borderRadius: 14, fontWeight: "700" },
  line: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: colors.low, borderRadius: 14, padding: 12 },
  pos: { color: colors.muted, width: 18 },
});
