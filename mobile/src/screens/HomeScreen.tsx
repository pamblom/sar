import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useStore } from "../store";
import { colors, rankFromPoints } from "../theme";

export function HomeScreen() {
  const navigation = useNavigation();
  const { session, weighings } = useStore();
  if (!session) return null;
  const rank = rankFromPoints(session.puntos);
  const recent = weighings.slice(0, 3);

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.hello}>Hola, {session.nombres}</Text>
          <Text style={styles.muted}>Tu esfuerzo regenera el ecosistema urbano</Text>
        </View>
        <View style={styles.badge}>
          <View style={styles.dot} />
          <Text style={styles.badgeText}>{rank.nombre}</Text>
        </View>
      </View>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.muted}>Próximo rango: {rank.nextName}</Text>
          <Text style={styles.mint}>{Math.round(rank.progress)}%</Text>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${rank.progress}%` }]} />
        </View>
        <Text style={styles.muted}>Faltan {Math.max(0, Math.round(rank.missing))} pts</Text>
      </View>
      <View style={styles.card}>
        <Text style={styles.kicker}>PUNTOS ACTUALES</Text>
        <Text style={styles.score}>
          {session.puntos.toLocaleString("es-CO")} <Text style={styles.mint}>PTS</Text>
        </Text>
        <Text style={styles.muted}>Valor canjeable ${(session.puntos / 100).toFixed(2)}</Text>
      </View>
      <Pressable
        style={styles.cta}
        onPress={() => navigation.getParent()?.navigate("Pesaje" as never)}
      >
        <Text style={styles.ctaTitle}>NUEVO PESAJE</Text>
        <Text style={styles.ctaSub}>Escanear código en báscula</Text>
      </Pressable>
      <View style={styles.card}>
        <Text style={styles.h2}>Tu impacto hoy</Text>
        <View style={styles.metrics}>
          {[
            ["50 L", "Agua"],
            ["2.0", "Árboles"],
            ["-3.2 kg", "CO₂"],
          ].map(([value, label]) => (
            <View key={label} style={styles.metric}>
              <Text style={styles.metricValue}>{value}</Text>
              <Text style={styles.muted}>{label}</Text>
            </View>
          ))}
        </View>
      </View>
      <Text style={styles.h2}>Actividad reciente</Text>
      {recent.map((item) => (
        <View key={item.id} style={styles.activity}>
          <View style={{ flex: 1 }}>
            <Text style={styles.itemTitle}>
              {item.material} · {item.kilos} kg
            </Text>
            <Text style={styles.muted}>{item.createdAt} · {item.zone}</Text>
          </View>
          <View>
            <Text style={styles.mint}>+{item.points} pts</Text>
            <Text style={styles.muted}>{item.status}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 16, paddingBottom: 32, gap: 12, backgroundColor: colors.bg },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 8 },
  hello: { color: colors.text, fontSize: 28, fontWeight: "700" },
  muted: { color: colors.muted, fontSize: 12 },
  badge: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: colors.high, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 6 },
  badgeText: { color: colors.primary, fontSize: 10, fontWeight: "700" },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.mint },
  card: { backgroundColor: colors.card, borderRadius: 18, padding: 14, gap: 8 },
  kicker: { color: colors.muted, letterSpacing: 1, fontSize: 11 },
  score: { color: colors.text, fontSize: 40, fontWeight: "800" },
  mint: { color: colors.mint, fontWeight: "700" },
  track: { height: 8, borderRadius: 99, backgroundColor: colors.highest, overflow: "hidden" },
  fill: { height: 8, backgroundColor: colors.mint },
  cta: { backgroundColor: "#043329", borderRadius: 18, padding: 16, borderWidth: 1, borderColor: colors.mint },
  ctaTitle: { color: "white", fontSize: 18, fontWeight: "800" },
  ctaSub: { color: colors.primary, fontSize: 12 },
  h2: { color: colors.text, fontSize: 16, fontWeight: "700" },
  metrics: { flexDirection: "row", gap: 8 },
  metric: { flex: 1, backgroundColor: colors.low, borderRadius: 14, padding: 10, alignItems: "center" },
  metricValue: { color: colors.text, fontSize: 18, fontWeight: "800" },
  activity: { flexDirection: "row", backgroundColor: colors.low, borderRadius: 14, padding: 12, gap: 8 },
  itemTitle: { color: colors.text, fontWeight: "700" },
});
