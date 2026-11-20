
import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from 'react';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

import {
    AppColors,
    type AppThemeColors,
    type ResolvedTheme,
    type ThemeMode,
} from '@/constants/app-theme';

const STORAGE_KEY = '@cabo-resolve/theme';

interface AppThemeContextValue {
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  colors: AppThemeColors;
  setMode: (mode: ThemeMode) => void;
  themeReady: boolean;
}

const AppThemeContext =
  createContext<AppThemeContextValue | null>(null);

function isThemeMode(value: unknown): value is ThemeMode {
  return value === 'system' ||
    value === 'light' ||
    value === 'dark';
}

export function AppThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const systemTheme = useColorScheme();

  const [mode, setModeState] = useState<ThemeMode>('system');
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    let active = true;

    const restore = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (active && isThemeMode(saved)) {
          setModeState(saved);
        }
      } catch (error) {
        console.warn('Error cargando preferencia de tema:', error);
      } finally {
        if (active) {
          setThemeReady(true);
        }
      }
    };

    void restore();

    return () => {
      active = false;
    };
  }, []);

  const setMode = (nextMode: ThemeMode) => {
    setModeState(nextMode);

    void AsyncStorage.setItem(STORAGE_KEY, nextMode)
      .catch((error) => {
        console.warn('Error guardando preferencia:', error);
      });
  };

  const resolvedTheme: ResolvedTheme =
    mode === 'system'
      ? systemTheme === 'dark' ? 'dark' : 'light'
      : mode;

  const value = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      resolvedTheme,
      colors: AppColors[resolvedTheme],
      setMode,
      themeReady,
    }),
    [mode, resolvedTheme, themeReady]
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(AppThemeContext);

  if (!context) {
    throw new Error(
      'useAppTheme requiere AppThemeProvider'
    );
  }

  return context;
}
