import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Image, Linking } from 'react-native';
import { ScrollView, Text, View } from 'tamagui';
import colors from '~/constants/colors';
import { Resources } from '~/types';
import { supabase } from '~/utils/supabase';
import { Video, ResizeMode, Audio } from 'expo-av';
import AudioPlayer from '~/components/screen-components/AudiioPlayer';
import { Button } from '~/tamagui.config';
import Pdf from 'react-native-pdf';

const ResourceDetails: React.FC = () => {
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [resource, setResource] = useState<Resources | null>(null);
  const [status, setStatus] = useState<any>(null);

  const video = useRef(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from('resources').select('*').eq('id', id).single();

      console.log(data, error, 'data,error');

      if (error) {
        console.error(error);
        return;
      }

      setResource(data);
      setLoading(false);
    })();
  }, []);

  return (
    <>
      {loading ? (
        <View flex={1} bg={'$white'} px="$5" ai={'center'} jc="center">
          <ActivityIndicator size="large" color={colors.light.primary_blue} />
        </View>
      ) : (
        <ScrollView flex={1} bg={'$white'} px="$3" contentContainerStyle={{ paddingBottom: 40 }}>
          <Image
            source={{ uri: resource?.thumbnail_url! }}
            style={{ width: '100%', height: 240, borderRadius: 5, marginTop: 24 }}
            key={resource?.thumbnail_url}
          />
          <Text mt="$5" fontSize={28} fontFamily={'$heading'} fontWeight={'700'}>
            {resource?.title}
          </Text>
          <Text mt="$2" fontSize={16} fontFamily={'$heading'} fontWeight={'500'}>
            {resource?.description}
          </Text>

          <View mt="$5">
            <Text fontSize={20} fontWeight={600} fontFamily={'$body'}>
              Main Goals
            </Text>
            <Text fontSize={16} fontWeight={500} fontFamily={'$body'} mt="$2">
              {resource?.main_goal}
            </Text>
          </View>
          <View mt="$3">
            <Text fontSize={20} fontWeight={600} fontFamily={'$body'}>
              Topics Covered
            </Text>
            <Text fontSize={16} fontWeight={500} fontFamily={'$body'} mt="$2">
              {resource?.topics_covered}
            </Text>
          </View>

          {resource?.category === 'video' && (
            <>
              <Text mt="$4" fontSize={20} fontWeight={600} fontFamily={'$body'}>
                Video
              </Text>
              <Video
                ref={video}
                style={{
                  width: '100%',
                  height: 240,
                  marginTop: 24,
                }}
                source={{
                  uri: resource?.file_url!,
                }}
                useNativeControls
                resizeMode={ResizeMode.CONTAIN}
                isLooping
                onPlaybackStatusUpdate={(status) => setStatus(() => status)}
              />
            </>
          )}

          {resource?.category === 'podcast' && <AudioPlayer audioUrl={resource?.file_url!} />}

          {resource?.category === 'pdf' && (
            <>
              <Button
                onPress={() => {
                  router.push({
                    pathname: '/(auth)/(tabs)/resources/pdf',
                    params: { pdfUri: resource?.file_url, title: resource?.title },
                  });
                }}
                mt="$6">
                <Text fontSize={16} fontFamily={'$body'} fontWeight={600}>
                  View PDf
                </Text>
              </Button>
            </>
          )}
        </ScrollView>
      )}
    </>
  );
};

export default ResourceDetails;
