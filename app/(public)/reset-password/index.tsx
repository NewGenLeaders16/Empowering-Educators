import { router } from 'expo-router';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { Button, ScrollView, Text, View, YStack } from 'tamagui';

import ValidateInput from '~/components/validate-input/ValidateInput';
import colors from '~/constants/colors';
import useUserStore from '~/stores/useUser';
import { Button as FilledButton } from '~/tamagui.config';
import { showErrorAlert } from '~/utils';
import { supabase } from '~/utils/supabase';
import * as Linking from 'expo-linking';

interface FormData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const { control, handleSubmit } = useForm<FormData>();

  const [resetLoading, setResetLoading] = useState(false);

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(data);

    setResetLoading(true);

    const { data: userData, error: userError } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (userError) {
      showErrorAlert(userError);
      setResetLoading(false);
      return;
    }

    await supabase.auth.signOut();

    setResetLoading(false);

    router.push('/(public)/signin');
  };

  const url = `${Linking.useURL()}`;

  console.log(url, 'url');

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
              {resetLoading ? (
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
