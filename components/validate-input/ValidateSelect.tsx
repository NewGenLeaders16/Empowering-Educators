import { AntDesign } from '@expo/vector-icons';
import React from 'react';

import type { FontSizeTokens, SelectProps } from 'tamagui';

import { Adapt, Label, Select, Sheet, View, XStack, YStack, getFontSize } from 'tamagui';

import { LinearGradient } from 'tamagui/linear-gradient';
import { Picker } from '@react-native-picker/picker';

interface ValidateSelectProps extends SelectProps {
  items: { name: string; value: string }[];
  label: string;
  selectedCategory: string;
  setSelectedCategory: (category: string) => void;
}

export function ValidateSelect({
  items,
  label,
  selectedCategory,
  setSelectedCategory,
}: ValidateSelectProps) {
  return (
    <YStack space="$2">
      <Label fontFamily={'$body'} fontWeight={'500'}>
        {label}
      </Label>

      <View
        borderColor={'#ccc'}
        borderWidth={1}
        paddingHorizontal="$0"
        borderRadius={8}
        paddingVertical="$-1.5">
        <Picker
          selectedValue={selectedCategory}
          style={{ transform: [{ scaleY: 0.9 }] }}
          itemStyle={{ fontFamily: 'Urbanist-Bold', fontSize: 16 }}
          onValueChange={(itemValue, itemIndex) => setSelectedCategory(itemValue)}>
          {items.map((item) => (
            <Picker.Item key={item.value} label={item.name} value={item.value} />
          ))}
        </Picker>
      </View>

      {/* <SelectDropdown
        id="select-demo-1"
        items={items}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
      /> */}
    </YStack>
  );
}

export function SelectDropdown(props: Omit<ValidateSelectProps, 'label'>) {
  return (
    <Select
      value={props.selectedCategory}
      onValueChange={props.setSelectedCategory}
      disablePreventBodyScroll
      {...props}>
      <Select.Trigger width={'100%'} iconAfter={<AntDesign name="arrowdown" size={18} />}>
        <Select.Value placeholder="Something" color={'$black'} />
      </Select.Trigger>
      <Adapt when="sm" platform="touch">
        <Sheet
          native={!!props.native}
          modal
          dismissOnSnapToBottom
          //   animationConfig={{
          //     type: 'spring',
          //     damping: 20,
          //     mass: 1.2,
          //     stiffness: 250,
          //   }}
        >
          <Sheet.Frame>
            <Sheet.ScrollView>
              <Adapt.Contents />
            </Sheet.ScrollView>
          </Sheet.Frame>

          <Sheet.Overlay />
        </Sheet>
      </Adapt>
      <Select.Content zIndex={200000}>
        <Select.ScrollUpButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3">
          <YStack zIndex={10}>
            <AntDesign name="check" />
          </YStack>

          <LinearGradient
            start={[0, 0]}
            end={[0, 1]}
            fullscreen
            colors={['$primary_yellow', '$black']}
            borderRadius="$4"
          />
        </Select.ScrollUpButton>
        <Select.Viewport
          // to do animations:
          // animation="quick"
          // animateOnly={['transform', 'opacity']}
          // enterStyle={{ o: 0, y: -10 }}
          // exitStyle={{ o: 0, y: 10 }}
          minWidth={200}>
          <Select.Group>
            <Select.Label>Categories</Select.Label>

            {/* for longer lists memoizing these is useful */}

            {React.useMemo(
              () =>
                props.items.map((item, i) => {
                  return (
                    <Select.Item index={i} key={item.name} value={item.value}>
                      <Select.ItemText>{item.name}</Select.ItemText>

                      <Select.ItemIndicator marginLeft="auto">
                        <AntDesign name="check" />
                      </Select.ItemIndicator>
                    </Select.Item>
                  );
                }),

              [props.items]
            )}
          </Select.Group>
        </Select.Viewport>
        <Select.ScrollDownButton
          alignItems="center"
          justifyContent="center"
          position="relative"
          width="100%"
          height="$3">
          <YStack zIndex={10}>
            <AntDesign name="check" />
          </YStack>

          <LinearGradient
            start={[0, 0]}
            end={[0, 1]}
            fullscreen
            colors={['$black', '$primary_yellow']}
            borderRadius="$4"
          />
        </Select.ScrollDownButton>
      </Select.Content>
    </Select>
  );
}
