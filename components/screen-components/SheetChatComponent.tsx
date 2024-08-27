import { useEffect, useState } from 'react';
import { FlatList, Image } from 'react-native';
import { Circle, Text, View, XStack } from 'tamagui';
import { User } from '~/types';
import { supabase } from '~/utils/supabase';

const SheetChatComponent: React.FC = () => {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

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

  return (
    <View w={'100%'}>
      <Text fontSize={26} fontFamily={'$body'} fontWeight={'700'}>
        New Chat
      </Text>
      <Text fontSize={18} fontFamily={'$body'} fontWeight={'400'} mt="$1" mb="$3">
        Choose Someone to Start a new conversation
      </Text>
      <FlatList
        data={[...coaches, ...coaches, ...coaches, ...coaches, ...coaches, ...coaches, ...coaches]}
        keyExtractor={({ id }, index) => index.toString()}
        ListEmptyComponent={<Text>No Coaches Available</Text>}
        renderItem={({ item }) => {
          return (
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
          );
        }}
      />
    </View>
  );
};

export default SheetChatComponent;
