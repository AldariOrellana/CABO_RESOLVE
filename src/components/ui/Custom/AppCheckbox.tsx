import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface AppCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
}

export function AppCheckbox({
  label,
  checked,
  onChange,
  disabled = false,
  hint,
}: AppCheckboxProps) {
  const { colors } = useAppTheme();

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={label}
      accessibilityState={{ checked, disabled }}
      disabled={disabled}
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [styles.row, { opacity: disabled ? 0.55 : pressed ? 0.75 : 1 }]}
    >
      <View
        style={[
          styles.box,
          {
            borderColor: checked ? colors.primary : colors.border,
            backgroundColor: checked ? colors.primary : colors.input,
          },
        ]}
      >
        {checked && <Ionicons name="checkmark" size={16} color={colors.onPrimary} />}
      </View>
      <View style={styles.text}>
        <Text style={{ color: colors.text }}>{label}</Text>
        {hint && <Text style={[styles.hint, { color: colors.textSecondary }]}>{hint}</Text>}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 12 },
  box: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { flex: 1, gap: 2 },
  hint: { fontSize: 12 },
});
