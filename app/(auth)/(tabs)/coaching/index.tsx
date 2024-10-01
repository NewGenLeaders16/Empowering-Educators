import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, TouchableOpacity } from 'react-native';
import { Agenda } from 'react-native-calendars';
import { Circle, Text, View, XStack } from 'tamagui';
import colors from '~/constants/colors';
import useUserStore from '~/stores/useUser';
import { User } from '~/types';
import { supabase } from '~/utils/supabase';

export default function Coaching() {
  const [coaches, setCoaches] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [initialSelectedDate, setInitialSelectedDate] = useState('');

  const [items, setItems] = useState<any>({});

  console.log(items, 'Items');

  const fetchBookings = async () => {
    const { data: bookings, error } = await supabase
      .from('coachings')
      .select('scheduled_date, scheduled_time, users!coachings_teacher_id_fkey(name,image_url)')
      .eq('coach_id', user?.id!)
      .order('scheduled_date', { ascending: true });

    if (!bookings) return;

    setInitialSelectedDate(bookings?.[0].scheduled_date!);

    const markedDatesArr = bookings.reduce((acc, booking, ind) => {
      // @ts-ignore
      if (!acc[booking.scheduled_date]) {
        // @ts-ignore

        acc[booking.scheduled_date] = {};
      }

      // @ts-ignore

      acc[booking.scheduled_date] = {
        marked: true,
        selectedColor: colors.light.primary_yellow,
        dotColor: colors.light.primary_yellow,
        selected: ind === 0,
      };
      return acc;
    }, {});

    setMarkedDates(markedDatesArr);

    if (error) {
      console.error('Error fetching coachings', error);
      return;
    }

    const mappedItems = bookings.reduce((acc, booking) => {
      const date = booking.scheduled_date;
      // @ts-ignore
      if (!acc[date]) {
        // @ts-ignore

        acc[date] = [];
      }

      // @ts-ignore
      acc[date].push({
        time: `${booking.scheduled_time}`,
        // @ts-ignore

        name: booking.users.name,
        // @ts-ignore

        image: booking.users.image_url,
      });
      return acc;
    }, {});

    setItems(mappedItems);
  };

  const { user } = useUserStore();

  useEffect(() => {
    if (user?.role === 'coach') {
      fetchBookings();
      return;
    }

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
    <>
      {user?.role === 'coach' ? (
        <View flex={1} bg={'$white'} px="$5">
          <Agenda
            theme={{
              // ...calendarTheme,
              agendaDayTextColor: colors.light.primary_blue,
              agendaDayNumColor: colors.light.primary_blue,
              agendaTodayColor: colors.light.primary_blue,
              agendaKnobColor: colors.light.primary_blue,
            }}
            selected={initialSelectedDate || new Date().toISOString().slice(0, 10)}
            markedDates={markedDates}
            showClosingKnob={true}
            items={items}
            renderItem={(item: any) => (
              <View bg="white" flex={1} borderRadius={6} px={10} pt={10} pb={20} mr={18} mt={16}>
                <XStack w="100%" ai={'center'} jc={'space-between'}>
                  <Text fontFamily={'$body'} fs={12} fontWeight={600}>
                    {item.time?.slice(0, 5)}
                  </Text>
                  <Circle size={40} bg={'$primary_blue'}>
                    {item.image ? (
                      <Image
                        source={{ uri: item.image }}
                        style={{ width: 40, height: 40, borderRadius: 100 }}
                      />
                    ) : (
                      <Text fontSize={16} ff={'$body'} color={'white'}>
                        {item.name?.slice(0, 1).toUpperCase()}
                      </Text>
                    )}
                  </Circle>
                </XStack>

                <Text fontFamily={'$body'} fs={20} fontWeight={700}>
                  {item.name}
                </Text>
              </View>
            )}
          />
        </View>
      ) : (
        <View flex={1} bg={'$white'} px="$5">
          <Text mt="$5" fontSize={28} fontFamily={'$heading'} fontWeight={'700'}>
            Book a Guided Growth Session
          </Text>
          <Text fontSize={18} fontFamily={'$body'} fontWeight={'500'} mt="$2" mb="$5">
            Booking a 1 : 1 session with a NewGen Coaches ensures personalized attention tailored to
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
                  <TouchableOpacity
                    onPress={() =>
                      router.push({
                        pathname: '/(auth)/(tabs)/coaching/[id]',
                        params: { id: item.id, userName: item.name },
                      })
                    }>
                    <XStack w={'100%'} space="$2.5" ai={'center'} py="$3">
                      <Circle bg={'$primary_grey'} size={50}>
                        {item?.image_url && (
                          <Image
                            source={{ uri: item?.image_url }}
                            style={{ width: 50, height: 50, borderRadius: 100 }}
                          />
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
      )}
    </>
  );
}
