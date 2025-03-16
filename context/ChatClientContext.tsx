import { AxiosError } from 'axios';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { StreamChat } from 'stream-chat';
import useUserStore from '~/stores/useUser';
import { axiosClient, showErrorAlert } from '~/utils';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, AppState } from 'react-native';

export const ChatClientContext = React.createContext({
  client: null,
  clientIsReady: false,
  setClientIsReady: (clientIsReady: boolean) => {},
  isInitializing: false,
});

export const useChatClientContext = () => React.useContext(ChatClientContext);

const requestPermission = async () => {
  try {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
    }
    return enabled;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

const updateFCMToken = async (userId: string, token: string) => {
  try {
    await axiosClient.put('/fcmToken/update', {
      userId,
      token,
    });
  } catch (error) {
    console.log('Error updating FCM token', error);
  }
};

export const ChatClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<any>(null);
  const unsubscribeTokenRefreshListenerRef = useRef<() => void>();
  const { user } = useUserStore();
  const [clientIsReady, setClientIsReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const initAttemptRef = useRef(0);
  const maxInitAttempts = 3;
  const appStateRef = useRef(AppState.currentState);
  const initTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize the Stream Chat client
  useEffect(() => {
    try {
      const chatClient = StreamChat.getInstance('rs78njjjpaye');
      setClient(chatClient);
    } catch (error) {
      console.error('Error initializing Stream Chat client:', error);
    }
  }, []);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextAppState === 'active' &&
        client &&
        !clientIsReady
      ) {
        console.log('App came to foreground, reconnecting chat if needed');
        // If we have a client but it's not ready, try to reconnect
        initializeClient();
      }
      appStateRef.current = nextAppState;
    });

    return () => subscription.remove();
  }, [client, clientIsReady]);

  // Initialize client when user or client changes
  useEffect(() => {
    if (!user || !client) return;

    // Reset initialization state when user or client changes
    setClientIsReady(false);
    initAttemptRef.current = 0;

    // Start initialization
    initializeClient();

    // Cleanup function
    return () => {
      // Clear any pending timeouts
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }

      // Cleanup token refresh listener
      if (unsubscribeTokenRefreshListenerRef.current) {
        unsubscribeTokenRefreshListenerRef.current();
      }

      // Disconnect user if client exists
      if (client) {
        client.disconnectUser().catch((error: any) => {
          console.error('Error disconnecting user:', error);
        });
      }
    };
  }, [user, client]);

  const initializeClient = async () => {
    // Prevent multiple simultaneous initialization attempts
    if (isInitializing || clientIsReady || !user || !client) return;

    // Track initialization state
    setIsInitializing(true);

    // Increment attempt counter
    initAttemptRef.current += 1;
    console.log(`Chat client initialization attempt ${initAttemptRef.current}/${maxInitAttempts}`);

    try {
      // Get Stream token
      const { data } = await axiosClient.get(`getStreamToken?id=${user?.id}`);

      if (!data?.token) {
        throw new Error('Failed to get Stream token');
      }

      // Request notification permissions
      const permissionEnabled = await requestPermission();

      // Set up push notifications if permissions granted
      if (permissionEnabled && Platform.OS !== 'web') {
        try {
          // Unsubscribe any previous listener
          unsubscribeTokenRefreshListenerRef.current?.();

          // For iOS, register for remote notifications first
          if (Platform.OS === 'ios') {
            await messaging().registerDeviceForRemoteMessages();
          }

          // Get FCM token
          const token = await messaging().getToken();
          console.log('FCM Token obtained:', token);

          // Set up device for Stream Chat
          const push_provider = 'firebase';
          const push_provider_name = 'chat_push';

          // IMPORTANT: Set device before connecting user
          client.setLocalDevice({
            id: token,
            push_provider,
            push_provider_name,
          });

          // Store token
          await AsyncStorage.setItem('@current_push_token', token);

          // Update token on server if user is a coach
          if (user?.role === 'coach') {
            await updateFCMToken(user?.id, token);
          }

          // Set up token refresh handler
          const removeOldToken = async () => {
            const oldToken = await AsyncStorage.getItem('@current_push_token');
            if (oldToken !== null) {
              await client.removeDevice(oldToken);
            }
          };

          // Set up token refresh listener
          unsubscribeTokenRefreshListenerRef.current = messaging().onTokenRefresh(
            async (newToken) => {
              try {
                await Promise.all([
                  removeOldToken(),
                  client.addDevice(newToken, push_provider, user?.id, push_provider_name),
                  AsyncStorage.setItem('@current_push_token', newToken),
                ]);

                if (user?.role === 'coach') {
                  await updateFCMToken(user?.id, newToken);
                }
              } catch (error) {
                console.error('Error refreshing token:', error);
              }
            }
          );
        } catch (error) {
          // Log error but continue - push notifications are not critical
          console.error('Error setting up push notifications:', error);
        }
      }

      // Connect user to Stream Chat
      await client.connectUser(
        {
          id: user?.id!,
          name: user?.name!,
        },
        data?.token
      );

      // Mark client as ready
      setClientIsReady(true);
      console.log('Chat client successfully initialized');
    } catch (error) {
      console.error('Error initializing chat client:', error);

      // Handle specific errors
      if (error instanceof AxiosError) {
        showErrorAlert(error?.response?.data?.message || 'Failed to connect to chat service');
      } else if (error instanceof Error) {
        console.error(`An error occurred while connecting the user: ${error.message}`);
      }

      // Retry logic for initialization
      if (initAttemptRef.current < maxInitAttempts) {
        console.log(`Retrying chat initialization in ${initAttemptRef.current * 2} seconds...`);

        // Set timeout for retry with exponential backoff
        initTimeoutRef.current = setTimeout(() => {
          setIsInitializing(false);
          initializeClient();
        }, initAttemptRef.current * 2000);
      } else {
        console.log('Max initialization attempts reached, giving up');
        // Reset initialization state to allow manual retry
        setIsInitializing(false);
      }
    } finally {
      if (clientIsReady) {
        // If successful, reset initialization state
        setIsInitializing(false);
      }
    }
  };

  return (
    <ChatClientContext.Provider value={{ client, clientIsReady, setClientIsReady, isInitializing }}>
      {children}
    </ChatClientContext.Provider>
  );
};
