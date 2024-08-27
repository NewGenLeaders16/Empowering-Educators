import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';
import { Circle, Text, View, XStack } from 'tamagui';
import colors from '~/constants/colors';
import useUserStore from '~/stores/useUser';
import { User } from '~/types';
import { supabase } from '~/utils/supabase';

export default function Coaching() {
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

  return (
    <View flex={1} bg={'$white'} px="$5">
      <Text mt="$5" fontSize={28} fontFamily={'$heading'} fontWeight={'700'}>
        Book a Guided Growth Session
      </Text>
      <Text fontSize={18} fontFamily={'$body'} fontWeight={'500'} mt="$2" mb="$5">
        Booking a 1 : 1 session with a NextGen Coaches ensures personalized attention tailored to
        your specefic journey and goals
      </Text>
      {loading ? (
        <View>
          <ActivityIndicator color={colors.light.primary_blue} size={'small'} />
        </View>
      ) : (
        <FlatList
          data={coaches}
          keyExtractor={({ id }, index) => index.toString()}
          ListEmptyComponent={<Text>No Coaches Available</Text>}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity>
                <XStack w={'100%'} space="$2.5" ai={'center'} py="$3">
                  <Circle bg={'$primary_grey'} size={50}>
                    {item?.image_url && (
                      <Image source={{ uri: item?.image_url }} style={{ width: 50, height: 50 }} />
                    )}
                  </Circle>
                  <View>
                    <Text fontSize={20} fontWeight={'600'}>
                      {item?.name}
                    </Text>
                    <Text fs={16} ml={'$1'}>
                      {item?.email}
                    </Text>
                  </View>
                </XStack>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
