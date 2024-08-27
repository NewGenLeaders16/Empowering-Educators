import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useEffect, useMemo, useRef } from 'react';
import { TouchableOpacity } from 'react-native';
import { Text, View, XStack } from 'tamagui';
import SheetChatComponent from '~/components/screen-components/SheetChatComponent';
import ScreenHeader from '~/components/ScreenHeader';
import WrapperContainer from '~/components/WrapperContainer';
import colors from '~/constants/colors';
import { supabase } from '~/utils/supabase';

export default function Home() {
  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = ['50%'];

  const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

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
            onPress={() => bottomSheetRef?.current?.expand()}>
            <View
              w={'100%'}
              ai={'center'}
              jc={'center'}
              h={150}
              bg={'$primary_yellow'}
              borderRadius={10}>
              <AntDesign name="plus" size={40} color={colors.light.black} />
            </View>
            <Text mt="$3" textAlign="center" fontFamily={'$body'} fontSize={18} fontWeight={'500'}>
              Open a coaching room
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ width: '42%', height: 200 }}>
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
          <TouchableOpacity style={{ width: '42%', height: 200 }}>
            <View
              w={'100%'}
              ai={'center'}
              jc={'center'}
              h={150}
              bg={'$primary_yellow'}
              borderRadius={10}>
              <MaterialIcons name="assessment" size={40} color="black" />
            </View>
            <Text mt="$3" textAlign="center" fontFamily={'$body'} fontSize={18} fontWeight={'500'}>
              Book your next Guided Growth Session
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={{ width: '42%', height: 200 }}>
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
          <BottomSheetScrollView
            style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20 }}
            contentContainerStyle={{ paddingBottom: 30 }}>
            <SheetChatComponent />
          </BottomSheetScrollView>
        </BottomSheet>
      </View>
    </WrapperContainer>
  );
}
