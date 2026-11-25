import { useState, type ComponentPropsWithRef } from 'react';

import { Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface AppInputProps extends TextInputProps {
  inputRef?: ComponentPropsWithRef<typeof TextInput>['ref'];
  label?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  leftIcon?: IconName;
  isPassword?: boolean;
}

export function AppInput({
  inputRef,
  label,
  error,
  hint,
  required = false,
  leftIcon,
  isPassword = false,
  editable = true,
  style,
  secureTextEntry,
  ...props
}: AppInputProps) {
  const { colors } = useAppTheme();
  const [visible, setVisible] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && <Text style={{ color: colors.danger }}> *</Text>}
        </Text>
      )}

      <View
        style={[
          styles.field,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.danger : focused ? colors.primary : colors.border,
            opacity: editable ? 1 : 0.55,
          },
        ]}
      >
        {leftIcon && <Ionicons name={leftIcon} size={20} color={colors.textSecondary} />}

        <TextInput
          ref={inputRef}
          {...props}
          editable={editable}
          secureTextEntry={isPassword ? !visible : secureTextEntry}
          style={[styles.input, { color: colors.text }, style]}
          placeholderTextColor={colors.placeholder}
          selectionColor={colors.primary}
          onFocus={(event) => {
            setFocused(true);
            props.onFocus?.(event);
          }}
          onBlur={(event) => {
            setFocused(false);
            props.onBlur?.(event);
          }}
          accessibilityLabel={props.accessibilityLabel ?? label}
        />

        {isPassword && (
          <Pressable
            onPress={() => setVisible((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={visible ? 'Ocultar contraseña' : 'Mostrar contraseña'}
          >
            <Ionicons
              name={visible ? 'eye-outline' : 'eye-off-outline'}
              size={21}
              color={colors.textSecondary}
            />
          </Pressable>
        )}
      </View>

      {!!error && <Text style={[styles.message, { color: colors.danger }]}>{error}</Text>}

      {!error && !!hint && (
        <Text style={[styles.message, { color: colors.textSecondary }]}>{hint}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 7,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  field: {
    minHeight: 52,
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  input: {
    flex: 1,
    minWidth: 0,
    fontSize: 15,
    paddingVertical: 10,
  },
  message: {
    fontSize: 12,
    lineHeight: 18,
  },
});
