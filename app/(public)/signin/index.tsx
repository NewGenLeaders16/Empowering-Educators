import { router } from 'expo-router';
import { SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView } from 'react-native';
import { Button, ScrollView, Text, View, YStack } from 'tamagui';
import BottomSheet, { BottomSheetBackdrop, BottomSheetScrollView } from '@gorhom/bottom-sheet';
import { useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { makeRedirectUri } from 'expo-auth-session';
import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';

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

interface FormDataForgotPassword {
  email: string;
}

const redirectTo = makeRedirectUri();

const createSessionFromUrl = async (url: string) => {
  console.log(url, 'url');

  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;

  router.replace('/(auth)/(tabs)/home');

  return data.session;
};

const SignIn: React.FC = () => {
  const { control, handleSubmit } = useForm<FormData>();
  const {
    control: forgotPasswordControl,
    handleSubmit: forgotPasswordHandleSubmit,
    getValues,
  } = useForm<FormDataForgotPassword>();

  const [signinLoading, setSignInLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [resetPasswordSubmitted, setResetPasswordSubmitted] = useState(false);

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

  const onForgotPassword: SubmitHandler<FormDataForgotPassword> = async (data) => {
    console.log(data);

    setForgotPasswordLoading(true);

    console.log(redirectTo, `${redirectTo}/reset-password`);

    const { error } = await supabase.auth.resetPasswordForEmail(data?.email, {
      redirectTo: `${redirectTo}`,
    });

    if (error) {
      showErrorAlert(error);
      setForgotPasswordLoading(false);
      return;
    }

    setForgotPasswordLoading(false);

    setResetPasswordSubmitted(true);
  };

  const bottomSheetRef = useRef<BottomSheet>(null);

  const snapPoints = ['100%'];

  const memoizedSnapPoints = useMemo(() => snapPoints, [snapPoints]);

  const url = Linking.useURL();

  if (url) createSessionFromUrl(url);

  console.log(url, 'url');

  return (
    <>
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
              <Button mt="$5" py="$0" h={30} onPress={() => bottomSheetRef.current?.expand()}>
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

      <BottomSheet
        snapPoints={memoizedSnapPoints}
        ref={bottomSheetRef}
        index={-1}
        enablePanDownToClose
        keyboardBehavior="fillParent"
        backdropComponent={(props) => (
          <BottomSheetBackdrop
            {...props}
            opacity={0.5}
            onPress={() => bottomSheetRef.current?.close()}
            disappearsOnIndex={-1}
          />
        )}>
        <BottomSheetScrollView style={{ flex: 1, paddingHorizontal: 16, paddingTop: 90 }}>
          {resetPasswordSubmitted ? (
            <>
              <Text fontFamily={'$heading'} fontSize={24} fontWeight={'700'}>
                An email is on its way!
              </Text>
              <Text fontFamily={'$body'} opacity={0.8} mt="$3" fontSize={16} maxWidth={'90%'}>
                We sent an email to {getValues('email')} . Click the link in the email to reset your
                password.
              </Text>

              <Button
                onPress={() => {
                  bottomSheetRef?.current?.close();
                  setResetPasswordSubmitted(false);
                }}
                mt="$2">
                <Text fontFamily={'$body'} opacity={0.7} fontSize={18}>
                  AWESOME
                </Text>
              </Button>
            </>
          ) : (
            <>
              <Text fontFamily={'$heading'} fontSize={24} fontWeight={'700'}>
                Password Reset
              </Text>
              <Text fontFamily={'$body'} opacity={0.8} mt="$3" fontSize={16} maxWidth={'90%'}>
                Enter your email address and we'll send you instructions on how to reset your
                password
              </Text>
              <YStack space="$3" mt="$5">
                <ValidateInput
                  name="email"
                  control={forgotPasswordControl}
                  label="Email"
                  placeholder="Enter email..."
                  rules={{ required: 'Email is required' }}
                />
              </YStack>

              <Button onPress={forgotPasswordHandleSubmit(onForgotPassword)} mt="$4">
                {forgotPasswordLoading ? (
                  <ActivityIndicator color={colors.light.black} size="small" />
                ) : (
                  <Text fontFamily={'$body'} fontWeight={600} fontSize={18}>
                    SUBMIT
                  </Text>
                )}
              </Button>
              <Button onPress={() => bottomSheetRef?.current?.close()} mt="$2">
                <Text fontFamily={'$body'} opacity={0.7} fontSize={18}>
                  CANCEL
                </Text>
              </Button>
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </>
  );
};

export default SignIn;
