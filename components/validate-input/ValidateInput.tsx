import React from 'react';
import { Controller } from 'react-hook-form';
import { Input, InputProps, Text, YStack } from 'tamagui';

interface ValidateInputProps extends InputProps {
  name: string;
  control: any;
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  rules?: object;
}

const ValidateInput: React.FC<ValidateInputProps> = ({
  name,
  control,
  label,
  placeholder,
  secureTextEntry = false,
  rules = {},
  ...props
}) => {
  return (
    <YStack space="$2">
      {label && <Text fontFamily="$body">{label}</Text>}
      <Controller
        control={control}
        render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
          <>
            <Input
              onBlur={onBlur}
              onChangeText={onChange}
              value={value}
              placeholder={placeholder}
              secureTextEntry={secureTextEntry}
              borderColor={error ? 'red' : '#ccc'}
              borderWidth={1}
              paddingHorizontal="$3"
              paddingVertical="$2"
              fontFamily="$body"
              {...props}
            />
            {error && (
              <Text mt="$1" color="red">
                {error.message}
              </Text>
            )}
          </>
        )}
        name={name}
        rules={rules}
      />
    </YStack>
  );
};

export default ValidateInput;
