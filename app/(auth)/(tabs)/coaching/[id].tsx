import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Circle, ScrollView, Text, View, XStack, Button as TMButton, YStack } from 'tamagui';
import colors from '~/constants/colors';
import useUserStore from '~/stores/useUser';
import { User } from '~/types';
import { supabase } from '~/utils/supabase';
import { Calendar } from 'react-native-calendars';
import { Button } from '~/tamagui.config';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';

export default function CoachDetails() {
  const { user } = useUserStore();

  const [loading, setLoading] = useState(false);
  const [coach, setCoach] = useState<User | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [bookingLoading, setBookingLoading] = useState(false);

  const [bookingsCount, setBookingCounts] = useState(0);

  const { id, userName } = useLocalSearchParams();

  const { setOptions } = useNavigation();

  useEffect(() => {
    setOptions({
      title: userName,
    });
  }, [userName]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

        const { count, error: bookError } = await supabase
          .from('coachings')
          .select('*', { count: 'exact', head: true })
          .eq('coach_id', id)
          .eq('teacher_id', user?.id!);

        setBookingCounts(count ?? 0);

        if (error || bookError) {
          throw error ?? bookError;
        }

        setCoach(data);
      } catch (error) {
        console.log(error, 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onDayPress = (day: any) => {
    setSelectedDate(day.dateString);
  };

  const onChange = (event: any, selectedDate: any) => {
    console.log(selectedDate, 'Selected Date');
    const currentDate = selectedDate;
    setSelectedTime(currentDate);
  };

  const showDatePicker = () => {
    DateTimePickerAndroid.open({
      value: selectedTime,
      onChange,
      mode: 'time',
      is24Hour: true,
    });
  };

  const bookSession = async () => {
    if (!selectedDate || !selectedTime) {
      return Alert.alert('Error', 'Please select a date and time to book a session');
    }

    setBookingLoading(true);

    const hours = selectedTime.getHours().toString().padStart(2, '0');
    const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
    const formattedTime = `${hours}:${minutes}`;

    const { data, error } = await supabase.from('coachings').insert({
      coach_id: coach?.id,
      teacher_id: user?.id,
      scheduled_date: selectedDate,
      scheduled_time: formattedTime,
      formatted_timestamp: selectedTime?.toISOString(),
    });

    if (error) {
      console.log(error, 'Error');
      setBookingLoading(false);
      return Alert.alert('Error', 'Failed to book session');
    }

    setBookingLoading(false);

    router.push({
      pathname: '/(auth)/(tabs)/coaching/successBooking',
      params: { coachName: coach?.name },
    });
  };

  return (
    <>
      {loading ? (
        <View flex={1} bg={'$white'} px="$5" ai={'center'} jc={'center'}>
          <ActivityIndicator color={colors.light.primary_blue} size={'large'} />
        </View>
      ) : (
        <ScrollView flex={1} bg={'$white'} px="$5" contentContainerStyle={{ paddingBottom: 20 }}>
          <Text mt="$5" fontSize={28} fontFamily={'$heading'} fontWeight={'700'}>
            Book a Session with {coach?.name}
          </Text>
          <Text fontSize={18} fontFamily={'$body'} fontWeight={'500'} mt="$2" mb="$5">
            Select a date and time to book a session with {coach?.name}
          </Text>

          <Calendar
            theme={{ arrowColor: colors.light.primary_yellow }}
            onDayPress={onDayPress}
            markedDates={{
              [selectedDate]: { selected: true, selectedColor: colors.light.primary_yellow },
            }}
          />

          {Platform.OS === 'android' && (
            <Button
              mt="$5"
              bg="$primary_blue"
              onPress={showDatePicker}
              opacity={bookingLoading || bookingsCount >= 3 ? 0.5 : 1}>
              <Text color={'white'} fs={16} ff={'$body'} fontWeight={600}>
                Select Time
              </Text>
            </Button>
          )}

          {Platform.OS === 'ios' && (
            <YStack space="$3" ai={'flex-start'} jc="flex-start" dsp={'flex'} mt="$4">
              <Text fontSize={16} fontFamily="$body" color="$gray" ml="$2.5">
                Select Time
              </Text>
              <DateTimePicker
                value={selectedTime}
                mode={'time'}
                is24Hour={true}
                onChange={onChange}
                // disabled={bookingLoading || bookingsCount >= 3}
              />
            </YStack>
          )}

          <Button
            mt="$3"
            onPress={() => {
              bookSession();
            }}
            disabled={bookingLoading || bookingsCount >= 3}
            opacity={bookingLoading || bookingsCount >= 3 ? 0.5 : 1}>
            {bookingLoading ? (
              <ActivityIndicator color={colors.light.primary_blue} size={'small'} />
            ) : (
              <Text fs={16} ff={'$body'} fontWeight={600}>
                {bookingsCount >= 3 ? 'You have reached the maximum limit' : 'Book Session'}
              </Text>
            )}
          </Button>
          {bookingsCount > 0 && (
            <View ai={'center'} jc={'center'} mt="$2">
              <TMButton
                borderRadius={6}
                w={200}
                bg="transparent"
                onPress={() => {
                  router.push({
                    pathname: '/(auth)/(tabs)/coaching/bookedSessions',
                    params: {
                      id: coach?.id,
                    },
                  });
                }}>
                <Text fontSize={16} fontFamily="$body" color="$primary_blue">
                  View Bookings
                </Text>
              </TMButton>
            </View>
          )}
        </ScrollView>
      )}
    </>
  );
}
