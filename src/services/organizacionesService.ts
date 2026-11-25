import { supabase } from '@/lib/supabase';

export interface EmpresaAdmin {
  id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
  region_id: string;
}
export interface Permiso {
  codigo: string;
  descripcion: string;
}
export interface Region {
  id: string;
  codigo: string;
  nombre: string;
}
export interface UsuarioAdmin {
  id: string;
  nombre: string;
  empresa_origen_id?: string | null;
}
export interface RolRegional {
  id: string;
  region_id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
}
export interface DepartamentoRegional {
  id: string;
  region_id: string;
  codigo: string;
  nombre: string;
  activo: boolean;
}

export async function crearEmpresa(codigo: string, nombre: string, regionId: string) {
  const { data, error } = await supabase.rpc('crear_empresa', {
    p_codigo: codigo,
    p_nombre: nombre,
    p_region: regionId,
  });
  if (error) throw error;
  return data as string;
}

export async function listarRegiones(): Promise<Region[]> {
  const { data, error } = await supabase
    .from('regiones')
    .select('id,codigo,nombre')
    .eq('activo', true)
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

export async function listarUsuarios(): Promise<UsuarioAdmin[]> {
  const { data, error } = await supabase
    .from('usuarios')
    .select('id,nombre,empresa_origen_id')
    .eq('activo', true)
    .order('nombre');
  if (error?.code === '42703') {
    const anterior = await supabase
      .from('usuarios')
      .select('id,nombre')
      .eq('activo', true)
      .order('nombre');
    if (anterior.error) throw anterior.error;
    return (anterior.data ?? []).map((usuario) => ({ ...usuario, empresa_origen_id: null }));
  }
  if (error) throw error;
  return data ?? [];
}

export async function origenDisponible(): Promise<boolean> {
  const { error } = await supabase.from('usuarios').select('empresa_origen_id').limit(1);
  if (error?.code === '42703') return false;
  if (error) throw error;
  return true;
}

export async function definirEmpresaOrigen(usuarioId: string, empresaId: string) {
  const { error } = await supabase.rpc('definir_empresa_origen', {
    p_usuario: usuarioId,
    p_empresa: empresaId,
  });
  if (error) throw error;
}

export async function listarPermisosUsuario(
  usuarioId: string,
  empresaId: string,
): Promise<string[]> {
  const { data, error } = await supabase
    .from('usuarios_permisos')
    .select('permiso_codigo')
    .eq('usuario_id', usuarioId)
    .eq('empresa_id', empresaId);
  if (error) throw error;
  return (data ?? []).map((item) => item.permiso_codigo);
}

export async function cambiarPermisoUsuario(
  usuarioId: string,
  empresaId: string,
  permiso: string,
  otorgar: boolean,
) {
  const { error } = await supabase.rpc('cambiar_permiso_usuario', {
    p_usuario: usuarioId,
    p_empresa: empresaId,
    p_permiso: permiso,
    p_otorgar: otorgar,
  });
  if (error) throw error;
}

export async function listarEmpresasUsuario(
  usuarioId: string,
): Promise<{ empresa_id: string; activo: boolean }[]> {
  const { data, error } = await supabase
    .from('usuarios_empresas')
    .select('empresa_id,activo')
    .eq('usuario_id', usuarioId);
  if (error) throw error;
  return data ?? [];
}

export interface RolUsuarioAsignado {
  empresa_id: string;
  rol_id: string;
  roles: { nombre: string; catalogo_id: string | null }[];
}

export async function listarRolesUsuario(usuarioId: string): Promise<RolUsuarioAsignado[]> {
  const { data, error } = await supabase
    .from('usuarios_roles')
    .select('empresa_id,rol_id,roles(nombre,catalogo_id)')
    .eq('usuario_id', usuarioId);
  if (error) throw error;
  return data ?? [];
}

export async function quitarRolUsuario(usuarioId: string, empresaId: string, rolId: string) {
  const { error } = await supabase
    .from('usuarios_roles')
    .delete()
    .eq('usuario_id', usuarioId)
    .eq('empresa_id', empresaId)
    .eq('rol_id', rolId);
  if (error) throw error;
}

export async function buscarUsuario(
  empresaId: string,
  correo: string,
): Promise<UsuarioAdmin | null> {
  const { data, error } = await supabase.rpc('buscar_usuario_empresa', {
    p_empresa: empresaId,
    p_correo: correo.trim(),
  });
  if (error) throw error;
  return data?.[0] ?? null;
}

export async function asignarUsuarioEmpresa(
  usuarioId: string,
  empresaId: string,
  rolRegionalId: string,
) {
  const { error } = await supabase.rpc('asignar_usuario_empresa', {
    p_usuario: usuarioId,
    p_empresa: empresaId,
    p_rol_catalogo: rolRegionalId,
  });
  if (error) throw error;
}

export async function invitarUsuario(correo: string, empresaId: string, rolCatalogoId: string) {
  const { data, error } = await supabase.functions.invoke('invitar-usuario', {
    body: { correo: correo.trim(), empresaId, rolCatalogoId },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);
  return data as { usuarioId: string; invitado: boolean };
}

export interface SolicitudAcceso {
  id: string;
  usuario_id: string;
  empresa_id: string;
  estado: string;
  solicitante: { nombre: string } | null;
}

export async function listarSolicitudes(empresaId: string): Promise<SolicitudAcceso[]> {
  const { data, error } = await supabase
    .from('solicitudes_acceso')
    .select(
      'id,usuario_id,empresa_id,estado,solicitante:usuarios!solicitudes_acceso_usuario_id_fkey(nombre)',
    )
    .eq('empresa_id', empresaId)
    .eq('estado', 'pendiente')
    .order('creado_en');
  if (error) throw error;
  return (data ?? []).map(({ solicitante, ...solicitud }) => ({
    ...solicitud,
    solicitante: Array.isArray(solicitante) ? (solicitante[0] ?? null) : solicitante,
  }));
}

export async function resolverSolicitud(id: string, rolCatalogoId: string, aprobar: boolean) {
  const { error } = await supabase.rpc('resolver_solicitud', {
    p_solicitud: id,
    p_rol_catalogo: rolCatalogoId,
    p_aprobar: aprobar,
  });
  if (error) throw error;
}

export async function listarRolesRegionales(regionId: string): Promise<RolRegional[]> {
  const { data, error } = await supabase
    .from('catalogo_roles')
    .select('id,region_id,codigo,nombre,activo')
    .eq('region_id', regionId)
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

export async function listarDepartamentosRegionales(
  regionId: string,
): Promise<DepartamentoRegional[]> {
  const { data, error } = await supabase
    .from('catalogo_departamentos')
    .select('id,region_id,codigo,nombre,activo')
    .eq('region_id', regionId)
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

export async function crearRolRegional(regionId: string, codigo: string, nombre: string) {
  const { error } = await supabase
    .from('catalogo_roles')
    .insert({ region_id: regionId, codigo: codigo.trim().toUpperCase(), nombre: nombre.trim() });
  if (error) throw error;
}

export async function actualizarRolRegional(id: string, nombre: string, activo: boolean) {
  const { error } = await supabase
    .from('catalogo_roles')
    .update({ nombre: nombre.trim(), activo })
    .eq('id', id);
  if (error) throw error;
}

export async function crearDepartamentoRegional(regionId: string, codigo: string, nombre: string) {
  const { error } = await supabase
    .from('catalogo_departamentos')
    .insert({ region_id: regionId, codigo: codigo.trim().toUpperCase(), nombre: nombre.trim() });
  if (error) throw error;
}

export async function actualizarDepartamentoRegional(id: string, nombre: string, activo: boolean) {
  const { error } = await supabase
    .from('catalogo_departamentos')
    .update({ nombre: nombre.trim(), activo })
    .eq('id', id);
  if (error) throw error;
}

export async function listarPermisosRolRegional(rolId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('catalogo_roles_permisos')
    .select('permiso_codigo')
    .eq('rol_id', rolId);
  if (error) throw error;
  return (data ?? []).map((x) => x.permiso_codigo);
}

export async function cambiarPermisoRolRegional(rolId: string, permiso: string, otorgar: boolean) {
  const query = supabase.from('catalogo_roles_permisos');
  const { error } = otorgar
    ? await query.insert({ rol_id: rolId, permiso_codigo: permiso })
    : await query.delete().eq('rol_id', rolId).eq('permiso_codigo', permiso);
  if (error) throw error;
}

export async function listarEmpresas(): Promise<EmpresaAdmin[]> {
  const { data, error } = await supabase
    .from('empresas')
    .select('id,codigo,nombre,activo,region_id')
    .order('nombre');
  if (error) throw error;
  return data ?? [];
}

export async function actualizarEmpresa(
  id: string,
  codigo: string,
  nombre: string,
  activo: boolean,
) {
  const { error } = await supabase
    .from('empresas')
    .update({ codigo: codigo.trim().toUpperCase(), nombre: nombre.trim(), activo })
    .eq('id', id);
  if (error) throw error;
}

export async function cambiarEstadoMiembro(empresaId: string, usuarioId: string, activo: boolean) {
  const { error } = await supabase
    .from('usuarios_empresas')
    .update({ activo })
    .eq('empresa_id', empresaId)
    .eq('usuario_id', usuarioId);
  if (error) throw error;
}

export async function listarPermisos(): Promise<Permiso[]> {
  const { data, error } = await supabase
    .from('permisos')
    .select('codigo,descripcion')
    .order('codigo');
  if (error) throw error;
  return data ?? [];
}
