import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Image } from 'tamagui';
import { Circle, ScrollView, Text, View, XStack } from 'tamagui';
import useUserStore from '~/stores/useUser';
import { Coachings } from '~/types';
import { supabase } from '~/utils/supabase';

const BookedSessions = () => {
  const { id } = useLocalSearchParams();

  const [bookings, setBookings] = useState<any>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useUserStore();

  useEffect(() => {
    if (!id) return;

    (async () => {
      const { data: bookings, error } = await supabase
        .from('coachings')
        .select('id, scheduled_date, scheduled_time, users!coachings_coach_id_fkey(name,image_url)')
        .eq('coach_id', id)
        .eq('teacher_id', user?.id!)
        .order('scheduled_date', { ascending: true });

      if (!bookings) return;

      setBookings(bookings);
      setLoading(false);
    })();
  }, [id]);

  return (
    <>
      {loading ? (
        <View flex={1} bg={'white'} px="$5" ai={'center'} jc={'center'}></View>
      ) : (
        <ScrollView flex={1} px="$5">
          {bookings?.map((item: any) => {
            return (
              <View
                key={item.id}
                bg="white"
                flex={1}
                borderRadius={6}
                px={18}
                pt={10}
                pb={20}
                mt={16}>
                <XStack w="100%" ai={'center'} jc={'space-between'}>
                  <Text fontFamily={'$body'} fs={12} fontWeight={600}>
                    {item.scheduled_time?.slice(0, 5)} - {item.scheduled_date}
                  </Text>
                  <Circle size={40} bg={'$primary_blue'}>
                    {item?.users?.image_url ? (
                      <Image
                        source={{ uri: item?.users?.image_url }}
                        style={{ width: 40, height: 40, borderRadius: 100 }}
                      />
                    ) : (
                      <Text fontSize={16} ff={'$body'} color={'white'}>
                        {item?.users.name?.slice(0, 1).toUpperCase()}
                      </Text>
                    )}
                  </Circle>
                </XStack>

                <Text fontFamily={'$body'} fs={20} fontWeight={700}>
                  {item?.users.name}
                </Text>
              </View>
            );
          })}
        </ScrollView>
      )}
    </>
  );
};

export default BookedSessions;
