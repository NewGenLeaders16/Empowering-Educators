import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { View } from 'tamagui';
import colors from '~/constants/colors';

interface ScreenHeaderProps {
  justify?: 'space-between' | 'flex-start' | 'flex-end' | 'center';
  children?: React.ReactNode;
  hideIcon?: boolean;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ justify, children, hideIcon }) => {
  return (
    <View
      paddingHorizontal="$4"
      marginTop="$4"
      alignItems="center"
      flexDirection="row"
      justifyContent={justify ? justify : 'space-between'}
      gap="$4">
      {!hideIcon && (
        <AntDesign
          name="arrowleft"
          size={24}
          color={colors.light.primary_yellow}
          onPress={() => router.back()}
        />
      )}
      {children}
    </View>
  );
};

export default ScreenHeader;
