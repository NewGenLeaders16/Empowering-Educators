import { AntDesign } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import colors from '~/constants/colors';
import useUserStore from '~/stores/useUser';

export default function CoachingLayout() {
  const { user } = useUserStore();

  return (
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
      <Stack.Screen
        name="index"
        options={{ title: user?.role === 'coach' ? 'Booked Coachings' : 'Coaches' }}
      />

      <Stack.Screen name="[id]" />
      <Stack.Screen name="successBooking" options={{ title: '' }} />
      <Stack.Screen name="bookedSessions" options={{ title: '' }} />
    </Stack>
  );
}
