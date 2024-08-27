import { StatusBar as ExpoStatusBar } from 'expo-status-bar';
import { Keyboard, Platform, StatusBar, TouchableWithoutFeedback } from 'react-native';
import { View } from 'tamagui';

export default function WrapperContainer({
  children,
  scrollEnabled,
}: {
  children: React.ReactNode;
  scrollEnabled?: boolean;
}) {
  return (
    <>
      <ExpoStatusBar style="auto" />
      {scrollEnabled ? (
        <View
          flex={1}
          backgroundColor="$white"
          paddingTop={Platform.OS === 'android' ? StatusBar.currentHeight : 32}
          overflow="hidden">
          {children}
        </View>
      ) : (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <View
            flex={1}
            backgroundColor="$white"
            paddingTop={Platform.OS === 'android' ? StatusBar.currentHeight : 32}
            overflow="hidden">
            {children}
          </View>
        </TouchableWithoutFeedback>
      )}
    </>
  );
}
