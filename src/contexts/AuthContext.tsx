
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import type { Session, User } from '@supabase/supabase-js';

import { supabase } from '@/lib/supabase';

// ========================================
// TIPOS
// ========================================

interface Usuario {
  id: string;
  nombre: string;
  correo: string;
}

interface AuthContextType {
  usuario: Usuario | null;
  session: Session | null;
  isAuthenticated: boolean;
  loading: boolean;

  login: (
    correo: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;
}

// ========================================
// CONTEXTO
// ========================================

const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

function obtenerUsuario(user: User): Usuario {
  const nombre =
    typeof user.user_metadata?.nombre === 'string'
      ? user.user_metadata.nombre
      : '';

  return {
    id: user.id,
    nombre: nombre.trim() || user.email || 'Usuario',
    correo: user.email ?? '',
  };
}

// ========================================
// PROVIDER
// ========================================

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Escuchar los cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;

        setSession(newSession);
        setUsuario(
          newSession?.user
            ? obtenerUsuario(newSession.user)
            : null
        );
      }
    );

    // Recuperar sesión almacenada
    const recuperarSesion = async () => {
      try {
        const { data, error } =
          await supabase.auth.getSession();

        if (error) throw error;

        if (mounted) {
          setSession(data.session);
          setUsuario(
            data.session?.user
              ? obtenerUsuario(data.session.user)
              : null
          );
        }
      } catch (error) {
        console.error(
          'Error recuperando sesión:',
          error
        );

        if (mounted) {
          setSession(null);
          setUsuario(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void recuperarSesion();

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // ========================================
  // INICIAR SESIÓN
  // ========================================

  const login = async (
    correo: string,
    password: string
  ): Promise<void> => {
    const { data, error } =
      await supabase.auth.signInWithPassword({
        email: correo.trim(),
        password,
      });

    if (error) {
      throw error;
    }

    if (!data.session || !data.user) {
      throw new Error(
        'No se pudo establecer una sesión válida.'
      );
    }

    setSession(data.session);
    setUsuario(obtenerUsuario(data.user));
  };

  // ========================================
  // CERRAR SESIÓN
  // ========================================

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

    setSession(null);
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        session,
        isAuthenticated: session !== null,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ========================================
// HOOK PERSONALIZADO
// ========================================

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth debe utilizarse dentro de AuthProvider'
    );
  }

  return context;
}
