import { AntDesign } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import colors from '~/constants/colors';

export default function ResourcesLayout() {
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
      <Stack.Screen name="index" options={{ title: 'NewGen Resources' }} />
      <Stack.Screen name="addResource" options={{ title: 'Add Resource' }} />
      <Stack.Screen name="pdf" options={{ title: 'PDF Viewer' }} />
      <Stack.Screen name="[id]" options={{ title: 'Resource Details' }} />
    </Stack>
  );
}
