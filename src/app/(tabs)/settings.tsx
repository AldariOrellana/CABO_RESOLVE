
import { useState } from 'react';

import {
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppThemeSelector } from '@/components/ui/Custom/AppThemeSelector';
import { DesignSystemDemo } from '@/components/ui/DesignSystemDemo';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function SettingsScreen() {
  const { colors, mode, resolvedTheme } = useAppTheme();
  const [mostrarComponentes, setMostrarComponentes] = useState(false);

  const modoActual = {
    system: 'Automático según el dispositivo',
    light: 'Modo claro',
    dark: 'Modo oscuro',
  }[mode];

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
      ]}
      edges={['top', 'left', 'right']}
    >
      {mostrarComponentes ? (
        <View style={styles.demoContainer}>
          <Pressable
            onPress={() => setMostrarComponentes(false)}
            accessibilityRole="button"
            accessibilityLabel="Volver a Configuración"
            style={({ pressed }) => [
              styles.backButton,
              {
                backgroundColor: colors.background,
                borderBottomColor: colors.border,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons
              name="arrow-back-outline"
              size={24}
              color={colors.primary}
            />

            <View style={styles.backTextContainer}>
              <Text
                style={[
                  styles.backTitle,
                  { color: colors.text },
                ]}
              >
                Componentes UI
              </Text>

              <Text
                style={[
                  styles.backSubtitle,
                  { color: colors.textSecondary },
                ]}
              >
                Volver a Configuración
              </Text>
            </View>
          </Pressable>

          <DesignSystemDemo />
        </View>
      ) : (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text
              style={[
                styles.title,
                { color: colors.text },
              ]}
            >
              Configuración
            </Text>

            <Text
              style={[
                styles.description,
                { color: colors.textSecondary },
              ]}
            >
              Personaliza la apariencia y preferencias de CABO Resolve.
            </Text>
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            Apariencia
          </Text>

          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.cardHeading}>
              <View
                style={[
                  styles.iconBox,
                  { backgroundColor: colors.input },
                ]}
              >
                <Ionicons
                  name={
                    resolvedTheme === 'dark'
                      ? 'moon-outline'
                      : 'sunny-outline'
                  }
                  size={22}
                  color={colors.primary}
                />
              </View>

              <View style={styles.headingText}>
                <Text
                  style={[
                    styles.cardTitle,
                    { color: colors.text },
                  ]}
                >
                  Tema de la aplicación
                </Text>

                <Text
                  style={[
                    styles.cardDescription,
                    { color: colors.textSecondary },
                  ]}
                >
                  {modoActual}
                </Text>
              </View>
            </View>

            <AppThemeSelector />

            <Text
              style={[
                styles.note,
                { color: colors.textSecondary },
              ]}
            >
              La preferencia se guarda automáticamente y se mantiene
              cuando vuelves a abrir la aplicación.
            </Text>
          </View>

          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            Desarrollo
          </Text>

          <Pressable
            onPress={() => setMostrarComponentes(true)}
            accessibilityRole="button"
            accessibilityLabel="Abrir catálogo de componentes UI"
            style={({ pressed }) => [
              styles.navigationCard,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
                opacity: pressed ? 0.75 : 1,
              },
            ]}
          >
            <View
              style={[
                styles.iconBox,
                { backgroundColor: colors.input },
              ]}
            >
              <Ionicons
                name="color-palette-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <View style={styles.navigationText}>
              <Text
                style={[
                  styles.cardTitle,
                  { color: colors.text },
                ]}
              >
                Componentes UI
              </Text>

              <Text
                style={[
                  styles.cardDescription,
                  { color: colors.textSecondary },
                ]}
              >
                Prueba botones, campos, selectores y calendarios.
              </Text>
            </View>

            <Ionicons
              name="chevron-forward-outline"
              size={21}
              color={colors.textSecondary}
            />
          </Pressable>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 50,
    gap: 16,
  },
  header: {
    gap: 8,
    marginBottom: 12,
  },
  title: {
    fontSize: 27,
    fontWeight: '700',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  card: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 18,
    gap: 18,
  },
  cardHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingText: {
    flex: 1,
    gap: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 19,
  },
  note: {
    fontSize: 12,
    lineHeight: 19,
  },
  navigationCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  navigationText: {
    flex: 1,
    gap: 4,
  },
  demoContainer: {
    flex: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  backTextContainer: {
    flex: 1,
    gap: 3,
  },
  backTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  backSubtitle: {
    fontSize: 12,
  },
});
