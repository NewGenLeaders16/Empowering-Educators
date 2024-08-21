import { useEffect } from 'react';
import { Text, View } from 'tamagui';
import { supabase } from '~/utils/supabase';

export default function Home() {
  //   useEffect(() => {
  //     supabase.auth.signOut();
  //   }, []);
  return (
    <View flex={1}>
      <Text>Home</Text>
    </View>
  );
}
