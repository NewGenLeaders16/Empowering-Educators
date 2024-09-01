import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Circle, ScrollView, Text, View, XStack } from 'tamagui';
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

  const { id } = useLocalSearchParams();

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
        if (error) {
          throw error;
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

    const { data, error } = await supabase.from('coachings').insert({
      coach_id: coach?.id,
      teacher_id: user?.id,
      scheduled_date: selectedDate,
      scheduled_time: '10:00',
      formatted_timestamp: selectedTime?.toISOString(),
    });

    if (error) {
      console.log(error, 'Error');
      setBookingLoading(false);
      return Alert.alert('Error', 'Failed to book session');
    }

    setBookingLoading(false);

    console.log(data, 'Data');

    router.back();
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
            <Button mt="$5" bg="$primary_blue" onPress={showDatePicker}>
              <Text color={'white'} fs={16} ff={'$body'} fontWeight={600}>
                Select Time
              </Text>
            </Button>
          )}

          {Platform.OS === 'ios' && (
            <DateTimePicker
              value={selectedTime}
              mode={'time'}
              is24Hour={true}
              onChange={onChange}
            />
          )}

          <Button
            mt="$3"
            onPress={() => {
              bookSession();
            }}
            disabled={bookingLoading}>
            {bookingLoading ? (
              <ActivityIndicator color={colors.light.primary_blue} size={'small'} />
            ) : (
              <Text fs={16} ff={'$body'} fontWeight={600}>
                Book Coaching
              </Text>
            )}
          </Button>
        </ScrollView>
      )}
    </>
  );
}
