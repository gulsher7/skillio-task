import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';

import { ToastHost } from '@/components/common/Toast';
import DemoPanel from '@/components/demo/DemoPanel';
import { store } from '@/redux/store';
import { colors } from '@/styles/colors';
import { fontAssets } from '@/styles/fontFamily';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(fontAssets);

  useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync();
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <Provider store={store}>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <StatusBar style="dark" />
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
    </Provider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  screen: { backgroundColor: colors.bg },
});
