import { AntDesign, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetScrollView,
  BottomSheetView,
} from '@gorhom/bottom-sheet';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, View, XStack } from 'tamagui';
import SheetChatComponent from '~/components/screen-components/SheetChatComponent';
import ScreenHeader from '~/components/ScreenHeader';
import WrapperContainer from '~/components/WrapperContainer';
import colors from '~/constants/colors';
import useUserStore from '~/stores/useUser';
import { supabase } from '~/utils/supabase';

export default function Home() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = ['50%'];

  const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  const { user } = useUserStore();

  return (
    <WrapperContainer>
      <ScreenHeader hideIcon />
      <View flex={1} bg={'white'} px="$5">
        <Text fontSize={18} fontFamily={'$body'} fontWeight={'500'} mt="$8">
          Below is your NextGen Portal. Here you can open a coaching room with your NextGen Coach,
          book your next Guided Growth Session and access our resource portal
        </Text>

        <XStack w="100%" space="$5" mt="$8" ai={'center'} jc={'center'}>
          <TouchableOpacity
            style={{ width: '42%', height: 200 }}
            onPress={() => {
              user?.role === 'teacher'
                ? bottomSheetRef.current?.expand()
                : router.push('/(auth)/(tabs)/chat');
            }}>
            <View
              w={'100%'}
              ai={'center'}
              jc={'center'}
              h={150}
              bg={'$primary_yellow'}
              borderRadius={10}>
              {user?.role === 'coach' ? (
                <AntDesign name="message1" size={40} color={colors.light.black} />
              ) : (
                <AntDesign name="plus" size={40} color={colors.light.black} />
              )}
            </View>
            <Text mt="$3" textAlign="center" fontFamily={'$body'} fontSize={18} fontWeight={'500'}>
              {user?.role === 'coach' ? 'View Chats' : 'Open a coaching room'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ width: '42%', height: 200 }}
            onPress={() => router.push('/(auth)/(tabs)/profile')}>
            <View
              w={'100%'}
              ai={'center'}
              jc={'center'}
              h={150}
              bg={'$primary_yellow'}
              borderRadius={10}>
              <AntDesign name="user" size={40} color={colors.light.black} />
            </View>
            <Text mt="$3" textAlign="center" fontFamily={'$body'} fontSize={18} fontWeight={'500'}>
              Edit Profile
            </Text>
          </TouchableOpacity>
        </XStack>
        <XStack w="100%" space="$5" mt="$6" ai={'center'} jc={'center'}>
          <TouchableOpacity
            style={{ width: '42%', height: 200 }}
            onPress={() => router.push('/(auth)/(tabs)/coaching')}>
            <View
              w={'100%'}
              ai={'center'}
              jc={'center'}
              h={150}
              bg={'$primary_yellow'}
              borderRadius={10}>
              {user?.role === 'coach' ? (
                <FontAwesome5 name="hands-helping" size={40} color="black" />
              ) : (
                <MaterialIcons name="assessment" size={40} color="black" />
              )}
            </View>
            <Text mt="$3" textAlign="center" fontFamily={'$body'} fontSize={18} fontWeight={'500'}>
              {user?.role === 'teacher' ? 'Book a Guided Growth Session' : 'View Booked Coachings'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{ width: '42%', height: 200 }}
            onPress={() => router.push('/(auth)/(tabs)/resources')}>
            <View
              w={'100%'}
              ai={'center'}
              jc={'center'}
              h={150}
              bg={'$primary_yellow'}
              borderRadius={10}>
              <AntDesign name="file1" size={40} color={colors.light.black} />
            </View>
            <Text mt="$3" textAlign="center" fontFamily={'$body'} fontSize={18} fontWeight={'500'}>
              Resource Portal
            </Text>
          </TouchableOpacity>
        </XStack>

        {/* Bottom Sheet for the chats */}
        <BottomSheet
          snapPoints={memoizedSnapPoints}
          ref={bottomSheetRef}
          index={-1}
          enablePanDownToClose
          keyboardBehavior="fillParent"
          backdropComponent={(props) => (
            <BottomSheetBackdrop
              {...props}
              opacity={0.8}
              onPress={() => bottomSheetRef.current?.close()}
              disappearsOnIndex={-1}
            />
          )}>
          <BottomSheetView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20 }}>
            <SheetChatComponent />
          </BottomSheetView>
        </BottomSheet>
      </View>
    </WrapperContainer>
  );
}
