
import {
  Alert,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';

import { BottomTabInset, Spacing } from '@/constants/theme';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';

export default function HomeScreen() {
  const { usuario, logout } = useAuth();
  const { colors, resolvedTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const nombreUsuario = usuario?.nombre || 'Usuario';

  const cerrarSesion = async () => {
    try {
      await logout();
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : 'No fue posible cerrar sesión.';

      if (Platform.OS === 'web') {
        window.alert(mensaje);
      } else {
        Alert.alert('Error al cerrar sesión', mensaje);
      }
    }
  };

  const confirmarCerrarSesion = () => {
    const mensaje = '¿Estás seguro de que deseas cerrar sesión?';

    if (Platform.OS === 'web') {
      if (window.confirm(mensaje)) {
        void cerrarSesion();
      }
      return;
    }

    Alert.alert(
      'Cerrar sesión',
      mensaje,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: () => {
            void cerrarSesion();
          },
        },
      ],
      { cancelable: true }
    );
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background },
      ]}
    >
      <StatusBar
        barStyle={
          resolvedTheme === 'dark'
            ? 'light-content'
            : 'dark-content'
        }
      
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{
          flexGrow: 1,
          paddingBottom:
            insets.bottom + BottomTabInset + Spacing.three,
        }}
        showsVerticalScrollIndicator={false}
      >
        <View
          style={[
            styles.header,
            {
              backgroundColor: colors.primary,
              paddingTop: insets.top + 20,
            },
          ]}
        >
          <View style={styles.headerContent}>
            <View style={styles.userRow}>
              <View style={styles.userInfo}>
                <Text style={styles.brand}>
                  CABO RESOLVE
                </Text>

                <Text
                  style={styles.userName}
                  numberOfLines={2}
                >
                  Hola, {nombreUsuario}
                </Text>

                <Text style={styles.welcomeText}>
                  Bienvenido de nuevo
                </Text>
              </View>

              <View style={styles.avatar}>
                <Ionicons
                  name="person-outline"
                  size={27}
                  color="#FFFFFF"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.logoutButton}
              onPress={confirmarCerrarSesion}
              activeOpacity={0.75}
              accessibilityRole="button"
              accessibilityLabel="Cerrar sesión"
            >
              <Ionicons
                name="log-out-outline"
                size={19}
                color="#FFFFFF"
              />

              <Text style={styles.logoutText}>
                Cerrar sesión
              </Text>
            </TouchableOpacity>
          </View>

          <Svg
            width="100%"
            height={55}
            viewBox="0 0 400 55"
            preserveAspectRatio="none"
            style={styles.wave}
          >
            <Path
              d="
                M0 14
                C80 14 105 52 190 24
                C265 -4 325 10 400 20
                L400 55
                L0 55
                Z
              "
              fill={colors.background}
            />
          </Svg>
        </View>

        <View
          style={[
            styles.content,
            { backgroundColor: colors.background },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text },
            ]}
          >
            Panel principal
          </Text>

          <Text
            style={[
              styles.description,
              { color: colors.textSecondary },
            ]}
          >
            Bienvenido a CABO Resolve.
            Aquí podrás consultar tus actividades
            y gestionar tus operaciones.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  header: {
    minHeight: 255,
    paddingBottom: 65,
    position: 'relative',
  },
  headerContent: {
    paddingHorizontal: 25,
    zIndex: 1,
  },
  brand: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    color: '#C6D9FF',
    marginBottom: 12,
  },
  userRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  welcomeText: {
    fontSize: 14,
    color: '#D7E4FF',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 22,
    marginTop: 24,
  },
  logoutText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  wave: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 25,
    paddingBottom: 30,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    fontSize: 14,
    lineHeight: 23,
  },
});
