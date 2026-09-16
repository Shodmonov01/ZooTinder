import {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/nunito';
import { DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';
import { AppShell } from '@/components/Screen';
import { colors } from '@/constants/theme';
import { AuthProvider, useAuth } from '@/lib/auth';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  return (
    <AuthProvider>
      <AppShell>
        <RootNav fontsLoaded={fontsLoaded} />
      </AppShell>
    </AuthProvider>
  );
}

function RootNav({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { loading } = useAuth();
  const ready = fontsLoaded && !loading;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bgTop }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <ThemeProvider
      value={{
        ...DefaultTheme,
        colors: { ...DefaultTheme.colors, background: colors.bgTop, primary: colors.primary },
      }}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: 'transparent', flex: 1 },
          headerTitleStyle: { fontFamily: 'Nunito_800ExtraBold' },
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.bgTop },
        }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="login" />
        <Stack.Screen name="otp" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="pet/[id]" options={{ headerShown: false }} />
        <Stack.Screen name="pet/new" options={{ headerShown: true, title: 'Новый питомец' }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: true, title: 'Чат' }} />
        <Stack.Screen name="filters" options={{ headerShown: true, title: 'Фильтры' }} />
        <Stack.Screen name="notifications" options={{ headerShown: true, title: 'Уведомления' }} />
        <Stack.Screen name="documents/[petId]" options={{ headerShown: true, title: 'Документы' }} />
        <Stack.Screen name="admin/index" options={{ headerShown: true, title: 'Админка' }} />
      </Stack>
    </ThemeProvider>
  );
}
