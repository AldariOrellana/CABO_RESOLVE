
import { useEffect, useRef, useState } from 'react';

import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  type ScrollViewInstance,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { useAuth } from '@/contexts/AuthContext';

const colores = {
  light: {
    background: '#FFFFFF',
    inputBackground: '#EEF2F8',
    text: '#263247',
    inputText: '#253047',
    placeholder: '#9AA8BC',
    icon: '#8392AA',
    header: '#407BDA',
    button: '#247AF5',
    error: '#DC2626',
  },
  dark: {
    background: '#111827',
    inputBackground: '#253247',
    text: '#F1F5F9',
    inputText: '#F1F5F9',
    placeholder: '#94A3B8',
    icon: '#A8B8D0',
    header: '#407BDA',
    button: '#247AF5',
    error: '#F87171',
  },
};

const loginSchema = Yup.object({
  email: Yup.string()
    .trim()
    .email('Ingrese un correo válido')
    .required('El correo es obligatorio'),

  password: Yup.string()
    .min(6, 'Mínimo 6 caracteres')
    .required('La contraseña es obligatoria'),
});

type CampoLogin = 'email' | 'password';

export default function LoginScreen() {
  const { login } = useAuth();

  const colorScheme = useColorScheme();
  const theme = colores[colorScheme === 'dark' ? 'dark' : 'light'];

  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [tecladoVisible, setTecladoVisible] = useState(false);
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  const scrollRef = useRef<ScrollViewInstance>(null);
  const campoActivo = useRef<CampoLogin | null>(null);
  const passwordRef = useRef<React.ComponentRef<typeof TextInput>>(null);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => {
      setTecladoVisible(true);

      if (campoActivo.current === 'password') {
        scrollRef.current?.scrollTo({
          y: 145,
          animated: true,
        });
      }
    });

    const hide = Keyboard.addListener('keyboardDidHide', () => {
      setTecladoVisible(false);
      campoActivo.current = null;

      scrollRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    });

    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const enfocarCampo = (campo: CampoLogin) => {
    campoActivo.current = campo;

    if (tecladoVisible) {
      scrollRef.current?.scrollTo({
        y: campo === 'password' ? 145 : 0,
        animated: true,
      });
    }
  };

  const obtenerMensajeError = (error: unknown): string => {
    if (!(error instanceof Error)) {
      return 'No fue posible iniciar sesión. Inténtalo nuevamente.';
    }

    const mensaje = error.message.toLowerCase();

    if (
      mensaje.includes('invalid login credentials') ||
      mensaje.includes('invalid credentials')
    ) {
      return 'Correo electrónico o contraseña incorrectos.';
    }

    if (mensaje.includes('email not confirmed')) {
      return 'Debes confirmar tu correo electrónico antes de ingresar.';
    }

    if (
      mensaje.includes('network request failed') ||
      mensaje.includes('failed to fetch') ||
      mensaje.includes('network error')
    ) {
      return 'No hay conexión con el servidor. Verifica tu conexión a Internet.';
    }

    if (mensaje.includes('too many requests')) {
      return 'Demasiados intentos. Inténtalo nuevamente más tarde.';
    }

    return 'No fue posible iniciar sesión. Inténtalo nuevamente.';
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.header },
      ]}
    >
      <StatusBar barStyle="light-content" />

      <View
        style={[
          styles.header,
          { backgroundColor: theme.header },
        ]}
      >
        <View style={styles.circleDecoration} />

        <View style={styles.logoCard}>
          <Image
            source={require('@/assets/images/logotext.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.headerTitle}>
          Bienvenido
        </Text>
      </View>

      <KeyboardAvoidingView
        style={[
          styles.keyboardContainer,
          { backgroundColor: theme.background },
        ]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          ref={scrollRef}
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { backgroundColor: theme.background },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <Formik
            initialValues={{
              email: '',
              password: '',
            }}
            validationSchema={loginSchema}
            validateOnBlur
            validateOnChange
            onSubmit={async (values, { setSubmitting }) => {
              setErrorLogin(null);

              try {
                await login(
                  values.email.trim().toLowerCase(),
                  values.password
                );

                Keyboard.dismiss();
              } catch (error) {
                setErrorLogin(obtenerMensajeError(error));
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {({
              handleChange,
              handleBlur,
              handleSubmit,
              values,
              errors,
              touched,
              isSubmitting,
            }) => (
              <View style={styles.form}>
                <Text
                  style={[
                    styles.label,
                    { color: theme.text },
                  ]}
                >
                  Correo electrónico
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.inputBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="at-outline"
                    size={21}
                    color={theme.icon}
                  />

                  <TextInput
                    style={[
                      styles.input,
                      { color: theme.inputText },
                    ]}
                    placeholder="Ingresa tu correo"
                    placeholderTextColor={theme.placeholder}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect={false}
                    value={values.email}
                    onChangeText={(value) => {
                      handleChange('email')(value);

                      if (errorLogin) {
                        setErrorLogin(null);
                      }
                    }}
                    onBlur={handleBlur('email')}
                    onFocus={() => enfocarCampo('email')}
                    returnKeyType="next"
                    onSubmitEditing={() => {
                      passwordRef.current?.focus();
                    }}
                    selectionColor={theme.button}
                    editable={!isSubmitting}
                    accessibilityLabel="Correo electrónico"
                  />
                </View>

                {touched.email && errors.email && (
                  <Text
                    style={[
                      styles.error,
                      { color: theme.error },
                    ]}
                  >
                    {errors.email}
                  </Text>
                )}

                <Text
                  style={[
                    styles.label,
                    { color: theme.text },
                  ]}
                >
                  Contraseña
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    {
                      backgroundColor: theme.inputBackground,
                    },
                  ]}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={21}
                    color={theme.icon}
                  />

                  <TextInput
                    ref={passwordRef}
                    style={[
                      styles.input,
                      { color: theme.inputText },
                    ]}
                    placeholder="Ingresa tu contraseña"
                    placeholderTextColor={theme.placeholder}
                    secureTextEntry={!mostrarPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                    autoComplete="current-password"
                    value={values.password}
                    onChangeText={(value) => {
                      handleChange('password')(value);

                      if (errorLogin) {
                        setErrorLogin(null);
                      }
                    }}
                    onBlur={handleBlur('password')}
                    onFocus={() => enfocarCampo('password')}
                    returnKeyType="done"
                    onSubmitEditing={() => {
                      if (!isSubmitting) {
                        handleSubmit();
                      }
                    }}
                    selectionColor={theme.button}
                    editable={!isSubmitting}
                    accessibilityLabel="Contraseña"
                  />

                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => {
                      setMostrarPassword((prev) => !prev);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={
                      mostrarPassword
                        ? 'Ocultar contraseña'
                        : 'Mostrar contraseña'
                    }
                    accessibilityState={{
                      disabled: isSubmitting,
                    }}
                    disabled={isSubmitting}
                  >
                    <Ionicons
                      name={
                        mostrarPassword
                          ? 'eye-outline'
                          : 'eye-off-outline'
                      }
                      size={22}
                      color={theme.icon}
                    />
                  </TouchableOpacity>
                </View>

                {touched.password && errors.password && (
                  <Text
                    style={[
                      styles.error,
                      { color: theme.error },
                    ]}
                  >
                    {errors.password}
                  </Text>
                )}

                {errorLogin && (
                  <View
                    style={[
                      styles.errorContainer,
                      {
                        backgroundColor:
                          colorScheme === 'dark'
                            ? 'rgba(248,113,113,0.12)'
                            : '#FEF2F2',
                      },
                    ]}
                    accessibilityRole="alert"
                  >
                    <Ionicons
                      name="alert-circle-outline"
                      size={20}
                      color={theme.error}
                    />

                    <Text
                      style={[
                        styles.errorLoginText,
                        { color: theme.error },
                      ]}
                    >
                      {errorLogin}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={[
                    styles.button,
                    { backgroundColor: theme.button },
                    isSubmitting && styles.buttonDisabled,
                  ]}
                  onPress={() => {
                    if (!isSubmitting) {
                      handleSubmit();
                    }
                  }}
                  disabled={isSubmitting}
                  activeOpacity={0.85}
                  accessibilityRole="button"
                  accessibilityLabel="Iniciar sesión"
                  accessibilityState={{
                    disabled: isSubmitting,
                    busy: isSubmitting,
                  }}
                >
                  <Text style={styles.buttonText}>
                    {isSubmitting
                      ? 'Verificando credenciales...'
                      : 'Iniciar sesión'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Formik>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 20,
    paddingBottom: 28,
    paddingHorizontal: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 225,
    overflow: 'hidden',
  },
  circleDecoration: {
    position: 'absolute',
    top: -65,
    left: -65,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  logoCard: {
    width: 190,
    height: 130,
    backgroundColor: 'transparent',
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 18,
  },
  logo: {
    width: 160,
    height: 105,
  },
  headerTitle: {
    fontSize: 25,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  keyboardContainer: {
    flex: 1,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 25,
    paddingTop: 38,
    paddingBottom: 35,
  },
  form: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    paddingHorizontal: 14,
    height: 55,
    width: '100%',
    marginBottom: 18,
  },
  input: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 12,
    fontSize: 15,
  },
  eyeButton: {
    padding: 5,
  },
  error: {
    fontSize: 12,
    marginTop: -12,
    marginBottom: 12,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginTop: 2,
  },
  errorLoginText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
  },
  button: {
    height: 54,
    borderRadius: 11,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    elevation: 3,
    shadowColor: '#247AF5',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 7,
  },
  buttonDisabled: {
    opacity: 0.65,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
