
import {
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import {
  TabList,
  Tabs,
  TabSlot,
  TabTrigger,
} from 'expo-router/ui';

import { Colors } from '@/constants/theme';

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Tabs>
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        {/* CONTENIDO DE LA PESTAÑA */}
        <View style={styles.content}>
          <TabSlot />
        </View>

        {/* MENÚ INFERIOR */}
        <TabList
          style={[
            styles.tabBar,
            {
              backgroundColor: colors.backgroundElement,
            },
          ]}
        >
          <TabTrigger
            name="index"
            href="/"
            style={styles.tab}
          >
            <Ionicons
              name="home-outline"
              size={22}
              color={colors.text}
            />
            <Text
              style={[
                styles.label,
                { color: colors.text },
              ]}
            >
              Home
            </Text>
          </TabTrigger>

          <TabTrigger
            name="explore"
            href="/explore"
            style={styles.tab}
          >
            <Ionicons
              name="compass-outline"
              size={22}
              color={colors.text}
            />
            <Text
              style={[
                styles.label,
                { color: colors.text },
              ]}
            >
              Explore
            </Text>
          </TabTrigger>
        </TabList>
      </View>
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    minHeight: 0,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    gap: 12,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    gap: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
});
