import { AxiosError } from 'axios';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { StreamChat } from 'stream-chat';
import useUserStore from '~/stores/useUser';
import { axiosClient, showErrorAlert } from '~/utils';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export const ChatClientContext = React.createContext({
  client: null,
  clientIsReady: false,
  setClientIsReady: (clientIsReady: boolean) => {},
});

export const useChatClientContext = () => React.useContext(ChatClientContext);

const requestPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
  }
  return enabled;
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

  useEffect(() => {
    const chatClient = StreamChat.getInstance('rs78njjjpaye');
    setClient(chatClient);
  }, []);

  const [clientIsReady, setClientIsReady] = useState(false);

  useEffect(() => {
    if (!user || !client) return;

    const setupClient = async () => {
      try {
        const { data } = await axiosClient.get(`getStreamToken?id=${user?.id}`);

        if (data?.token) {
          const permissionEnabled = await requestPermission();

          if (permissionEnabled) {
            try {
              // unsubscribe any previous listener
              unsubscribeTokenRefreshListenerRef.current?.();

              // For iOS, we need to register for remote notifications first
              if (Platform.OS === 'ios') {
                // Register with APNS
                await messaging().registerDeviceForRemoteMessages();
              }

              // Now get the FCM token
              const token = await messaging().getToken();
              console.log('FCM Token obtained:', token);

              const push_provider = 'firebase';
              const push_provider_name = 'chat_push'; // name an alias for your push provider (optional)

              // IMPORTANT: Set the device BEFORE connecting the user
              client.setLocalDevice({
                id: token,
                push_provider,
                push_provider_name,
              });

              await AsyncStorage.setItem('@current_push_token', token);
              if (user?.role === 'coach') {
                await updateFCMToken(user?.id, token);
              }

              // Setup token refresh listener
              const removeOldToken = async () => {
                const oldToken = await AsyncStorage.getItem('@current_push_token');
                if (oldToken !== null) {
                  await client.removeDevice(oldToken);
                }
              };

              unsubscribeTokenRefreshListenerRef.current = messaging().onTokenRefresh(
                async (newToken) => {
                  await Promise.all([
                    removeOldToken(),
                    client.addDevice(newToken, push_provider, user?.id, push_provider_name),
                    AsyncStorage.setItem('@current_push_token', newToken),
                  ]);
                  if (user?.role === 'coach') {
                    await updateFCMToken(user?.id, newToken);
                  }
                }
              );
            } catch (error) {
              console.error('Error registering for push notifications:', error);
            }
          }

          // Now connect the user after device registration
          await client.connectUser(
            {
              id: user?.id!,
              name: user?.name!,
            },
            data?.token
          );

          setClientIsReady(true);
        }
      } catch (error) {
        if (error instanceof AxiosError) {
          showErrorAlert(error?.response?.data?.message);
        }

        if (error instanceof Error) {
          console.error(`An error occurred while connecting the user: ${error.message}`);
        }
      }
    };

    // If the chat client has a value in the field `userID`, the user gets connected
    if (!client.userID) {
      setupClient();
    }

    // Modified cleanup function
    return () => {
      // Cleanup token refresh listener first
      if (unsubscribeTokenRefreshListenerRef.current) {
        unsubscribeTokenRefreshListenerRef.current();
      }

      // IMPORTANT: We're NOT disconnecting the user when navigating between screens
      // Only disconnect when the component is truly unmounting (app closing or user logging out)
      // This is handled elsewhere in the app
    };
  }, [user, client]);

  return (
    <ChatClientContext.Provider value={{ client, clientIsReady, setClientIsReady }}>
      {children}
    </ChatClientContext.Provider>
  );
};
