import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from "react-native";
import { colors } from "./theme";

export function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.block}>
      <Text style={styles.label}>{label}</Text>
      <TextInput placeholderTextColor="rgba(191,201,196,0.45)" style={styles.input} {...props} />
    </View>
  );
}

export function MintButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.mint, pressed && { opacity: 0.86 }]}>
      <Text style={styles.mintText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  block: { gap: 6 },
  label: { color: colors.primary, fontSize: 13, fontWeight: "500" },
  input: {
    minHeight: 48,
    borderRadius: 12,
    backgroundColor: "rgba(4,17,14,0.85)",
    color: colors.text,
    paddingHorizontal: 14,
  },
  mint: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.mint,
  },
  mintText: { color: colors.onMint, fontWeight: "700", fontSize: 16 },
});
