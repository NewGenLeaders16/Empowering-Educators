import { AntDesign } from '@expo/vector-icons';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, TouchableOpacity, Image, Alert } from 'react-native';
import { Circle, ScrollView, Text, View, YStack } from 'tamagui';
import ScreenHeader from '~/components/ScreenHeader';
import ValidateInput from '~/components/validate-input/ValidateInput';
import WrapperContainer from '~/components/WrapperContainer';
import { Button } from '~/tamagui.config';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '~/utils/supabase';
import useUserStore from '~/stores/useUser';
import { useEffect, useState } from 'react';
import colors from '~/constants/colors';
import { axiosClient, showErrorAlert } from '~/utils';
import { StreamChat } from 'stream-chat';
import { useChatClientContext } from '~/context/ChatClientContext';
import { useAppContext } from '~/context/ChatContext';
import { router, usePathname } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfileFormProps {
  email: string;
  password: string;
  name: string;
}

export default function Profile() {
  const { user, setUser } = useUserStore();

  const { client } = useChatClientContext();

  const pathName = usePathname();

  const { profileUpdateLoading, setProfileUpdateLoading, updatePathName, setUpdatePathName } =
    useAppContext();

  const { control, handleSubmit, setValue } = useForm<ProfileFormProps>({
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
    },
  });

  const [uploadLoading, setUploadLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const updateUserInDatabase = async (userId: string, name: string) => {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .update({
        name,
      })
      .eq('id', userId)
      .select('*')
      .single();

    if (userError) {
      throw userError;
    }

    return userData;
  };

  const updateProfile: SubmitHandler<ProfileFormProps> = async (data) => {
    try {
      setProfileUpdateLoading(true);

      const userId = user?.id!;
      const userData = await updateUserInDatabase(userId, data?.name);

      setUser(userData);

      if (data?.password) {
        const { data: axiosData } = await axiosClient.post('resetUserPassword', {
          id: userId,
          password: data.password,
          name: data?.name,
        });

        setValue('password', '');
      }

      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      showErrorAlert(error);
    } finally {
      setProfileUpdateLoading(false);
    }
  };

  const onSelectImage = async () => {
    try {
      const options: ImagePicker.ImagePickerOptions = {
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      };

      const result = await ImagePicker.launchImageLibraryAsync(options);

      // Save image if not cancelled
      if (!result.canceled) {
        const img = result.assets[0];

        if (img.type !== 'image') {
          return alert('Only images are allowed');
        }

        setUploadLoading(true);

        const base64 = await FileSystem.readAsStringAsync(img.uri, { encoding: 'base64' });
        const filePath = `${user!.id}/${new Date().getTime()}.png`;
        const contentType = 'image/png';
        const { data, error } = await supabase.storage
          .from('profile-images')
          .upload(filePath, decode(base64), { contentType });

        if (error) {
          throw error;
        }

        const { data: supabaseImg } = await supabase.storage
          .from('profile-images')
          .getPublicUrl(data?.path);

        const { data: userData, error: userError } = await supabase
          .from('users')
          .update({
            image_url: supabaseImg?.publicUrl,
          })
          .eq('id', user?.id!)
          .select('*')
          .single();

        if (userError) {
          throw userError;
        }

        setUser(userData);
      }
    } catch (error: any) {
      alert(error?.message);
    } finally {
      setUploadLoading(false);
    }
  };

  const deleteAccount = async () => {
    const response = Alert.prompt(
      'Are you sure you want to delete your account?',
      'This action is irreversible'
    );
    console.log(response, 'Response');

    try {
    } catch (error) {}
  };

  useEffect(() => {
    setUpdatePathName(pathName);
  }, [pathName]);

  return (
    <WrapperContainer scrollEnabled>
      <ScreenHeader />
      <ScrollView flex={1} bg="white" px="$5" contentContainerStyle={{ paddingBottom: 25 }}>
        <Text
          fontFamily={'$heading'}
          fontWeight={'700'}
          color={'$black'}
          fontSize={28}
          mt="$5"
          textAlign="center">
          Account Settings
        </Text>

        <View ai={'center'} dsp={'flex'} jc={'center'} mt="$6">
          <TouchableOpacity onPress={onSelectImage}>
            <Circle size={150} bg="$primary_grey">
              {uploadLoading ? (
                <ActivityIndicator color="white" size={'large'} />
              ) : (
                <>
                  {user?.image_url ? (
                    <Image
                      source={{ uri: user?.image_url! }}
                      style={{
                        width: 150,
                        height: 150,
                        borderRadius: 9999,
                        backgroundColor: colors.light.primary_grey,
                      }}
                    />
                  ) : (
                    <AntDesign name="camera" size={50} color="white" />
                  )}
                </>
              )}
            </Circle>
          </TouchableOpacity>
        </View>

        <View mt="$10">
          <Text fontFamily="$body" fontWeight={'600'} color={'$black'} fontSize={20}>
            Account
          </Text>
        </View>
        <View
          mt="$3"
          borderColor={'#e5e5e5'}
          minHeight={200}
          borderRadius={1}
          w={'100%'}
          borderWidth={1}>
          <View borderBottomColor={'#e5e5e5'} borderBottomWidth={1} px="$4" py="$4.5">
            <Text mb="$2" fontFamily={'$body'} fontSize={16} fontWeight={'700'}>
              Password
            </Text>
            <ValidateInput name="password" control={control} placeholder="Enter new password" />
          </View>
          <View borderBottomColor={'#e5e5e5'} borderBottomWidth={1} px="$4" py="$4.5">
            <Text
              mb="$2"
              fontFamily={'$body'}
              fontSize={16}
              fontWeight={'700'}
              color={'$primary_grey'}>
              Email
            </Text>
            <ValidateInput
              name="email"
              control={control}
              placeholder="Enter your email"
              disabled
              bg={'$gray2Light'}
              color={'$primary_grey'}
            />
          </View>
          <View borderBottomColor={'#e5e5e5'} borderBottomWidth={1} px="$4" py="$4.5">
            <Text mb="$2" fontFamily={'$body'} fontSize={16} fontWeight={'700'}>
              Name
            </Text>
            <ValidateInput name="name" control={control} placeholder="Enter your name" />
          </View>
        </View>

        <YStack ai={'center'} jc={'center'} mt="$8" space="$3">
          <Button borderRadius={6} w={160} bg="$primary_blue" onPress={handleSubmit(updateProfile)}>
            {profileUpdateLoading ? (
              <ActivityIndicator color="white" size={'small'} />
            ) : (
              <Text fontSize={16} fontFamily="$body" color="white">
                SAVE CHANGES
              </Text>
            )}
          </Button>
          <Button
            borderRadius={6}
            w={160}
            bg="$primary_yellow"
            onPress={async () => {
              // await supabase.auth.signOut();

              AsyncStorage.removeItem('sb-xsmvurpfpaavwhqhbage-auth-token')
                .then(() => {
                  setUser(null);
                  // @ts-ignore
                  client?.disconnectUser();
                  router.replace('/(public)/signin');
                })
                .catch((err) => {
                  console.log(err, 'Error');
                });
            }}>
            <Text fontSize={16} fontFamily="$body" color="$primary_blue">
              SIGN OUT
            </Text>
          </Button>
        </YStack>
      </ScrollView>
    </WrapperContainer>
  );
}
