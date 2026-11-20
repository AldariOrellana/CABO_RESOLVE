
import 'expo-sqlite/localStorage/install';
import 'react-native-url-polyfill/auto';

import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'Falta configurar Supabase en .env.local'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabaseKey,
  {
    auth: {
      storage: localStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

// Controlar renovación de tokens según el
// estado de la aplicación en Android e iOS.
if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
}



// import 'expo-sqlite/localStorage/install';
// import 'react-native-url-polyfill/auto';

// import { createClient } from '@supabase/supabase-js';

// const supabaseUrl =
//   process.env.EXPO_PUBLIC_SUPABASE_URL;

// const supabaseKey =
//   process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

// if (!supabaseUrl || !supabaseKey) {
//   throw new Error(
//     'No se configuraron las credenciales de Supabase.'
//   );
// }

// export const supabase = createClient(
//   supabaseUrl,
//   supabaseKey,
//   {
//     auth: {
//       storage: localStorage,
//       autoRefreshToken: true,
//       persistSession: true,
//       detectSessionInUrl: false,
//     },
//   }
// );
