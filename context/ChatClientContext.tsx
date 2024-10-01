import { AxiosError } from 'axios';
import React, { ReactNode, useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import useUserStore from '~/stores/useUser';
import { axiosClient, showErrorAlert } from '~/utils';

export const ChatClientContext = React.createContext({
  client: null,
  clientIsReady: false,
  setClientIsReady: (clientIsReady: boolean) => {},
});

export const useChatClientContext = () => React.useContext(ChatClientContext);

export const ChatClientProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<any>(null);
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
          const connection = await client.connectUser(
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
  }, [user, client]);

  return (
    <ChatClientContext.Provider value={{ client, clientIsReady, setClientIsReady }}>
      {children}
    </ChatClientContext.Provider>
  );
};
