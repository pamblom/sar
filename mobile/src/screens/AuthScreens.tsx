import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Field, MintButton } from "../ui";
import { useStore } from "../store";
import { colors } from "../theme";
import type { AuthStack } from "../types";

export function LoginScreen({ navigation }: NativeStackScreenProps<AuthStack, "Login">) {
  const { login } = useStore();
  const [correo, setCorreo] = useState("jean.saldana@sar.local");
  const [password, setPassword] = useState("sar2026");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={styles.logo}>
        <Text style={styles.logoMark}>SAR</Text>
      </View>
      <View style={styles.pill}>
        <View style={styles.dot} />
        <Text style={styles.pillText}>SAR ENTERPRISE</Text>
      </View>
      <Text style={styles.title}>
        SAR <Text style={{ color: colors.mint }}>Mobile</Text>
      </Text>
      <Text style={styles.kicker}>SISTEMA DE ACOPIO DE RESIDUOS</Text>
      <View style={styles.card}>
        <Text style={styles.h2}>Bienvenido de nuevo</Text>
        <Text style={styles.copy}>Ingresa tus credenciales para acceder a la red pericial de acopio circular.</Text>
        <Field label="Usuario o correo electrónico" value={correo} onChangeText={setCorreo} autoCapitalize="none" keyboardType="email-address" />
        <Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry={!show} />
        <Pressable onPress={() => setShow((value) => !value)}>
          <Text style={styles.link}>{show ? "Ocultar contraseña" : "Mostrar contraseña"}</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <MintButton
          label="Iniciar sesión"
          onPress={() => {
            const message = login(correo, password);
            setError(message ?? "");
          }}
        />
        <Pressable onPress={() => navigation.navigate("Registro")}>
          <Text style={styles.center}>
            ¿No tienes cuenta?{"\n"}
            <Text style={styles.link}>Crear cuenta SAR</Text>
          </Text>
        </Pressable>
      </View>
      <Text style={styles.foot}>Cifrado TLS 1.3 · Nodo pericial SAR Mobile</Text>
    </ScrollView>
  );
}

export function RegisterScreen({ navigation }: NativeStackScreenProps<AuthStack, "Registro">) {
  const { register } = useStore();
  const [nombres, setNombres] = useState("");
  const [apellidos, setApellidos] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const score = [password.length >= 8, /[A-Z]/.test(password), /\d/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <Text style={styles.h2}>Crear cuenta</Text>
      <Text style={styles.copy}>Únete a la red de acopio. Paso 1 de 1.</Text>
      <View style={styles.card}>
        <Field label="Nombres" value={nombres} onChangeText={setNombres} />
        <Field label="Apellidos" value={apellidos} onChangeText={setApellidos} />
        <Field label="Correo" value={correo} onChangeText={setCorreo} autoCapitalize="none" keyboardType="email-address" />
        <Field label="Teléfono" value={telefono} onChangeText={setTelefono} keyboardType="phone-pad" />
        <Field label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />
        <View style={styles.bars}>
          {[0, 1, 2, 3].map((index) => (
            <View key={index} style={[styles.bar, index < score && { backgroundColor: colors.mint }]} />
          ))}
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <MintButton
          label="Crear cuenta SAR"
          onPress={() => {
            if (!nombres || !apellidos || !correo || !telefono) {
              setError("Completa todos los campos.");
              return;
            }
            const message = register({ nombres, apellidos, correo, telefono, password, zona: "Centro" });
            setError(message ?? "");
          }}
        />
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={styles.link}>Volver al inicio de sesión</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 22, paddingTop: 48, gap: 12, backgroundColor: colors.bg, flexGrow: 1 },
  logo: {
    alignSelf: "center",
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.high,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.pine,
  },
  logoMark: { color: colors.mint, fontWeight: "800", letterSpacing: 1 },
  pill: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(38,80,71,0.7)",
    borderRadius: 99,
    paddingHorizontal: 12,
    paddingVertical: 5,
  },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.mint },
  pillText: { color: colors.primary, fontSize: 11, letterSpacing: 1.4, fontWeight: "700" },
  title: { color: colors.text, fontSize: 32, fontWeight: "800", textAlign: "center" },
  kicker: { color: colors.sage, letterSpacing: 1.6, fontSize: 11, textAlign: "center", marginBottom: 8 },
  card: { backgroundColor: "rgba(20,34,31,0.92)", borderRadius: 18, padding: 16, gap: 12 },
  h2: { color: colors.text, fontSize: 22, fontWeight: "700" },
  copy: { color: colors.muted, fontSize: 13, lineHeight: 18 },
  link: { color: colors.mint, fontWeight: "700", textAlign: "center" },
  center: { color: colors.muted, textAlign: "center", lineHeight: 20 },
  error: { color: colors.error },
  foot: { color: colors.sage, textAlign: "center", fontSize: 11, marginTop: 8 },
  bars: { flexDirection: "row", gap: 6 },
  bar: { flex: 1, height: 4, borderRadius: 99, backgroundColor: colors.highest },
});
