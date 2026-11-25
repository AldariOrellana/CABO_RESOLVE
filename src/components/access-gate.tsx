import { AppButton } from '@/components/ui/Custom/AppButton';
import { useAuth } from '@/contexts/AuthContext';
import { useAppTheme } from '@/hooks/useAppTheme';
import { supabase } from '@/lib/supabase';
import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function AccessGate({ children }: { children: ReactNode }) {
  const { usuario, logout } = useAuth();
  const { colors } = useAppTheme();
  const [estado, setEstado] = useState<'cargando' | 'autorizado' | 'pendiente' | 'error'>(
    'cargando',
  );
  const comprobar = useCallback(async () => {
    if (!usuario) return;
    setEstado('cargando');
    const { data, error } = await supabase.rpc('tengo_acceso');
    if (error?.code === 'PGRST202') {
      const { data: membresias, error: membresiasError } = await supabase
        .from('usuarios_empresas')
        .select('empresa_id')
        .eq('usuario_id', usuario.id)
        .eq('activo', true)
        .limit(1);
      setEstado(membresiasError ? 'error' : membresias?.length ? 'autorizado' : 'pendiente');
      return;
    }
    if (error) {
      setEstado('error');
      return;
    }
    setEstado(data ? 'autorizado' : 'pendiente');
  }, [usuario]);
  useEffect(() => {
    queueMicrotask(() => {
      void comprobar();
    });
  }, [comprobar]);
  if (estado === 'autorizado') return <>{children}</>;
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      {estado === 'cargando' ? (
        <ActivityIndicator color={colors.primary} />
      ) : (
        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            {estado === 'pendiente' ? 'Solicitud pendiente' : 'No se pudo verificar tu acceso'}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {estado === 'pendiente'
              ? 'Tu cuenta está registrada, pero aún no tiene una empresa aprobada. Un administrador debe asignarte un rol para entrar.'
              : 'Comprueba tu conexión y vuelve a intentarlo.'}
          </Text>
          <AppButton title="Volver a comprobar" onPress={() => void comprobar()} />
          <AppButton title="Cerrar sesión" variant="outline" onPress={() => void logout()} />
        </View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'center' },
  content: { padding: 24, gap: 18 },
  title: { fontSize: 24, fontWeight: '700' },
  description: { fontSize: 15, lineHeight: 22 },
});
