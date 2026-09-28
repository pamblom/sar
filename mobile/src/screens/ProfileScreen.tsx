import { StyleSheet, Text, View } from "react-native";
import { MintButton } from "../ui";
import { useStore } from "../store";
import { colors, rankFromPoints } from "../theme";

export function ProfileScreen() {
  const { session, logout } = useStore();
  if (!session) return null;
  const rank = rankFromPoints(session.puntos);
  return (
    <View style={styles.page}>
      <View style={styles.avatar}>
        <Text style={styles.initials}>
          {session.nombres[0]}
          {session.apellidos[0]}
        </Text>
      </View>
      <Text style={styles.name}>
        {session.nombres} {session.apellidos}
      </Text>
      <Text style={styles.mint}>
        {rank.nombre} · {session.puntos.toLocaleString("es-CO")} pts
      </Text>
      <Text style={styles.muted}>{session.correo}</Text>
      <Text style={styles.muted}>{session.telefono} · {session.zona}</Text>
      <Text style={styles.note}>Esta app todavía guarda la sesión en el teléfono. El siguiente paso es enlazarla a la base de la página web.</Text>
      <MintButton label="Cerrar sesión" onPress={logout} />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: colors.bg, padding: 20, gap: 8, alignItems: "center" },
  avatar: { width: 76, height: 76, borderRadius: 38, backgroundColor: colors.mint, alignItems: "center", justifyContent: "center", marginTop: 12 },
  initials: { color: colors.onMint, fontSize: 24, fontWeight: "800" },
  name: { color: colors.text, fontSize: 22, fontWeight: "700" },
  mint: { color: colors.mint, fontWeight: "700" },
  muted: { color: colors.muted },
  note: { color: colors.sage, textAlign: "center", lineHeight: 20, marginVertical: 12 },
});
