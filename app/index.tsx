import { ActivityIndicator } from 'react-native';
import { Text, View } from 'tamagui';

import colors from '~/constants/colors';

import * as QueryParams from 'expo-auth-session/build/QueryParams';
import * as Linking from 'expo-linking';
import { supabase } from '~/utils/supabase';

const createSessionFromUrl = async (url: string) => {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  console.log(url, 'url');

  if (errorCode) throw new Error(errorCode);
  const { access_token, refresh_token } = params;

  if (!access_token) return;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });
  if (error) throw error;
  console.log(data, 'Data from session');

  return data;
};

export default function Page() {
  console.log('Hello world');

  const url = Linking.useURL();

  console.log(url, 'URL');

  if (url) createSessionFromUrl(url as string);

  return (
    <View flex={1} bg={'$white'} ai="center" jc="center">
      <ActivityIndicator size="large" color={colors.light.primary_blue} />
    </View>
  );
}
