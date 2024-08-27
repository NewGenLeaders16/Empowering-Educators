import { router, Stack } from 'expo-router';
import { Text, View } from 'tamagui';
import { useChatClient } from '~/context/useChatClient';
import {
  Chat,
  ChannelList,
  OverlayProvider,
  Channel,
  MessageList,
  MessageInput,
  Thread,
} from 'stream-chat-expo';
import { StreamChat } from 'stream-chat';
import { ActivityIndicator } from 'react-native';
import colors from '~/constants/colors';
import ScreenHeader from '~/components/ScreenHeader';
import WrapperContainer from '~/components/WrapperContainer';
import { AntDesign } from '@expo/vector-icons';

const chatClient = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY!);

export default function ChatLayout() {
  const { clientIsReady } = useChatClient();

  if (!clientIsReady) {
    return (
      <View bg={'white'} ai={'center'} flex={1} jc={'center'}>
        <ActivityIndicator size={'large'} color={colors.light.primary_blue} />
      </View>
    );
  }

  return (
    <OverlayProvider>
      <Chat client={chatClient}>
        <Stack
          screenOptions={{
            headerBackTitleVisible: false,
            headerLeft: () => (
              <AntDesign
                name="arrowleft"
                size={24}
                color={colors.light.primary_yellow}
                onPress={() => router.back()}
              />
            ),
          }}>
          <Stack.Screen name="index" options={{ title: 'Chat' }} />
          <Stack.Screen name="channelScreen" />
          <Stack.Screen name="threadScreen" />
        </Stack>
      </Chat>
    </OverlayProvider>
  );
}
