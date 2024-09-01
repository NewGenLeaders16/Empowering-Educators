import { useLocalSearchParams, useNavigation } from 'expo-router';
import { useEffect } from 'react';
import { View } from 'tamagui';
import Pdf from 'react-native-pdf';

const PDFViewer = () => {
  const { pdfUri, title } = useLocalSearchParams();

  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title,
    });
  }, [title]);

  return (
    <View flex={1} bg={'white'}>
      {pdfUri && (
        <Pdf
          trustAllCerts={false}
          source={{ uri: pdfUri as string, cache: true }}
          // style={styles.pdf}
          style={{ flex: 1, backgroundColor: 'white' }}
          onLoadComplete={(numberOfPages, filePath) => {
            console.log(`number of pages: ${numberOfPages}`);
          }}
        />
      )}
    </View>
  );
};

export default PDFViewer;
