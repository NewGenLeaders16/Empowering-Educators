import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';
import { Circle, Text, View, XStack } from 'tamagui';
import colors from '~/constants/colors';
import { User } from '~/types';
import { supabase } from '~/utils/supabase';
import { StreamChat } from 'stream-chat';
import useUserStore from '~/stores/useUser';
import { router } from 'expo-router';

const chatClient = StreamChat.getInstance(process.env.EXPO_PUBLIC_STREAM_API_KEY!);

const SheetChatComponent: React.FC = () => {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useUserStore();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('users').select('*').eq('role', 'coach');
        if (error) {
          throw error;
        }

        setCoaches(data);
      } catch (error) {
        console.log(error, 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onSendMessage = async (id: string) => {
    if (!chatClient) return;

    const newChannel = chatClient.channel(
      'messaging',
      `channel_${user?.id?.slice(0, 15)}--${id?.slice(0, 15)}`,
      {
        members: [user?.id as string, id],
      }
    );

    await newChannel.create();

    newChannel.watch();

    router.push('/(auth)/(tabs)/chat/');
  };

  return (
    <>
      <Text fontSize={26} fontFamily={'$body'} fontWeight={'700'}>
        New Chat
      </Text>
      <Text fontSize={18} fontFamily={'$body'} fontWeight={'400'} mt="$1" mb="$3">
        Choose Someone to Start a new conversation
      </Text>
      {loading ? (
        <View>
          <ActivityIndicator color={colors.light.primary_blue} size={'small'} />
        </View>
      ) : (
        <BottomSheetFlatList
          data={coaches}
          keyExtractor={({ id }, index) => index.toString()}
          ListEmptyComponent={<Text>No Coaches Available</Text>}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity onPress={() => onSendMessage(item?.id)}>
                <XStack w={'100%'} space="$2.5" ai={'center'} py="$3">
                  <Circle bg={'$primary_grey'} size={40}>
                    {item?.image_url && (
                      <Image source={{ uri: item?.image_url }} style={{ width: 40, height: 40 }} />
                    )}
                  </Circle>
                  <View>
                    <Text fontSize={16} fontWeight={'600'}>
                      {item?.name}
                    </Text>
                    <Text fs={14} ml={'$1'}>
                      {item?.email}
                    </Text>
                  </View>
                </XStack>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </>
  );
};

export default SheetChatComponent;
