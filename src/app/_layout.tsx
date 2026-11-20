// import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
// import * as SplashScreen from 'expo-splash-screen';
// import { useColorScheme } from 'react-native';

// import { AnimatedSplashOverlay } from '@/components/animated-icon';
// import AppTabs from '@/components/app-tabs';

// SplashScreen.preventAutoHideAsync();

// export default function TabLayout() {
//   const colorScheme = useColorScheme();
//   return (
//     <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
//       <AnimatedSplashOverlay />
//       <AppTabs />
//     </ThemeProvider>
//   );
// }



import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from 'expo-router';

import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

import {
  AppThemeProvider,
  useAppTheme,
} from '@/contexts/AppThemeContext';

SplashScreen.preventAutoHideAsync();

// function AppNavigator() {
//   const { isAuthenticated } = useAuth();

//   return (
//     <Stack screenOptions={{ headerShown: false }}>
//       {/* Rutas públicas: Login */}
//       <Stack.Protected guard={!isAuthenticated}>
//         <Stack.Screen name="(auth)" />
//       </Stack.Protected>

//       {/* Rutas privadas: Dashboard y pestañas */}
//       <Stack.Protected guard={isAuthenticated}>
//         <Stack.Screen name="(tabs)" />
//       </Stack.Protected>
//     </Stack>
//   );
// }

function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <Stack screenOptions={{ headerShown: false }}>

      {/* Login: disponible sin sesión */}
      <Stack.Protected
        guard={!isAuthenticated}
        redirectTo="/"
      >
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      {/* Pantallas privadas */}
      <Stack.Protected
        guard={isAuthenticated}
        redirectTo="/login"
      >
        <Stack.Screen name="(tabs)" />
      </Stack.Protected>

    </Stack>
  );
}

function AppContent() {
  const { resolvedTheme } = useAppTheme();

  return (
    <ThemeProvider
      value={
        resolvedTheme === 'dark'
          ? DarkTheme
          : DefaultTheme
      }
    >
      <AuthProvider>
        <AnimatedSplashOverlay />
        <AppNavigator />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AppThemeProvider>
      <AppContent />
    </AppThemeProvider>
  );
}
