
import {
    ActivityIndicator,
    Pressable,
    StyleSheet,
    Text,
    View,
    type StyleProp,
    type ViewStyle,
} from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { Ionicons } from '@expo/vector-icons';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'outline'
  | 'ghost';

export type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}

export function AppButton({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = true,
  icon,
  style,
}: AppButtonProps) {
  const { colors } = useAppTheme();

  const background = {
    primary: colors.primary,
    secondary: colors.secondary,
    success: colors.success,
    danger: colors.danger,
    warning: colors.warning,
    outline: 'transparent',
    ghost: 'transparent',
  }[variant];

  const textColor =
    variant === 'secondary'
      ? colors.onSecondary
      : variant === 'outline' || variant === 'ghost'
        ? colors.primary
        : colors.onPrimary;

  const heights = { sm: 38, md: 48, lg: 56 };
  const fontSizes = { sm: 13, md: 15, lg: 17 };

  const inactive = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{
        disabled: inactive,
        busy: loading,
      }}
      style={({ pressed }) => [
        styles.button,
        {
          minHeight: heights[size],
          backgroundColor: background,
          borderColor:
            variant === 'outline'
              ? colors.border
              : 'transparent',
          opacity: inactive ? 0.5 : pressed ? 0.82 : 1,
          alignSelf: fullWidth ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <View style={styles.content}>
          {icon && (
            <Ionicons
              name={icon}
              size={size === 'lg' ? 21 : 18}
              color={textColor}
            />
          )}

          <Text
            style={{
              color: textColor,
              fontSize: fontSizes[size],
              fontWeight: '600',
            }}
          >
            {title}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 11,
    borderWidth: 1,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
  },
});
