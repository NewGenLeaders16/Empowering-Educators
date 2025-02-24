import { AxiosError } from 'axios';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { StreamChat } from 'stream-chat';
import useUserStore from '~/stores/useUser';
import { axiosClient, showErrorAlert } from '~/utils';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';

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

    const registerPushToken = async () => {
      // unsubscribe any previous listener
      unsubscribeTokenRefreshListenerRef.current?.();
      const token = await messaging().getToken();
      const push_provider = 'firebase';
      const push_provider_name = 'chat_push'; // name an alias for your push provider (optional)
      client.setLocalDevice({
        id: token,
        push_provider,
        // push_provider_name is meant for optional multiple providers support, see: /chat/docs/react/push_providers_and_multi_bundle
        push_provider_name,
      });
      await AsyncStorage.setItem('@current_push_token', token);
      if (user?.role === 'coach') {
        await updateFCMToken(user?.id, token);
      }
      const removeOldToken = async () => {
        const oldToken = await AsyncStorage.getItem('@current_push_token');
        if (oldToken !== null) {
          await client.removeDevice(oldToken);
        }
      };
      unsubscribeTokenRefreshListenerRef.current = messaging().onTokenRefresh(async (newToken) => {
        await Promise.all([
          removeOldToken(),
          client.addDevice(newToken, push_provider, user?.id, push_provider_name),
          AsyncStorage.setItem('@current_push_token', newToken),
        ]);
        if (user?.role === 'coach') {
          await updateFCMToken(user?.id, newToken);
        }
      });
    };

    const setupClient = async () => {
      try {
        const { data } = await axiosClient.get(`getStreamToken?id=${user?.id}`);

        if (data?.token) {
          await requestPermission();
          await messaging().registerDeviceForRemoteMessages();
          await registerPushToken();

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

      // Disconnect user if client exists
      if (client) {
        // Using .then() instead of await since cleanup must be synchronous
        client.disconnectUser().catch((error: any) => {
          console.error('Error disconnecting user:', error);
        });
      }
    };
  }, [user, client]);

  return (
    <ChatClientContext.Provider value={{ client, clientIsReady, setClientIsReady }}>
      {children}
    </ChatClientContext.Provider>
  );
};
