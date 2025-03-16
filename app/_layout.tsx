import { useFonts } from 'expo-font';
import { router, Slot, SplashScreen, Stack, usePathname, useSegments } from 'expo-router';
import React, { useEffect, useState, useRef } from 'react';
import { TamaguiProvider } from 'tamagui';
import messaging from '@react-native-firebase/messaging';

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
import { Alert, AppState, Platform } from 'react-native';

// Prevent auto-hiding the splash screen
SplashScreen.preventAutoHideAsync();

// Setup notification handling
const setupNotifications = () => {
  // Handle notifications that caused the app to open
  messaging()
    .getInitialNotification()
    .then((remoteMessage) => {
      if (remoteMessage?.data?.channel_id) {
        console.log('App opened by notification (from quit state):', remoteMessage);
        // We'll handle navigation after auth is complete
      }
    })
    .catch((error) => {
      console.log('Failed to get initial notification:', error);
    });

  // Handle notifications opened while app is in background
  messaging().onNotificationOpenedApp((remoteMessage) => {
    console.log('App opened by notification (from background):', remoteMessage);
    if (remoteMessage?.data?.channel_id) {
      router.push({
        pathname: '/(auth)/(tabs)/chat/',
      });
    }
  });

  // Handle foreground notifications
  const unsubscribe = messaging().onMessage(async (remoteMessage) => {
    console.log('Notification received in foreground:', remoteMessage);
    // You could show a local notification here if needed
  });

  return unsubscribe;
};

const InitialLayout = () => {
  const { setUser } = useUserStore();
  const { setSession } = useAppContext();
  const [isInitialized, setIsInitialized] = useState(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const appStateRef = useRef(AppState.currentState);

  // Handle deep links
  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      router.push({
        pathname: `/(public)/reset-password/`,
        params: { url },
      });
    });

    return () => subscription.remove();
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground');
        // Refresh auth state when app comes to foreground
        supabase.auth.refreshSession();
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, []);

  // Setup initialization timeout
  useEffect(() => {
    // Set a timeout to force proceed if initialization takes too long
    initTimeoutRef.current = setTimeout(() => {
      console.log('Initialization timeout reached, proceeding anyway');
      setIsInitialized(true);
      SplashScreen.hideAsync().catch((e) => console.log('Error hiding splash screen:', e));
    }, 8000); // 8 seconds timeout

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []);

  // Handle auth state changes
  useEffect(() => {
    let isMounted = true;
    let notificationUnsubscribe: (() => void) | null = null;

    const setupAuth = async () => {
      try {
        // Setup notifications first
        if (Platform.OS !== 'web') {
          notificationUnsubscribe = setupNotifications();
        }

        // Subscribe to auth changes
        const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
          console.log('Auth state changed:', event);

          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
            setSession(session);
          }

          if (!session?.user) {
            if (isMounted) {
              setIsInitialized(true);
              router.replace('/(public)/signin');
            }
            return;
          }

          try {
            const { data, error } = await supabase
              .from('users')
              .select('*')
              .eq('id', session?.user?.id)
              .single();

            if (error) {
              console.error('Error fetching user data:', error);
              showErrorAlert(error);
              if (isMounted) {
                router.replace('/(public)/signin');
                supabase.auth.signOut();
              }
              return;
            }

            if (isMounted) {
              setUser(data);
              setIsInitialized(true);
              router.push('/(auth)/(tabs)/home');
            }
          } catch (error) {
            console.error('Error in auth flow:', error);
            if (isMounted) {
              setIsInitialized(true);
              router.replace('/(public)/signin');
            }
          }
        });

        return () => {
          isMounted = false;
          data.subscription.unsubscribe();
          if (notificationUnsubscribe) {
            notificationUnsubscribe();
          }
        };
      } catch (error) {
        console.error('Fatal error during app initialization:', error);
        if (isMounted) {
          setIsInitialized(true);
          router.replace('/(public)/signin');
        }
        return () => {
          isMounted = false;
        };
      }
    };

    const cleanup = setupAuth();
    return () => {
      cleanup.then((cleanupFn) => cleanupFn && cleanupFn());
    };
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

  // Hide splash screen once fonts are loaded
  useEffect(() => {
    if (loaded) {
      // Small delay to ensure other initialization has a chance to complete
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch((e) => console.log('Error hiding splash screen:', e));
      }, 300);

      return () => clearTimeout(timer);
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
