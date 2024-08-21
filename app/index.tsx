import { ActivityIndicator } from 'react-native';
import { Text, View } from 'tamagui';

import colors from '~/constants/colors';

export default function Page() {
  console.log('Hello world');

  return (
    <View flex={1} bg={'$white'} ai="center" jc="center">
      <ActivityIndicator size="large" color={colors.light.primary_blue} />
    </View>
  );
}
