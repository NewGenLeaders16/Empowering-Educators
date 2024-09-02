import { router } from 'expo-router';
import { useState } from 'react';
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

interface FormData {
  name: string;
  email: string;
  password: string;
}

const SignUp: React.FC = () => {
  const { control, handleSubmit } = useForm<FormData>();

  const [signupLoading, setSignUpLoading] = useState(false);

  const { setUser } = useUserStore();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(data);

    setSignUpLoading(true);

    const { data: userData, error: userError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          full_name: data.name,
        },
      },
    });

    if (userError) {
      showErrorAlert(userError);
      setSignUpLoading(false);
      return;
    }

    setSignUpLoading(false);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userData?.user?.id!)
      .single();

    if (error) {
      showErrorAlert(error);
      setSignUpLoading(false);
      return;
    }

    await axiosClient.get(`registerStreamUser?id=${user?.id}`);

    setUser(user ?? null);
  };

  const url = Linking.useURL();

  console.log('signupLoading', url);

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
        <View
          bg="white"
          borderRadius="$7"
          px="$3"
          pt="$7"
          py="$5"
          minWidth="90%"
          mt="$6"
          minHeight={400}>
          <Text
            textAlign="center"
            fontSize="$9"
            fontFamily="$body"
            fontWeight="700"
            color="$primary_yellow">
            Sign Up
          </Text>
          <YStack space="$3" mt="$4">
            <ValidateInput
              name="name"
              control={control}
              label="Name"
              placeholder="Enter your name"
              rules={{ required: 'Name is required' }}
            />
            <ValidateInput
              name="email"
              control={control}
              label="Email"
              placeholder="Enter your email"
              rules={{ required: 'Email is required' }}
            />
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
            <FilledButton onPress={handleSubmit(onSubmit)} mt="$2">
              {signupLoading ? (
                <ActivityIndicator color={colors.light.black} size="small" />
              ) : (
                <Text fontSize={16} fontFamily="$body" color="$black">
                  SIGNUP
                </Text>
              )}
            </FilledButton>
            <Button mt="$2" py="$0" h={30} onPress={() => router.push('/(public)/signin')}>
              <Text fontSize={16} fontFamily="$body" color="$primary_blue">
                ALREADY HAVE AN ACCOUNT ?
              </Text>
            </Button>
            <Button h={22}>
              <Text fontSize={12} fontFamily="$body" color="$black">
                Want to be a coach? Contact XXX
              </Text>
            </Button>
          </YStack>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default SignUp;
