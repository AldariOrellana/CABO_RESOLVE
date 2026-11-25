import { supabase } from '@/lib/supabase';

export type EstadoCaso = 'abierto' | 'investigacion' | 'accion' | 'verificacion' | 'cerrado';
export type TipoCaso = 'incidencia' | 'reclamo' | 'devolucion' | 'no_conformidad' | 'auditoria';
export type PrioridadCaso = 'baja' | 'media' | 'alta' | 'critica';

export interface Caso {
  id: string;
  empresa_id: string;
  tipo: TipoCaso;
  titulo: string;
  descripcion: string;
  politica_referencia: string | null;
  estado: EstadoCaso;
  prioridad: PrioridadCaso;
  creado_por: string;
  responsable_id: string | null;
  departamento_id: string | null;
  departamento_catalogo_id: string | null;
  recurrencia_clave: string | null;
  fecha_limite: string | null;
  causa_raiz: string | null;
  solucion: string | null;
  prevencion: string | null;
  verificado_por: string | null;
  creado_en: string;
}

export interface Empresa {
  id: string;
  nombre: string;
  region_id: string;
}
export interface Miembro {
  usuario_id: string;
  usuarios: { nombre: string }[];
}
export interface Actividad {
  id: string;
  tipo: string;
  detalle: string;
  creado_en: string;
  autor_id: string;
}
export interface Evidencia {
  id: string;
  nombre: string;
  ruta: string;
  tipo_mime: string;
  creado_en: string;
}
export interface ArchivoEvidencia {
  nombre: string;
  tipoMime: 'image/jpeg' | 'application/pdf';
  contenido: ArrayBuffer;
}

export async function obtenerEmpresas(): Promise<Empresa[]> {
  const { data, error } = await supabase
    .from('empresas')
    .select('id,nombre,region_id')
    .eq('activo', true)
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

export async function obtenerEmpresaOrigen(usuarioId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('empresa_origen_id')
    .eq('id', usuarioId)
    .single();
  if (error?.code === '42703') return null;
  if (error) throw error;
  return data.empresa_origen_id;
}

export async function obtenerMisPermisos(empresaId: string): Promise<string[]> {
  const { data, error } = await supabase.rpc('mis_permisos', { p_empresa: empresaId });
  if (error?.code === 'PGRST202')
    return [
      'CASOS.VER',
      'CASOS.CREAR',
      'CASOS.EDITAR',
      'CASOS.ASIGNAR',
      'CASOS.APROBAR',
      'CASOS.CERRAR',
    ];
  if (error) throw error;
  return (data ?? []).map((item: { codigo: string }) => item.codigo);
}

export async function obtenerRegionEmpresa(empresaId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('empresas')
    .select('region_id')
    .eq('id', empresaId)
    .maybeSingle();
  if (error?.code === '42703') return null;
  if (error) throw error;
  return data?.region_id ?? null;
}

export async function obtenerCasos(empresaId: string): Promise<Caso[]> {
  const { data, error } = await supabase
    .from('casos')
    .select('*')
    .eq('empresa_id', empresaId)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return (data ?? []) as Caso[];
}

export async function crearCaso(
  input: Pick<
    Caso,
    | 'empresa_id'
    | 'tipo'
    | 'titulo'
    | 'descripcion'
    | 'politica_referencia'
    | 'prioridad'
    | 'creado_por'
  > & { recurrencia_clave?: string | null },
) {
  const { error } = await supabase.from('casos').insert(input);
  if (error) throw error;
}

export async function actualizarCaso(
  id: string,
  empresaId: string,
  cambios: Partial<
    Pick<
      Caso,
      | 'estado'
      | 'prioridad'
      | 'responsable_id'
      | 'departamento_catalogo_id'
      | 'recurrencia_clave'
      | 'fecha_limite'
      | 'causa_raiz'
      | 'solucion'
      | 'prevencion'
    >
  > & {
    verificado_por?: string;
    verificado_en?: string;
    cerrado_por?: string;
    cerrado_en?: string;
  },
) {
  const { error } = await supabase
    .from('casos')
    .update(cambios)
    .eq('id', id)
    .eq('empresa_id', empresaId)
    .select('id')
    .single();
  if (error) throw error;
}

export async function obtenerMiembros(empresaId: string): Promise<Miembro[]> {
  const { data, error } = await supabase
    .from('usuarios_empresas')
    .select('usuario_id,usuarios(nombre)')
    .eq('empresa_id', empresaId)
    .eq('activo', true);
  if (error) throw error;
  return data ?? [];
}

export async function obtenerActividades(casoId: string): Promise<Actividad[]> {
  const { data, error } = await supabase
    .from('casos_actividades')
    .select('id,tipo,detalle,creado_en,autor_id')
    .eq('caso_id', casoId)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function comentarCaso(caso: Caso, autorId: string, detalle: string) {
  const { error } = await supabase.from('casos_actividades').insert({
    caso_id: caso.id,
    empresa_id: caso.empresa_id,
    autor_id: autorId,
    tipo: 'comentario',
    detalle,
  });
  if (error) throw error;
}

export async function obtenerEvidencias(casoId: string): Promise<Evidencia[]> {
  const { data, error } = await supabase
    .from('casos_evidencias')
    .select('id,nombre,ruta,tipo_mime,creado_en')
    .eq('caso_id', casoId)
    .order('creado_en', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function subirEvidencia(caso: Caso, autorId: string, archivo: ArchivoEvidencia) {
  if (!archivo.contenido.byteLength || archivo.contenido.byteLength > 10 * 1024 * 1024) {
    throw new Error('El archivo debe tener un tamaño máximo de 10 MB.');
  }
  const extension = archivo.tipoMime === 'application/pdf' ? 'pdf' : 'jpg';
  const ruta = `${caso.empresa_id}/${caso.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const { error: uploadError } = await supabase.storage
    .from('casos-evidencias')
    .upload(ruta, archivo.contenido, { contentType: archivo.tipoMime, upsert: false });
  if (uploadError) throw uploadError;
  const { error } = await supabase.from('casos_evidencias').insert({
    caso_id: caso.id,
    empresa_id: caso.empresa_id,
    autor_id: autorId,
    nombre: archivo.nombre,
    ruta,
    tipo_mime: archivo.tipoMime,
  });
  if (error) {
    await supabase.storage.from('casos-evidencias').remove([ruta]);
    throw error;
  }
}

export async function urlEvidencia(ruta: string) {
  const { data, error } = await supabase.storage.from('casos-evidencias').createSignedUrl(ruta, 60);
  if (error) throw error;
  return data.signedUrl;
}
