import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { Channel, Thread } from 'stream-chat-expo';
import { Text, View } from 'tamagui';
import { useAppContext } from '~/context/ChatContext';

export default function ThreadScreen() {
  const { channel, thread } = useAppContext();

  const params = useLocalSearchParams();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({ title: params?.title });
  }, [navigation]);

  return (
    <Channel channel={channel!} thread={thread} threadList>
      <Thread />
    </Channel>
  );
}
