import { useFonts } from 'expo-font';
import { router, Slot, SplashScreen, Stack, usePathname, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { TamaguiProvider } from 'tamagui';

import config from '../tamagui.config';
import { FontAwesome } from '@expo/vector-icons';
import { supabase } from '~/utils/supabase';
import { showErrorAlert } from '~/utils';
import useUserStore from '~/stores/useUser';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppProvider, useAppContext } from '~/context/ChatContext';
import * as Linking from 'expo-linking';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { ChatClientProvider } from '~/context/ChatClientContext';
import { Alert } from 'react-native';

SplashScreen.preventAutoHideAsync();

// export const unstable_settings = {
//   // Ensure that reloading on `/modal` keeps a back button present.
//   initialRouteName: '(tabs)',
// };

const InitialLayout = () => {
  const { setUser } = useUserStore();

  const { setSession } = useAppContext();

  useEffect(() => {
    Linking.addEventListener('url', ({ url }) => {
      router.push({
        pathname: `/(public)/reset-password/`,
        params: {
          url,
        },
      });
    });
  }, []);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN') {
        setSession(session);
      }

      if (!session?.user) {
        router.replace('/(public)/signin');
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', session?.user?.id)
        .single();

      if (error) {
        showErrorAlert(error);
        router.replace('/(public)/signin');
        supabase.auth.signOut();
        return;
      }

      setUser(data);

      router.push('/(auth)/(tabs)/home');
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return <Slot />;
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

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <TamaguiProvider config={config}>
      <ChatClientProvider>
        <AppProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <InitialLayout />
          </GestureHandlerRootView>
        </AppProvider>
      </ChatClientProvider>
    </TamaguiProvider>
  );
}
