import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Channel, MessageInput, MessageList } from 'stream-chat-expo';
import { Text, View } from 'tamagui';
import { useAppContext } from '~/context/ChatContext';

export default function ChannelScreen() {
  const { channel, setThread } = useAppContext();

  const params = useLocalSearchParams();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: params?.title });
  }, [navigation]);

  return (
    <Channel channel={channel!}>
      <MessageList
        onThreadSelect={(message) => {
          // @ts-ignore
          if (channel?.id) {
            setThread(message);
            router.push({
              pathname: '/(auth)/(tabs)/chat/threadScreen',
              params: {
                title: params?.title,
              },
            });
          }
        }}
      />
      <MessageInput />
    </Channel>
  );
}
