import { AntDesign } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import colors from '~/constants/colors';

export default function CoachingLayout() {
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
      <Stack.Screen name="index" options={{ title: 'Coaches' }} />
    </Stack>
  );
}
