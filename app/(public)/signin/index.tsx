import { router } from 'expo-router';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { Button, ScrollView, Text, View, YStack } from 'tamagui';

import ValidateInput from '~/components/validate-input/ValidateInput';
import colors from '~/constants/colors';
import useUserStore from '~/stores/useUser';
import { OutlinedButton } from '~/tamagui.config';
import { showErrorAlert } from '~/utils';
import { supabase } from '~/utils/supabase';

interface FormData {
  email: string;
  password: string;
}

const SignIn: React.FC = () => {
  const { control, handleSubmit } = useForm<FormData>();

  const [signinLoading, setSignInLoading] = useState(false);

  const { setUser } = useUserStore();

  const onSubmit: SubmitHandler<FormData> = async (data) => {
    console.log(data);

    setSignInLoading(true);

    const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (userError) {
      showErrorAlert(userError);
      setSignInLoading(false);
      return;
    }

    setSignInLoading(false);

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userData?.user?.id!)
      .single();

    if (error) {
      showErrorAlert(error);
      setSignInLoading(false);
      return;
    }

    setUser(user ?? null);
  };

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
            Login
          </Text>
          <YStack space="$3" mt="$4">
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
            <OutlinedButton onPress={handleSubmit(onSubmit)} mt="$6">
              {signinLoading ? (
                <ActivityIndicator color={colors.light.primary_yellow} size="small" />
              ) : (
                <Text fontSize={16} fontFamily="$body" color="$primary_yellow">
                  SIGN IN
                </Text>
              )}
            </OutlinedButton>
            <Button mt="$5" py="$0" h={30}>
              <Text fontSize={16} fontFamily="$body" color="$primary_blue">
                FORGOT PASSWORD ?
              </Text>
            </Button>
            <Button onPress={() => router.push('/(public)/signup')} mt="$2" h={30}>
              <Text fontSize={16} fontFamily="$body" color="$primary_blue">
                SIGN UP
              </Text>
            </Button>
          </YStack>
        </View>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default SignIn;
