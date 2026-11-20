
import { supabase } from '@/lib/supabase';

export interface TipoCaso {
  id: number;
  nombre: string;
  descripcion: string | null;
  activo: boolean | null;
}

export type TipoCasoInput = {
  nombre: string;
  descripcion: string | null;
  activo: boolean;
};

export async function obtenerTiposCaso() {
  const { data, error } = await supabase
    .from('tipos_caso')
    .select('id, nombre, descripcion, activo')
    .order('nombre');

  if (error) throw error;

  return data as TipoCaso[];
}

export async function crearTipoCaso(
  tipo: TipoCasoInput
) {
  const { data, error } = await supabase
    .from('tipos_caso')
    .insert(tipo)
    .select()
    .single();

  if (error) throw error;

  return data as TipoCaso;
}

export async function actualizarTipoCaso(
  id: number,
  tipo: TipoCasoInput
) {
  const { data, error } = await supabase
    .from('tipos_caso')
    .update(tipo)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data as TipoCaso;
}

export async function cambiarEstadoTipoCaso(
  id: number,
  activo: boolean
) {
  const { data, error } = await supabase
    .from('tipos_caso')
    .update({ activo })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  return data as TipoCaso;
}
