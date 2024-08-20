import { useFonts } from 'expo-font';
import { router, Slot, SplashScreen, Stack } from 'expo-router';
import React, { useEffect } from 'react';
import { TamaguiProvider } from 'tamagui';

import config from '../tamagui.config';
import { FontAwesome } from '@expo/vector-icons';

SplashScreen.preventAutoHideAsync();

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Urbanist: require('../assets/fonts/Urbanist-Regular.ttf'),
    'Urbanist-Bold': require('../assets/fonts/Urbanist-Bold.ttf'),
    'Urbanist-SemiBold': require('../assets/fonts/Urbanist-SemiBold.ttf'),
    'Urbanist-Medium': require('../assets/fonts/Urbanist-Medium.ttf'),
    'Urbanist-Light': require('../assets/fonts/Urbanist-Light.ttf'),
    'Urbanist-BoldItalic': require('../assets/fonts/Urbanist-BoldItalic.ttf'),
    ...FontAwesome.font,
  });

  const InitialLayout = () => {
    useEffect(() => {
      router.replace('/');
    });

    return <Slot />;
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <TamaguiProvider config={config}>
      <Stack>
        <InitialLayout />
      </Stack>
    </TamaguiProvider>
  );
}
