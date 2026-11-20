
import { useState } from 'react';

import {
    FlatList,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';

export interface SelectOption<T extends string = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

interface AppSelectProps<T extends string> {
  label?: string;
  value: T | null;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

export function AppSelect<T extends string>({
  label,
  value,
  options,
  onChange,
  placeholder = 'Seleccione una opción',
  error,
  required = false,
  disabled = false,
}: AppSelectProps<T>) {
  const { colors } = useAppTheme();
  const [open, setOpen] = useState(false);

  const selected = options.find(
    (option) => option.value === value
  );

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>
          {label}
          {required && (
            <Text style={{ color: colors.danger }}> *</Text>
          )}
        </Text>
      )}

      <Pressable
        onPress={() => setOpen(true)}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityLabel={label ?? placeholder}
        accessibilityState={{ disabled }}
        style={[
          styles.field,
          {
            backgroundColor: colors.input,
            borderColor: error ? colors.danger : colors.border,
            opacity: disabled ? 0.55 : 1,
          },
        ]}
      >
        <Text
          style={{
            flex: 1,
            fontSize: 15,
            color: selected ? colors.text : colors.placeholder,
          }}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder}
        </Text>

        <Ionicons
          name="chevron-down-outline"
          size={20}
          color={colors.textSecondary}
        />
      </Pressable>

      {!!error && (
        <Text style={{ color: colors.danger, fontSize: 12 }}>
          {error}
        </Text>
      )}

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <View
          style={[
            styles.overlay,
            { backgroundColor: colors.overlay },
          ]}
        >
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setOpen(false)}
          />

          <View
            style={[
              styles.dialog,
              { backgroundColor: colors.card },
            ]}
          >
            <View style={styles.heading}>
              <Text
                style={{
                  flex: 1,
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.text,
                }}
              >
                {label ?? 'Seleccionar'}
              </Text>

              <Pressable
                onPress={() => setOpen(false)}
                accessibilityLabel="Cerrar selector"
              >
                <Ionicons
                  name="close-outline"
                  size={25}
                  color={colors.text}
                />
              </Pressable>
            </View>

            <FlatList
              data={options}
              keyExtractor={(item) => item.value}
              style={{ maxHeight: 360 }}
              ListEmptyComponent={
                <Text style={{ color: colors.textSecondary }}>
                  No hay opciones disponibles.
                </Text>
              }
              renderItem={({ item }) => (
                <Pressable
                  disabled={item.disabled}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={[
                    styles.option,
                    {
                      borderBottomColor: colors.border,
                      opacity: item.disabled ? 0.45 : 1,
                    },
                  ]}
                >
                  <Text
                    style={{
                      flex: 1,
                      color: colors.text,
                      fontSize: 15,
                    }}
                  >
                    {item.label}
                  </Text>

                  {item.value === value && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
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
    borderWidth: 1,
    borderRadius: 11,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialog: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '75%',
    borderRadius: 16,
    padding: 20,
  },
  heading: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    gap: 10,
  },
});
