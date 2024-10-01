import { AntDesign } from '@expo/vector-icons';
import { useState } from 'react';
import { set, SubmitHandler, useForm } from 'react-hook-form';
import { ActivityIndicator, Alert, Image, TouchableOpacity } from 'react-native';
import { Label, ScrollView, Square, Text, View, YStack } from 'tamagui';
import ValidateInput from '~/components/validate-input/ValidateInput';
import { ValidateSelect } from '~/components/validate-input/ValidateSelect';
import ValidateTextArea from '~/components/validate-input/ValidateTextArea';
import useUserStore from '~/stores/useUser';
import { Button } from '~/tamagui.config';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as FilePicker from 'expo-file-system';
import { supabase } from '~/utils/supabase';
import { decode } from 'base64-arraybuffer';
import { router } from 'expo-router';
import colors from '~/constants/colors';
import { useAppContext } from '~/context/ChatContext';

interface FormValues {
  title: string;
  description: string;
  mainGoal: string;
  topicsCovered: string;
}

export default function AddResource() {
  const { user } = useUserStore();

  const { control, handleSubmit } = useForm<FormValues>();

  const [selectedCategory, setSelectedCategory] = useState('video');

  const [uploadedDocument, setUploadedDocument] = useState<any>(null);
  const [uploadedThumbnail, setUploadedThumbnail] = useState<any>(null);

  const [loading, setLoading] = useState(false);

  const { selectedIds } = useAppContext();

  const onSubmit: SubmitHandler<FormValues> = (data) => {
    console.log(data, 'Data');
  };

  const uploadDocument = async () => {
    let result: any;

    if (selectedCategory === 'pdf' || selectedCategory === 'podcast') {
      result = await DocumentPicker.getDocumentAsync({
        type: selectedCategory === 'podcast' ? 'audio/*' : 'application/pdf',
        copyToCacheDirectory: true,
      });
    } else {
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 0.7,
      });
    }

    if (!result.canceled) {
      setUploadedDocument(result.assets[0]);
      console.log(result, 'Result');
    }
  };

  const uploadImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setUploadedThumbnail(result.assets[0]);
      console.log(result, 'Result');
    }
  };

  const createResource: SubmitHandler<FormValues> = async (formData) => {
    try {
      if (!uploadedDocument || !uploadedThumbnail) {
        return alert('Please upload a document and thumbnail');
      }

      const thumbnailContentType = uploadedThumbnail.mimeType;
      const documentContentType = uploadedDocument.mimeType;

      const thumbnailExtension = thumbnailContentType.split('/')[1];
      const splittedDocumentMimeType = documentContentType.split('/')[1];
      const documentExtension =
        splittedDocumentMimeType === 'quicktime'
          ? '.mov'
          : splittedDocumentMimeType === 'mpeg'
            ? '.mp3'
            : splittedDocumentMimeType === 'vnd.wave'
              ? '.wav'
              : splittedDocumentMimeType === 'pdf'
                ? '.pdf'
                : '.mp4';

      console.log(documentExtension, 'DocumentExtension', thumbnailExtension, 'ThumbnailExtension');

      if (
        !['.mp4', '.mov', '.pdf', '.mp3', '.wav'].includes(documentExtension) ||
        !['png', 'jpg', 'jpeg'].includes(thumbnailExtension)
      ) {
        return Alert.alert('Invalid file type', 'Please upload a valid file type');
      }

      setLoading(true);

      const thumbnailFilePath = `${user?.id}/thumbnail/${new Date().getTime()}.${thumbnailExtension}`;
      const documentFilePath = `${user?.id}/document/${new Date().getTime()}${documentExtension}`;

      const documentFile = await FilePicker.readAsStringAsync(uploadedDocument.uri, {
        encoding: 'base64',
      });
      const thumbnailFile = await FilePicker.readAsStringAsync(uploadedThumbnail.uri, {
        encoding: 'base64',
      });

      const { data: documentData, error: documentError } = await supabase.storage
        .from('resources')
        .upload(documentFilePath, decode(documentFile), { contentType: documentContentType });

      const { data: thumbnailData, error: thumbnailError } = await supabase.storage
        .from('resources')
        .upload(thumbnailFilePath, decode(thumbnailFile), { contentType: thumbnailContentType });

      if (documentError || thumbnailError) {
        throw new Error('Error uploading file');
      }

      const { data: docFileUrl } = await supabase.storage
        .from('resources')
        .getPublicUrl(documentData?.path);
      const { data: thumbnailFileUrl } = await supabase.storage
        .from('resources')
        .getPublicUrl(thumbnailData?.path);

      const selectedUsers = Array.from(selectedIds);

      const uploadObject = {
        title: formData.title,
        description: formData.description,
        main_goal: formData.mainGoal,
        topics_covered: formData.topicsCovered,
        category: selectedCategory,
        thumbnail_url: thumbnailFileUrl?.publicUrl,
        file_url: docFileUrl?.publicUrl,
        creator_id: user?.id,
      };

      if (selectedUsers.length === 0) {
        const { error } = await supabase.from('resources').insert(uploadObject);

        if (error) {
          throw error;
        }
      } else {
        const { error } = await supabase.from('resources').insert(
          selectedUsers.map((id) => ({
            ...uploadObject,
            teacher_id: id as string,
          }))
        );

        if (error) {
          throw error;
        }
      }

      router.back();
    } catch (error) {
      console.log(error, 'Error');
      Alert.alert('Error', 'An error occurred while creating resource');
    } finally {
      setLoading(false);
    }
  };

  console.log(Array.from(selectedIds), 'SelectedIds');

  return (
    <ScrollView flex={1} bg={'$white'} px="$5" contentContainerStyle={{ paddingBottom: 10 }}>
      <Text mt="$5" fontSize={28} fontFamily={'$heading'} fontWeight={'700'}>
        Add New Resource
      </Text>

      <YStack space="$2" mt="$4">
        <ValidateInput label="Title" name="title" control={control} placeholder="Enter Title..." />
        <ValidateSelect
          label="Category"
          items={[
            { name: 'Video', value: 'video' },
            { name: 'Podcast', value: 'podcast' },
            { name: 'PDF', value: 'pdf' },
          ]}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />
        <YStack space="$2">
          <Label fontWeight={'500'}>Thumbnail</Label>
          <TouchableOpacity onPress={uploadImage}>
            <View
              w={'100%'}
              h={150}
              borderWidth={1}
              borderColor={'$primary_grey'}
              borderRadius={'$2'}
              dsp={'flex'}
              ai={'center'}
              jc={'center'}>
              {uploadedThumbnail ? (
                <Image
                  source={{ uri: uploadedThumbnail.uri }}
                  style={{ width: '100%', height: '100%', resizeMode: 'cover' }}
                />
              ) : (
                <Text color={'$primary_blue'} fontFamily={'$body'} fontWeight={'700'} fs={26}>
                  Choose Photo
                </Text>
              )}
            </View>
          </TouchableOpacity>
        </YStack>
        <YStack space="$2">
          <Label fontWeight={'500'}>
            {selectedCategory === 'video'
              ? 'Video (.mp4)'
              : selectedCategory === 'podcast'
                ? 'Podcast (.mp3, .wav)'
                : 'PDF (.pdf)'}
          </Label>
          <TouchableOpacity onPress={uploadDocument}>
            <View
              w={'100%'}
              h={75}
              borderWidth={1}
              borderColor={'$primary_grey'}
              borderRadius={'$2'}
              dsp={'flex'}
              ai={'center'}
              jc={'center'}>
              <Text color={'$primary_blue'} fontFamily={'$body'} fontWeight={'700'} fs={26}>
                {uploadedDocument
                  ? uploadedDocument?.name
                  : selectedCategory === 'video'
                    ? 'Choose Video'
                    : selectedCategory === 'podcast'
                      ? 'Choose Podcast'
                      : 'Choose File'}
              </Text>
            </View>
          </TouchableOpacity>
        </YStack>
        <ValidateTextArea
          label="Description"
          name="description"
          control={control}
          placeholder="Enter Description..."
          minHeight={120}
        />
        <ValidateInput
          label="Main Goal"
          name="mainGoal"
          control={control}
          placeholder="Enter Main Goal..."
        />
        <ValidateInput
          label="Topics Covered"
          name="topicsCovered"
          control={control}
          placeholder="Enter Topics Covered..."
        />

        <YStack space="$2">
          <Text fontFamily="$body">Select Users For this resource</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/(tabs)/resources/resourceUsers')}>
            <View
              ai={'center'}
              jc={'space-between'}
              flexDirection="row"
              borderWidth={1}
              borderColor={'#ccc'}
              paddingHorizontal="$3"
              paddingVertical="$3"
              borderRadius={'$5'}>
              <Text fontFamily="$body">
                {selectedIds?.size > 0
                  ? `${selectedIds?.size} ${selectedIds?.size > 1 ? 'Users' : 'User'} Selected`
                  : 'Select Users'}
              </Text>
              <AntDesign name="arrowright" />
            </View>
          </TouchableOpacity>
        </YStack>

        <Button onPress={handleSubmit(createResource)} mt="$3" disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.light.primary_blue} size={'small'} />
          ) : (
            <Text fontSize={18} fontWeight={'600'} ff={'$body'}>
              Create Resource
            </Text>
          )}
        </Button>
      </YStack>
    </ScrollView>
  );
}
