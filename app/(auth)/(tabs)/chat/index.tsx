import { useRouter } from 'expo-router';
import { ChannelList } from 'stream-chat-expo';
import { Text, View } from 'tamagui';
import { useAppContext } from '~/context/ChatContext';
import useUserStore from '~/stores/useUser';

export default function Chat() {
  const { setChannel } = useAppContext();

  const { user } = useUserStore();

  const filters = {
    members: {
      $in: [user?.id!],
    },
  };

  const router = useRouter();

  return (
    <ChannelList
      onSelect={(channel) => {
        const members = Object.values(channel.state.members).filter(
          (member) => member.user?.id !== user?.id
        );

        setChannel(channel);
        router.push({
          pathname: '/(auth)/(tabs)/chat/channelScreen',
          params: {
            title: members?.[0]?.user?.name,
          },
        });
      }}
      filters={filters}
      sort={{
        last_message_at: -1,
      }}
    />
  );
}
