import { NavigationContainer, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import { Text } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LoginScreen, RegisterScreen } from "./src/screens/AuthScreens";
import { HistoryScreen } from "./src/screens/HistoryScreen";
import { HomeScreen } from "./src/screens/HomeScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { RankingScreen } from "./src/screens/RankingScreen";
import { ConfirmScreen, WeighScreen } from "./src/screens/WeighScreens";
import { StoreProvider, useStore } from "./src/store";
import { colors } from "./src/theme";
import type { AppStack, AuthStack, TabStack } from "./src/types";

const Auth = createNativeStackNavigator<AuthStack>();
const Tabs = createBottomTabNavigator<TabStack>();
const Root = createNativeStackNavigator<AppStack>();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.low, text: colors.text, border: colors.pine, primary: colors.mint },
};

function TabBarIcon({ label, focused }: { label: string; focused: boolean }) {
  return <Text style={{ color: focused ? colors.mint : colors.muted, fontSize: 11, fontWeight: "700" }}>{label}</Text>;
}

function MainTabs() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.low },
        headerTintColor: colors.text,
        headerTitle: "SAR Mobile",
        tabBarStyle: { backgroundColor: colors.low, borderTopColor: "transparent", height: 64, paddingBottom: 8 },
        tabBarActiveTintColor: colors.mint,
        tabBarInactiveTintColor: colors.muted,
      }}
    >
      <Tabs.Screen name="Inicio" component={HomeScreen} options={{ tabBarIcon: ({ focused }) => <TabBarIcon label="Inicio" focused={focused} /> }} />
      <Tabs.Screen name="Historial" component={HistoryScreen} options={{ tabBarIcon: ({ focused }) => <TabBarIcon label="Historial" focused={focused} /> }} />
      <Tabs.Screen name="Ranking" component={RankingScreen} options={{ tabBarIcon: ({ focused }) => <TabBarIcon label="Ranking" focused={focused} /> }} />
      <Tabs.Screen name="Perfil" component={ProfileScreen} options={{ tabBarIcon: ({ focused }) => <TabBarIcon label="Perfil" focused={focused} /> }} />
    </Tabs.Navigator>
  );
}

function Gate() {
  const { session } = useStore();
  if (!session) {
    return (
      <Auth.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Auth.Screen name="Login" component={LoginScreen} />
        <Auth.Screen name="Registro" component={RegisterScreen} />
      </Auth.Navigator>
    );
  }
  return (
    <Root.Navigator screenOptions={{ headerStyle: { backgroundColor: colors.low }, headerTintColor: colors.text, contentStyle: { backgroundColor: colors.bg } }}>
      <Root.Screen name="Tabs" component={MainTabs} options={{ headerShown: false }} />
      <Root.Screen name="Pesaje" component={WeighScreen} options={{ title: "Nuevo registro de acopio" }} />
      <Root.Screen name="Confirmar" component={ConfirmScreen} options={{ title: "Validación" }} />
    </Root.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StoreProvider>
        <NavigationContainer theme={navTheme}>
          <StatusBar style="light" />
          <Gate />
        </NavigationContainer>
      </StoreProvider>
    </SafeAreaProvider>
  );
}
