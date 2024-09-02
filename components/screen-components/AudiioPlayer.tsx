// import React, { useState, useEffect } from 'react';
// import { TouchableOpacity } from 'react-native';
// import { Audio } from 'expo-av';
// // import Slider from '@react-native-community/slider';
// import { Circle, Slider, Text, View, XStack } from 'tamagui';
// import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
// import colors from '~/constants/colors';

// interface AudioPlayerProps {
//   audioUrl: string;
// }

// const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
//   const [sound, setSound] = useState<Audio.Sound | undefined>();
//   const [playing, setPlaying] = useState(false);
//   const [duration, setDuration] = useState<number>(0);
//   const [sliderValue, setSliderValue] = useState<number>(0);

//   async function playSound() {
//     if (!sound) {
//       const { sound } = await Audio.Sound.createAsync({ uri: audioUrl }, { isLooping: true });
//       setSound(sound);
//     }
//     if (playing) {
//       await sound?.pauseAsync();
//       setPlaying(false);
//       return;
//     }
//     await sound?.playAsync();
//     setPlaying(true);
//   }

//   useEffect(() => {
//     return sound
//       ? () => {
//           sound?.unloadAsync();
//         }
//       : undefined;
//   }, [sound]);

//   useEffect(() => {
//     if (!sound) return;

//     sound.setOnPlaybackStatusUpdate((status) => {
//       // Set a callback to update the playback status
//       if (status.isLoaded) {
//         setDuration(status.durationMillis!);
//         setSliderValue((status.positionMillis / status.durationMillis!) * 100);
//       }
//     });
//   }, [sound]);

//   const formatDuration = (duration: number) => {
//     const totalSeconds = Math.floor(duration / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   };

//   return (
//     <View bg="#FAFAFA" px={8} py={12} borderRadius={99} mt="$8">
//       <XStack gap="$2" alignItems="center" width="100%">
//         <TouchableOpacity onPress={playSound}>
//           <Circle width={32} height={32} bg="$primary_blue">
//             <FontAwesome
//               name={playing ? 'pause' : 'play'}
//               size={16}
//               color={colors.light.primary_yellow}
//               style={{ marginLeft: 2 }}
//             />
//           </Circle>
//         </TouchableOpacity>
//         <Slider value={[sliderValue]} max={100} step={1} size="$1.5" width="65%" ml="$2">
//           <Slider.Track bg="$primary_grey">
//             <Slider.TrackActive bg="$primary_yellow" />
//           </Slider.Track>
//           <Slider.Thumb index={0} circular size="$1" borderColor="$primary_blue" bg={'white'} />
//         </Slider>
//         <Text color="$black" fontSize={14} lineHeight={19.6} fontWeight="bold" fontFamily="$body">
//           {formatDuration(duration)}
//         </Text>
//         <MaterialCommunityIcons name="volume-high" size={24} color="black" />
//       </XStack>
//     </View>
//   );
// };

// export default AudioPlayer;

import React, { useState, useEffect } from 'react';
import { GestureResponderEvent, TouchableOpacity } from 'react-native';
import { Audio } from 'expo-av';
import { Circle, Slider, Text, View, XStack } from 'tamagui';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import colors from '~/constants/colors';

interface AudioPlayerProps {
  audioUrl: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioUrl }) => {
  const [sound, setSound] = useState<Audio.Sound | undefined>();
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [position, setPosition] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState<number>(0);

  useEffect(() => {
    const loadSound = async () => {
      const { sound } = await Audio.Sound.createAsync({ uri: audioUrl });
      setSound(sound);
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        setDuration(status.durationMillis!);
      }
    };

    loadSound();

    return sound
      ? () => {
          sound.unloadAsync();
        }
      : undefined;
  }, [audioUrl]);

  const playSound = async () => {
    if (sound) {
      const status = await sound.getStatusAsync();
      if (status.isLoaded && !playing) {
        await sound.playAsync();
        setPlaying(true);
      } else if (playing) {
        await sound.pauseAsync();
        setPlaying(false);
      }
    }
  };

  useEffect(() => {
    if (!sound) return;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded) {
        setPosition(status.positionMillis);
        setDuration(status.durationMillis!);
        setSliderValue((status.positionMillis / status.durationMillis!) * 100);
      }
    });
  }, [sound]);

  console.log('position', position, duration, 'duration');

  const formatDuration = (duration: number) => {
    const totalSeconds = Math.floor(duration / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSlidingComplete = async (event: GestureResponderEvent, value: number) => {
    if (sound) {
      const seekPosition = (value / 100) * duration;
      await sound.setPositionAsync(seekPosition);
    }
  };

  useEffect(() => {
    if (position == 0 || duration == 0) return;
    if (+position >= +duration) {
      (async () => {
        await sound?.setPositionAsync(0);
        playSound();
      })();
    }
  }, [position, duration]);

  return (
    <View bg="#FAFAFA" px={8} py={12} borderRadius={99} mt="$8">
      <XStack gap="$2" alignItems="center" width="100%">
        <TouchableOpacity onPress={playSound}>
          <Circle width={32} height={32} bg="$primary_blue">
            <FontAwesome
              name={playing ? 'pause' : 'play'}
              size={16}
              color={colors.light.primary_yellow}
              style={{ marginLeft: 2 }}
            />
          </Circle>
        </TouchableOpacity>
        <Slider
          value={[sliderValue]}
          step={1}
          size="$1.5"
          width="60%"
          ml="$2"
          onSlideEnd={handleSlidingComplete}
          // onValueChange={handleSlidingComplete}
          // onSlidingComplete={handleSlidingComplete}
        >
          <Slider.Track bg="$primary_grey">
            <Slider.TrackActive bg="$primary_yellow" />
          </Slider.Track>
          <Slider.Thumb index={0} circular size="$1" borderColor="$primary_blue" bg={'white'} />
        </Slider>
        <Text color="$black" fontSize={14} lineHeight={19.6} fontWeight="bold" fontFamily="$body">
          {formatDuration(position)} / {formatDuration(duration)}
        </Text>
        {/* <MaterialCommunityIcons name="volume-high" size={24} color="black" /> */}
      </XStack>
    </View>
  );
};

export default AudioPlayer;
