// useChatClient.js

import { useEffect, useState } from 'react';
import { StreamChat } from 'stream-chat';
import { axiosClient, showErrorAlert } from '~/utils';
import useUserStore from '~/stores/useUser';
import { AxiosError } from 'axios';

const chatClient = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY!);

export const useChatClient = () => {
  const [clientIsReady, setClientIsReady] = useState(false);

  const { user } = useUserStore();

  useEffect(() => {
    const setupClient = async () => {
      try {
        const { data } = await axiosClient.get(`getStreamToken?id=${user?.id}`);

        if (data?.token) {
          chatClient.connectUser(
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
    if (!chatClient.userID) {
      setupClient();
    }
  }, []);

  return {
    clientIsReady,
  };
};
