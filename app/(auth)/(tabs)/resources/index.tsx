import { AntDesign } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Touchable, TouchableOpacity } from 'react-native';
import { Text, View } from 'tamagui';
import useUserStore from '~/stores/useUser';
import { Button } from '~/tamagui.config';
import { Resources } from '~/types';
import { supabase } from '~/utils/supabase';

export default function ResourcesPage() {
  const { user } = useUserStore();

  const [resources, setResources] = useState<Resources[] | []>([]);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchResources = async (isRefreshing = false) => {
    if (isRefreshing) {
      setPage(0); // Reset page if refreshing
    }

    setLoading(true); // Show loading indicator

    const { data, error } = await supabase
      .from('resources')
      .select('*')
      .order('created_at', { ascending: false })
      .range(page * 10, (page + 1) * 10 - 1); // Fetch 10 items per page

    setLoading(false);
    if (error) {
      console.error(error);
      return;
    }

    const uniqueResources = data.filter(
      (newItem) => !resources.some((existingItem) => existingItem.id === newItem.id)
    );

    if (isRefreshing) {
      setResources(uniqueResources); // Set new data when refreshing
    } else {
      setResources((prevResources) => [...prevResources, ...uniqueResources]); // Append unique data when loading more
    }
  };

  const handleLoadMore = () => {
    if (!loading) {
      setPage((prevPage) => prevPage + 1);
      fetchResources();
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchResources(true);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const RenderItem = ({ item }: { item: Resources }) => {
    return (
      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: '/(auth)/(tabs)/resources/[id]',
            params: { id: item.id },
          })
        }>
        <View
          bg={'white'}
          w="100%"
          borderRadius={10}
          px="$3"
          py="$4"
          mb="$4"
          shadowColor={'#efefef'}
          shadowOffset={{ width: 0, height: 3 }}
          shadowOpacity={0.29}
          shadowRadius={4.6}
          borderWidth={0.5}
          borderColor={'#e5e5e5'}
          style={{
            elevation: 7,
          }}>
          <Image
            source={{ uri: item?.thumbnail_url! }}
            style={{ width: '100%', height: 160, borderRadius: 5 }}
            // key={item.thumbnail_url}
          />
          <Text fontSize={20} fontFamily={'$body'} fontWeight={'700'} mt="$2">
            {item?.title}
          </Text>
          <Text fontSize={14} fontFamily={'$body'} mt="$1.5">
            {item?.description}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View flex={1} bg={'$white'} px="$5">
      <Text mt="$5" fontSize={28} fontFamily={'$heading'} fontWeight={'700'}>
        Resources to inspire you
      </Text>
      {user?.role === 'coach' && (
        <Button
          borderRadius={'$2'}
          mt="$4"
          onPress={() => router.push('/(auth)/(tabs)/resources/addResource')}>
          <AntDesign name="file1" size={24} color={'black'} />
          <Text fontFamily={'$body'} fontSize={18} fontWeight={'600'}>
            Add Resource
          </Text>
        </Button>
      )}

      <FlatList
        data={resources}
        renderItem={({ item }) => <RenderItem item={item} />}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20, paddingTop: 20 }}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.3}
        showsVerticalScrollIndicator={false}
        // initialNumToRender={3}
        onRefresh={onRefresh}
        refreshing={refreshing}
        ListEmptyComponent={
          <View flex={1} ai={'center'} jc={'center'}>
            <Text fontFamily={'$body'} fontSize={18} fontWeight={'600'}>
              No resources found
            </Text>
          </View>
        }
      />
    </View>
  );
}
