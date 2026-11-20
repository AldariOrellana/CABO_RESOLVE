
import {
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';

import type { ThemeMode } from '@/constants/app-theme';
import { useAppTheme } from '@/hooks/useAppTheme';

const options = [
  {
    value: 'system',
    label: 'Sistema',
    icon: 'phone-portrait-outline',
  },
  {
    value: 'light',
    label: 'Claro',
    icon: 'sunny-outline',
  },
  {
    value: 'dark',
    label: 'Oscuro',
    icon: 'moon-outline',
  },
] as const satisfies ReadonlyArray<{
  value: ThemeMode;
  label: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}>;

export function AppThemeSelector() {
  const { mode, setMode, colors } = useAppTheme();

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = mode === option.value;

        return (
          <Pressable
            key={option.value}
            onPress={() => setMode(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={[
              styles.option,
              {
                backgroundColor: active
                  ? colors.primary
                  : colors.input,
                borderColor: active
                  ? colors.primary
                  : colors.border,
              },
            ]}
          >
            <Ionicons
              name={option.icon}
              size={19}
              color={
                active ? colors.onPrimary : colors.textSecondary
              }
            />

            <Text
              style={{
                color: active
                  ? colors.onPrimary
                  : colors.text,
                fontWeight: active ? '700' : '500',
                fontSize: 13,
              }}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: 8,
    width: '100%',
  },
  option: {
    flex: 1,
    minHeight: 52,
    borderRadius: 11,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 5,
  },
});
