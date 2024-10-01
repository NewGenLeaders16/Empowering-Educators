// UsersScreen.js
import React, { useState, useEffect } from 'react';
import {
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Input, YStack, View, Text, XStack, Circle, Separator } from 'tamagui';
import { supabase } from '~/utils/supabase';
import { User } from '~/types';
import { AntDesign } from '@expo/vector-icons';
import colors from '~/constants/colors';
import { useAppContext } from '~/context/ChatContext';
import { useNavigation } from 'expo-router';

const ResourceUsers: React.FC = ({}) => {
  const [users, setUsers] = useState<User[] | []>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[] | []>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const { selectedIds, setSelectedIds } = useAppContext();

  const navigation = useNavigation();

  useEffect(() => {
    if (!users) return;

    const selectedUsersLength = selectedIds.size;
    navigation.setOptions({
      title:
        selectedIds?.size > 0
          ? `${selectedUsersLength} ${selectedUsersLength > 1 ? 'Users' : 'User'} Selected`
          : 'No Users Selected (public)',
    });
  }, [selectedIds]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [searchTerm, users]);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('users').select('*').eq('role', 'teacher');
    if (error) {
      console.error(error);
      setLoading(false);
    } else {
      setUsers(data);
      setLoading(false);
    }
  };

  const filterUsers = () => {
    const term = searchTerm.toLowerCase();
    const filtered = users.filter(
      (user) =>
        user?.name?.toLowerCase().includes(term) || user?.email?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleSelect = (id: string) => {
    setSelectedIds((prev: any) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const renderItem = ({ item }: { item: any }) => {
    const isSelected = selectedIds.has(item.id);
    return (
      <>
        <TouchableOpacity onPress={() => handleSelect(item.id)}>
          <XStack ai={'center'} jc={'space-between'} pl="$5" pr="$8" py="$1">
            <XStack w={'100%'} space="$2.5" ai={'center'} py="$3">
              <Circle bg={'$primary_blue'} size={40}>
                {item?.image_url ? (
                  <Image
                    source={{ uri: item?.image_url }}
                    style={{ width: 40, height: 40, borderRadius: 100 }}
                  />
                ) : (
                  <Text fontSize={16} ff={'$body'} color={'white'}>
                    {item?.name?.slice(0, 1).toUpperCase()}
                  </Text>
                )}
              </Circle>
              <View>
                <Text fontSize={16} fontWeight={'500'}>
                  {item?.name}
                </Text>
                <Text fs={12} ml={'$1'}>
                  {item?.email}
                </Text>
              </View>
            </XStack>
            {isSelected && (
              <AntDesign name="checkcircle" size={20} color={colors.light.primary_blue} />
            )}
          </XStack>
        </TouchableOpacity>
        <Separator bg={'$primary_grey'} borderColor={'$primary_grey'} />
      </>
    );
  };

  return (
    <>
      {loading ? (
        <View flex={1} bg="white" py="$5" ai={'center'} jc={'center'}>
          <ActivityIndicator size="large" color={colors.light.primary_blue} />
        </View>
      ) : (
        <View flex={1} bg="white" py="$5">
          <View px="$5">
            <Input
              placeholder="Search by name or email"
              value={searchTerm}
              onChangeText={setSearchTerm}
              borderWidth={1}
              borderColor={'$primary_grey'}
              mb="$3"
            />
          </View>
          <FlatList
            data={filteredUsers}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // padding: 16,
  },
  searchBar: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  item: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  email: {
    fontSize: 14,
    color: 'gray',
  },
});

export default ResourceUsers;
