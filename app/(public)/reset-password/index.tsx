import { router, useLocalSearchParams, usePathname } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { Button, ScrollView, Text, View, YStack } from 'tamagui';

import ValidateInput from '~/components/validate-input/ValidateInput';
import colors from '~/constants/colors';
import useUserStore from '~/stores/useUser';
import { Button as FilledButton } from '~/tamagui.config';
import { axiosClient, showErrorAlert } from '~/utils';
import { supabase } from '~/utils/supabase';
import * as Linking from 'expo-linking';
import { useFocusEffect } from 'expo-router';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { useAppContext } from '~/context/ChatContext';
import { err } from 'react-native-svg';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  // useFocusEffect(
  //   useCallback(() => {
  //     return () => {
  //       supabase.auth.signOut().then(() => {
  //         console.log('signed out');
  //       });
  //       // Sign out the user here if they leave the screen
  //     };
  //   }, [])
  // );

  const [userEmail, setUserEmail] = useState('');

  const [full_name, setFull_name] = useState('');

  const createSessionFromUrl = async (url: string) => {
    const { params, errorCode } = QueryParams.getQueryParams(url);

    if (errorCode) throw new Error(errorCode);
    const { access_token, refresh_token } = params;

    if (!access_token) {
      router.push(`/(public)/signin`);
      return;
    }

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) throw error;

    return data;
  };

  const pathName = usePathname();

  const { user } = useUserStore();

  const { url } = useLocalSearchParams();

  const { control, handleSubmit } = useForm<FormData>();

  const { setProfileUpdateLoading, profileUpdateLoading, setUpdatePathName, session } =
    useAppContext();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      setProfileUpdateLoading(true);

      const { data: axiosData } = await axiosClient.post('resetUserPassword', {
        // @ts-ignore
        id: session?.user?.id,
        password: data.password,
      });

      AsyncStorage.removeItem('sb-xsmvurpfpaavwhqhbage-auth-token')
        .then(() => {
          router.replace('/(public)/signin');
        })
        .catch((err) => {
          console.log(err, 'Error');
        });

      setProfileUpdateLoading(false);
    } catch (error) {
      showErrorAlert(error);
      console.log(error, 'Error');
    }
  };

  if (url) createSessionFromUrl(url as string);

  useEffect(() => {
    setUpdatePathName(pathName);
  }, [pathName]);

  return (
    <ScrollView
      flex={1}
      backgroundColor="$primary_blue"
      contentContainerStyle={{ alignItems: 'center' }}>
      <KeyboardAvoidingView>
        <Text
          fontSize="$10"
          color="$white"
          fontFamily="$heading"
          fontWeight="600"
          textAlign="center"
          mt="$12">
          Empowering Educators
        </Text>
        <View bg="white" borderRadius="$7" px="$3" py="$7" minWidth="90%" mt="$6" minHeight={400}>
          <Text
            textAlign="center"
            fontSize="$9"
            fontFamily="$body"
            fontWeight="700"
            color="$primary_yellow">
            Reset Password
          </Text>
          <YStack space="$3" mt="$4">
            <ValidateInput
              name="password"
              control={control}
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              rules={{
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters long' },
              }}
            />
            <ValidateInput
              name="confirmPassword"
              control={control}
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry
              rules={{
                required: 'Password is required',
              }}
            />
            <FilledButton onPress={handleSubmit(onSubmit)} mt="$6">
              {profileUpdateLoading ? (
                <ActivityIndicator color={colors.light.black} size="small" />
              ) : (
                <Text fontSize={16} fontFamily="$body" color="$black">
                  RESET PASSWORD
                </Text>
              )}
            </FilledButton>
          </YStack>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default ResetPassword;
