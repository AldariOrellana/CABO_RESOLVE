
import { useState, type ReactNode } from 'react';

import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';

import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ExternalLink } from '@/components/external-link';
import { WebBadge } from '@/components/web-badge';
import {
  BottomTabInset,
  MaxContentWidth,
  Spacing,
} from '@/constants/theme';
import { useAppTheme } from '@/hooks/useAppTheme';

type ThemeColors = ReturnType<typeof useAppTheme>['colors'];

interface SectionProps {
  title: string;
  children: ReactNode;
  colors: ThemeColors;
}

function ExpandableSection({
  title,
  children,
  colors,
}: SectionProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Pressable
        onPress={() => setExpanded((previous) => !previous)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={({ pressed }) => [
          styles.sectionHeader,
          { opacity: pressed ? 0.75 : 1 },
        ]}
      >
        <Text
          style={[
            styles.sectionTitle,
            { color: colors.text },
          ]}
        >
          {title}
        </Text>

        <Ionicons
          name={expanded ? 'chevron-up' : 'chevron-down'}
          size={20}
          color={colors.primary}
        />
      </Pressable>

      {expanded && (
        <View
          style={[
            styles.sectionContent,
            { borderTopColor: colors.border },
          ]}
        >
          {children}
        </View>
      )}
    </View>
  );
}

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const { colors } = useAppTheme();

  const insets = {
    ...safeAreaInsets,
    bottom:
      safeAreaInsets.bottom +
      BottomTabInset +
      Spacing.three,
  };

  const contentPlatformStyle = Platform.select({
    android: {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      paddingBottom: insets.bottom,
    },
    ios: {
      paddingTop: Spacing.six,
      paddingBottom: insets.bottom,
    },
    web: {
      paddingTop: Spacing.six,
      paddingBottom: Spacing.four,
    },
  });

  const texto = {
    color: colors.textSecondary,
  };

  const codigo = {
    color: colors.primary,
    fontWeight: '600' as const,
  };

  return (
    <ScrollView
      style={[
        styles.scrollView,
        { backgroundColor: colors.background },
      ]}
      contentInset={
        Platform.OS === 'ios'
          ? insets
          : undefined
      }
      contentContainerStyle={[
        styles.contentContainer,
        contentPlatformStyle,
      ]}
      showsVerticalScrollIndicator={false}
    >
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background },
        ]}
      >
        <View style={styles.titleContainer}>
          <Text
            style={[
              styles.title,
              { color: colors.text },
            ]}
          >
            Explore
          </Text>

          <Text
            style={[
              styles.centerText,
              styles.paragraph,
              texto,
            ]}
          >
            This starter app includes example{'\n'}
            code to help you get started.
          </Text>

          <ExternalLink
            href="https://docs.expo.dev"
            asChild
          >
            <Pressable
              style={({ pressed }) => [
                styles.linkButton,
                {
                  backgroundColor: colors.input,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.link,
                  { color: colors.primary },
                ]}
              >
                Expo documentation
              </Text>

              <Ionicons
                name="open-outline"
                color={colors.primary}
                size={16}
              />
            </Pressable>
          </ExternalLink>
        </View>

        <View style={styles.sectionsWrapper}>
          <ExpandableSection
            title="File-based routing"
            colors={colors}
          >
            <Text style={[styles.paragraph, texto]}>
              This app has two screens:
              {' '}
              <Text style={codigo}>
                src/app/index.tsx
              </Text>
              {' '}
              and
              {' '}
              <Text style={codigo}>
                src/app/explore.tsx
              </Text>.
            </Text>

            <Text style={[styles.paragraph, texto]}>
              The layout file in
              {' '}
              <Text style={codigo}>
                src/app/_layout.tsx
              </Text>
              {' '}
              sets up the tab navigator.
            </Text>

            <ExternalLink href="https://docs.expo.dev/router/introduction">
              <Text
                style={[
                  styles.link,
                  { color: colors.primary },
                ]}
              >
                Learn more
              </Text>
            </ExternalLink>
          </ExpandableSection>

          <ExpandableSection
            title="Android, iOS, and web support"
            colors={colors}
          >
            <Text style={[styles.paragraph, texto]}>
              You can open this project on Android,
              iOS, and the web. To open the web version,
              press
              {' '}
              <Text style={{ fontWeight: '700' }}>
                w
              </Text>
              {' '}
              in the terminal running this project.
            </Text>

            <Image
              source={require('@/assets/images/tutorial-web.png')}
              style={styles.imageTutorial}
              contentFit="contain"
            />
          </ExpandableSection>

          <ExpandableSection
            title="Images"
            colors={colors}
          >
            <Text style={[styles.paragraph, texto]}>
              For static images, you can use the
              {' '}
              <Text style={codigo}>@2x</Text>
              {' '}
              and
              {' '}
              <Text style={codigo}>@3x</Text>
              {' '}
              suffixes to provide files for
              different screen densities.
            </Text>

            <Image
              source={require('@/assets/images/react-logo.png')}
              style={styles.imageReact}
              contentFit="contain"
            />

            <ExternalLink href="https://reactnative.dev/docs/images">
              <Text
                style={[
                  styles.link,
                  { color: colors.primary },
                ]}
              >
                Learn more
              </Text>
            </ExternalLink>
          </ExpandableSection>

          <ExpandableSection
            title="Light and dark mode components"
            colors={colors}
          >
            <Text style={[styles.paragraph, texto]}>
              CABO Resolve supports light and dark themes.
              The selected theme is managed by AppThemeContext
              and persists between sessions.
            </Text>

            <Text style={[styles.paragraph, texto]}>
              You can change the theme from the
              Configuración tab.
            </Text>

            <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
              <Text
                style={[
                  styles.link,
                  { color: colors.primary },
                ]}
              >
                Learn more
              </Text>
            </ExternalLink>
          </ExpandableSection>

          <ExpandableSection
            title="Animations"
            colors={colors}
          >
            <Text style={[styles.paragraph, texto]}>
              This template includes examples of
              animations using the
              {' '}
              <Text style={codigo}>
                react-native-reanimated
              </Text>
              {' '}
              library.
            </Text>
          </ExpandableSection>
        </View>

        {Platform.OS === 'web' && <WebBadge />}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexGrow: 1,
  },
  container: {
    width: '100%',
    maxWidth: MaxContentWidth,
    flexGrow: 1,
  },
  titleContainer: {
    gap: Spacing.three,
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.six,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
  },
  centerText: {
    textAlign: 'center',
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 22,
  },
  linkButton: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.five,
    justifyContent: 'center',
    gap: Spacing.one,
    alignItems: 'center',
  },
  link: {
    fontSize: 14,
    fontWeight: '600',
  },
  sectionsWrapper: {
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.six,
  },
  section: {
    borderWidth: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  sectionContent: {
    borderTopWidth: 1,
    padding: 16,
    gap: 14,
  },
  imageTutorial: {
    width: '100%',
    aspectRatio: 296 / 171,
    borderRadius: Spacing.three,
    marginTop: Spacing.two,
  },
  imageReact: {
    width: 100,
    height: 100,
    alignSelf: 'center',
  },
});
