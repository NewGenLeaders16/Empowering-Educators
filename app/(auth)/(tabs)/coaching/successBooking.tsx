import { AntDesign } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Button, Text, YStack } from 'tamagui';
import { View } from 'tamagui';

const SuccessBooking: React.FC = () => {
  const { coachName } = useLocalSearchParams();

  return (
    <YStack space="$3" flex={1} bg="$white" ai={'center'} dsp={'flex'} jc={'center'}>
      <AntDesign name="checkcircle" size={45} color="#59E659" />
      <Text
        fontFamily="$heading"
        fontWeight={'700'}
        color={'$black'}
        fontSize={28}
        maxWidth={'90%'}
        textAlign="center">
        Your session with {coachName} has been booked successfully!
      </Text>
      <Button
        borderRadius={6}
        w={200}
        bg="transparent"
        onPress={() => {
          router.replace('/(auth)/(tabs)/coaching/');
        }}>
        <Text fontSize={16} fontFamily="$body" color="$primary_blue">
          GO BACK
        </Text>
      </Button>
    </YStack>
  );
};

export default SuccessBooking;
