import { AntDesign } from '@expo/vector-icons';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, TouchableOpacity, Image } from 'react-native';
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
import { useState } from 'react';
import colors from '~/constants/colors';
import { showErrorAlert } from '~/utils';

interface ProfileFormProps {
  email: string;
  password: string;
  name: string;
}

export default function Profile() {
  const { user, setUser } = useUserStore();

  const { control, handleSubmit } = useForm<ProfileFormProps>({
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

    console.log(userData, 'UserData', userId, name);

    return userData;
  };

  const updateProfile: SubmitHandler<ProfileFormProps> = async (data) => {
    try {
      setFormLoading(true);

      if (data?.password) {
        const { error: authError } = await supabase.auth.updateUser({
          password: data?.password,
          data: {
            full_name: data?.name,
          },
        });

        console.log(authError, 'wtf');

        if (authError) {
          throw authError;
        }
      }

      const userId = user?.id!;
      const userData = await updateUserInDatabase(userId, data?.name);

      setUser(userData);
      setFormLoading(false);
    } catch (error: any) {
      showErrorAlert(error);
    } finally {
      setFormLoading(false);
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
            {formLoading ? (
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
              await supabase.auth.signOut();
              setUser(null);
            }}>
            <Text fontSize={16} fontFamily="$body" color="$primary_blue">
              SIGN OUT
            </Text>
          </Button>
          <Button borderRadius={6} w={200} bg="transparent">
            <Text fontSize={16} fontFamily="$body" color="$primary_blue">
              DELETE ACCOUNT
            </Text>
          </Button>
        </YStack>
      </ScrollView>
    </WrapperContainer>
  );
}
