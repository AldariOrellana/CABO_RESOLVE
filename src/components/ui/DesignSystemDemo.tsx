import { useState } from 'react';

import { ScrollView, StyleSheet, Text } from 'react-native';

import { useAppTheme } from '@/hooks/useAppTheme';
import { AppButton } from './Custom/AppButton';
import { AppDatePicker } from './Custom/AppDatePicker';
import { AppInput } from './Custom/AppInput';
import { AppSelect } from './Custom/AppSelect';
import { AppThemeSelector } from './Custom/AppThemeSelector';

export function DesignSystemDemo() {
  const { colors } = useAppTheme();

  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [tipo, setTipo] = useState<string | null>(null);
  const [fecha, setFecha] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);

  const probarGuardar = () => {
    setGuardando(true);
    setGuardando(false);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>Componentes CABO Resolve</Text>

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Apariencia</Text>

      <AppThemeSelector />

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Botones</Text>

      <AppButton title="Principal" variant="primary" icon="save-outline" onPress={probarGuardar} />

      <AppButton
        title="Operación exitosa"
        variant="success"
        icon="checkmark-circle-outline"
        onPress={probarGuardar}
      />

      <AppButton title="Eliminar" variant="danger" icon="trash-outline" onPress={probarGuardar} />

      <AppButton title="Advertencia" variant="warning" onPress={probarGuardar} />

      <AppButton title="Secundario" variant="secondary" onPress={probarGuardar} />

      <AppButton title="Cancelar" variant="outline" onPress={probarGuardar} />

      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Entradas de datos</Text>

      <AppInput
        label="Nombre"
        placeholder="Nombre completo"
        value={nombre}
        onChangeText={setNombre}
        leftIcon="person-outline"
        required
      />

      <AppInput
        label="Correo"
        placeholder="correo@empresa.com"
        value={correo}
        onChangeText={setCorreo}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="mail-outline"
      />

      <AppInput
        label="Contraseña"
        value={password}
        onChangeText={setPassword}
        isPassword
        leftIcon="lock-closed-outline"
      />

      <AppSelect
        label="Tipo de caso"
        value={tipo}
        onChange={setTipo}
        required
        options={[
          { label: 'No conformidad', value: 'NC' },
          { label: 'Incidencia operativa', value: 'INC' },
          { label: 'Reclamo', value: 'REC' },
        ]}
      />

      <AppDatePicker label="Fecha límite" value={fecha} onChange={setFecha} />

      <AppButton
        title="Probar formulario"
        variant="primary"
        loading={guardando}
        onPress={probarGuardar}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 16,
    padding: 20,
    paddingBottom: 70,
  },
  title: {
    fontSize: 23,
    fontWeight: '700',
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15,
    fontWeight: '600',
  },
});
