import { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';
import { Circle, Text, View, XStack } from 'tamagui';
import colors from '~/constants/colors';
import { User } from '~/types';
import { supabase } from '~/utils/supabase';
import { StreamChat, Channel } from 'stream-chat';
import useUserStore from '~/stores/useUser';
import { router } from 'expo-router';
import { useAppContext } from '~/context/ChatContext';
import { useChatClientContext } from '~/context/ChatClientContext';

interface SheetFlatlistRenderComponentProps {
  item: User;
  onSendMessage: (id: string) => void;
}

const SheetFlatlistRenderComponent: React.FC<SheetFlatlistRenderComponentProps> = ({
  item,
  onSendMessage,
}) => {
  const { user } = useUserStore();

  const [channelLocal, setChannelLocal] = useState<Channel | null>(null);

  const { setChannel } = useAppContext();

  const { client, clientIsReady } = useChatClientContext();

  useEffect(() => {
    if (!client || !clientIsReady) return;

    (async () => {
      const filter = {
        type: 'messaging',
        id: { $eq: `channel_${user?.id?.slice(0, 15)}--${item?.id?.slice(0, 15)}` },
      };

      // @ts-ignore
      const channels = await client?.queryChannels(filter, {
        last_message_at: -1,
      });

      if (channels.length > 0) {
        setChannelLocal(channels[0]);
      }
    })();
  }, [client, clientIsReady]);

  return (
    <TouchableOpacity
      onPress={() => {
        if (channelLocal) {
          setChannel(channelLocal);
          router.push({
            pathname: '/(auth)/(tabs)/chat/channelScreen',
            params: {
              title: item?.name,
            },
          });
        } else {
          onSendMessage(item?.id);
        }
      }}>
      <XStack w={'100%'} space="$2.5" ai={'center'} py="$3">
        <Circle bg={'$primary_grey'} size={40}>
          {item?.image_url && (
            <Image
              source={{ uri: item?.image_url }}
              style={{ width: 40, height: 40, borderRadius: 100 }}
            />
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
};

const SheetChatComponent: React.FC = () => {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const { user } = useUserStore();

  const { client, clientIsReady } = useChatClientContext();

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
    if (!client) return;

    // @ts-ignore
    const newChannel = client.channel(
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
            return <SheetFlatlistRenderComponent item={item} onSendMessage={onSendMessage} />;
          }}
        />
      )}
    </>
  );
};

export default SheetChatComponent;
