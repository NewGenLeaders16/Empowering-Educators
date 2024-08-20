import { ActivityIndicator } from 'react-native';
import { View } from 'tamagui';

import colors from '~/constants/colors';

export default function Page() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator size="large" color={colors.light.primary_blue} />
    </View>
  );
}
