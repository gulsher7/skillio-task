import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { ToastHost } from '@/components/common/Toast';
import DemoPanel from '@/components/demo/DemoPanel';
import { restoreLanguage } from '@/lang';
import { store } from '@/redux/store';
import { fontAssets } from '@/styles/fontFamily';
import { makeStyles, ThemeProvider, useTheme } from '@/styles/theme';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    restoreLanguage().finally(() => setLanguageReady(true));
  }, []);

  const ready = (fontsLoaded || fontError) && languageReady;

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <Provider store={store}>
      <ThemeProvider>
        <AppShell />
      </ThemeProvider>
    </Provider>
  );
}

/** Separate component so it sits inside the provider and can read the theme. */
function AppShell() {
  const styles = useStyles();
  const { scheme } = useTheme();

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StatusBar style={scheme === 'dark' ? 'light' : 'dark'} />
        <Stack screenOptions={{ headerShown: false, contentStyle: styles.screen }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="(onboarding)" options={{ animation: 'slide_from_right' }} />
          <Stack.Screen name="home" options={{ animation: 'fade' }} />
          <Stack.Screen
            name="practice"
            options={{ animation: 'slide_from_bottom', gestureEnabled: false }}
          />
          <Stack.Screen name="celebrate" options={{ animation: 'fade', gestureEnabled: false }} />
        </Stack>
        <ToastHost />
        <DemoPanel />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const useStyles = makeStyles((c) => ({
  root: { flex: 1 },
  screen: { backgroundColor: c.bg },
}));
