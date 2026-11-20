
import { View } from 'react-native';

import { DesignSystemDemo } from '@/components/ui/DesignSystemDemo';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function DesignSystemScreen() {
  const { colors } = useAppTheme();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
      }}
    >
      <DesignSystemDemo />
    </View>
  );
}
