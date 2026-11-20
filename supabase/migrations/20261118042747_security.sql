-- CABO Resolve - Primera migración de seguridad multitenant
-- Requiere PostgreSQL en Supabase, y auth.users proporcionada por Supabase Auth.
-- Todas las operaciones de escritura desde el móvil quedan sujetas a RLS.

BEGIN;

CREATE SCHEMA IF NOT EXISTS app_private;
REVOKE ALL ON SCHEMA app_private FROM PUBLIC, anon, authenticated;
GRANT USAGE ON SCHEMA app_private TO authenticated;

-- ---------------------------------------------------------------------
-- Identidad, empresas y membresías
-- ---------------------------------------------------------------------
CREATE TABLE public.empresas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo varchar(30) NOT NULL UNIQUE,
  nombre varchar(160) NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT empresas_codigo_no_vacio CHECK (length(btrim(codigo)) > 0),
  CONSTRAINT empresas_nombre_no_vacio CHECK (length(btrim(nombre)) > 0)
);

CREATE TABLE public.usuarios (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre varchar(160) NOT NULL DEFAULT 'Usuario',
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT usuarios_nombre_no_vacio CHECK (length(btrim(nombre)) > 0)
);

CREATE TABLE public.usuarios_empresas (
  usuario_id uuid NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, empresa_id)
);
CREATE INDEX usuarios_empresas_empresa_activo_idx
  ON public.usuarios_empresas (empresa_id, usuario_id) WHERE activo;

-- Catálogo de permisos de plataforma, no modificable por el móvil
CREATE TABLE public.permisos (
  codigo varchar(100) PRIMARY KEY,
  descripcion varchar(250) NOT NULL,
  CONSTRAINT permisos_codigo_no_vacio CHECK (length(btrim(codigo)) > 0)
);

-- Cada rol pertenece exactamente a una empresa.
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.empresas(id) ON DELETE CASCADE,
  codigo varchar(40) NOT NULL,
  nombre varchar(100) NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  creado_en timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT roles_codigo_no_vacio CHECK (length(btrim(codigo)) > 0),
  CONSTRAINT roles_nombre_no_vacio CHECK (length(btrim(nombre)) > 0),
  UNIQUE (empresa_id, codigo),
  UNIQUE (id, empresa_id)
);
CREATE INDEX roles_empresa_idx ON public.roles (empresa_id);

CREATE TABLE public.roles_permisos (
  rol_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permiso_codigo varchar(100) NOT NULL REFERENCES public.permisos(codigo) ON DELETE RESTRICT,
  PRIMARY KEY (rol_id, permiso_codigo)
);
CREATE INDEX roles_permisos_permiso_idx ON public.roles_permisos (permiso_codigo, rol_id);

-- Claves compuestas impiden asignar un rol de otra empresa.
CREATE TABLE public.usuarios_roles (
  usuario_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  rol_id uuid NOT NULL,
  creado_en timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (usuario_id, empresa_id, rol_id),
  FOREIGN KEY (usuario_id, empresa_id)
    REFERENCES public.usuarios_empresas(usuario_id, empresa_id) ON DELETE CASCADE,
  FOREIGN KEY (rol_id, empresa_id)
    REFERENCES public.roles(id, empresa_id) ON DELETE CASCADE
);
CREATE INDEX usuarios_roles_empresa_rol_idx ON public.usuarios_roles (empresa_id, rol_id);

-- Los superadministradores no son un rol asignable por usuarios desde el móvil.
CREATE TABLE app_private.administradores_plataforma (
  usuario_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  creado_en timestamptz NOT NULL DEFAULT now()
);
REVOKE ALL ON app_private.administradores_plataforma FROM PUBLIC, anon, authenticated;

-- ---------------------------------------------------------------------
-- Funciones privadas de autorización; funciones fijas y sin SQL dinámico
-- ---------------------------------------------------------------------
CREATE FUNCTION app_private.es_admin_plataforma(p_usuario uuid DEFAULT auth.uid())
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT p_usuario IS NOT NULL AND EXISTS (
    SELECT 1 FROM app_private.administradores_plataforma ap
    JOIN public.usuarios u ON u.id = ap.usuario_id
    WHERE ap.usuario_id = p_usuario AND u.activo
  );
$$;

CREATE FUNCTION app_private.es_miembro(p_empresa uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.usuarios_empresas ue
    JOIN public.usuarios u ON u.id = ue.usuario_id
    JOIN public.empresas e ON e.id = ue.empresa_id
    WHERE ue.usuario_id = (SELECT auth.uid())
      AND ue.empresa_id = p_empresa
      AND ue.activo AND u.activo AND e.activo
  );
$$;

CREATE FUNCTION app_private.tiene_permiso(p_empresa uuid, p_codigo text)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT app_private.es_admin_plataforma((SELECT auth.uid())) OR EXISTS (
    SELECT 1
    FROM public.usuarios_empresas ue
    JOIN public.usuarios u ON u.id = ue.usuario_id
    JOIN public.empresas e ON e.id = ue.empresa_id
    JOIN public.usuarios_roles ur
      ON ur.usuario_id = ue.usuario_id AND ur.empresa_id = ue.empresa_id
    JOIN public.roles r ON r.id = ur.rol_id AND r.empresa_id = ur.empresa_id
    JOIN public.roles_permisos rp ON rp.rol_id = r.id
    WHERE ue.usuario_id = (SELECT auth.uid())
      AND ue.empresa_id = p_empresa
      AND rp.permiso_codigo = p_codigo
      AND ue.activo AND u.activo AND e.activo AND r.activo
  );
$$;

-- No exponer funciones privadas como RPC; solo uso dentro de políticas.
REVOKE ALL ON FUNCTION app_private.es_admin_plataforma(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION app_private.es_miembro(uuid) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION app_private.tiene_permiso(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION app_private.es_admin_plataforma(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.es_miembro(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION app_private.tiene_permiso(uuid, text) TO authenticated;

-- ---------------------------------------------------------------------
-- Perfil automático para usuarios creados por Supabase Auth
-- ---------------------------------------------------------------------
CREATE FUNCTION app_private.crear_perfil_usuario()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
  INSERT INTO public.usuarios(id, nombre)
  VALUES (NEW.id, LEFT(COALESCE(NULLIF(btrim(NEW.raw_user_meta_data ->> 'nombre'), ''), 'Usuario'), 160))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION app_private.crear_perfil_usuario() FROM PUBLIC, anon, authenticated;
CREATE TRIGGER cabo_crear_perfil_usuario
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION app_private.crear_perfil_usuario();

-- Por si ya existen usuarios creados antes de esta migración.
INSERT INTO public.usuarios (id, nombre)
SELECT id, LEFT(COALESCE(NULLIF(btrim(raw_user_meta_data ->> 'nombre'), ''), 'Usuario'), 160)
FROM auth.users
ON CONFLICT (id) DO NOTHING;

CREATE FUNCTION app_private.actualizar_fecha()
RETURNS trigger LANGUAGE plpgsql SET search_path = '' AS $$
BEGIN
  NEW.actualizado_en = now();
  RETURN NEW;
END;
$$;
CREATE TRIGGER cabo_empresas_actualizar_fecha BEFORE UPDATE ON public.empresas
  FOR EACH ROW EXECUTE FUNCTION app_private.actualizar_fecha();
CREATE TRIGGER cabo_usuarios_actualizar_fecha BEFORE UPDATE ON public.usuarios
  FOR EACH ROW EXECUTE FUNCTION app_private.actualizar_fecha();

-- ---------------------------------------------------------------------
-- Permisos por operación (catálogo no editable desde móvil)
-- ---------------------------------------------------------------------
INSERT INTO public.permisos (codigo, descripcion) VALUES
  ('EMPRESAS.VER', 'Consultar empresas autorizadas'),
  ('EMPRESAS.EDITAR', 'Modificar datos de una empresa'),
  ('USUARIOS.VER', 'Consultar membresías y usuarios de empresa'),
  ('USUARIOS.ASIGNAR', 'Administrar membresías de empresa'),
  ('ROLES.VER', 'Consultar roles y permisos asignados'),
  ('ROLES.GESTIONAR', 'Crear, modificar y asignar permisos a roles'),
  ('ROLES.ASIGNAR', 'Asignar roles a usuarios de empresa'),
  ('TIPOS_CASO.VER', 'Consultar el catálogo de tipos de caso'),
  ('TIPOS_CASO.GESTIONAR', 'Crear, modificar y desactivar tipos de caso'),
  ('CASOS.VER', 'Consultar casos autorizados'),
  ('CASOS.CREAR', 'Registrar casos'),
  ('CASOS.EDITAR', 'Editar casos autorizados'),
  ('CASOS.ASIGNAR', 'Asignar responsables'),
  ('CASOS.APROBAR', 'Verificar y aprobar casos'),
  ('CASOS.CERRAR', 'Cerrar casos')
ON CONFLICT (codigo) DO NOTHING;

-- ---------------------------------------------------------------------
-- RLS y privilegios SQL (ambos son necesarios)
-- ---------------------------------------------------------------------
ALTER TABLE public.empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles_permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios_roles ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.empresas, public.usuarios, public.usuarios_empresas,
  public.permisos, public.roles, public.roles_permisos, public.usuarios_roles
FROM anon, authenticated;

GRANT SELECT ON public.empresas, public.usuarios, public.usuarios_empresas,
  public.permisos, public.roles, public.roles_permisos, public.usuarios_roles
TO authenticated;
GRANT UPDATE (nombre) ON public.usuarios TO authenticated;
GRANT UPDATE (codigo, nombre, activo) ON public.empresas TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.usuarios_empresas, public.roles,
  public.roles_permisos, public.usuarios_roles TO authenticated;

-- Empresas: membresías activas; crear empresas solo por bootstrap/admin confiable.
CREATE POLICY empresas_lectura ON public.empresas FOR SELECT TO authenticated
USING (app_private.es_admin_plataforma((SELECT auth.uid())) OR app_private.es_miembro(id));
CREATE POLICY empresas_edicion ON public.empresas FOR UPDATE TO authenticated
USING (app_private.tiene_permiso(id, 'EMPRESAS.EDITAR'))
WITH CHECK (app_private.tiene_permiso(id, 'EMPRESAS.EDITAR'));

-- Perfil: usuario propio o administradores con permiso para esa empresa.
CREATE POLICY usuarios_lectura ON public.usuarios FOR SELECT TO authenticated
USING (
  id = (SELECT auth.uid()) OR app_private.es_admin_plataforma((SELECT auth.uid())) OR
  EXISTS (
    SELECT 1 FROM public.usuarios_empresas ue
    WHERE ue.usuario_id = usuarios.id
      AND app_private.tiene_permiso(ue.empresa_id, 'USUARIOS.VER')
  )
);
CREATE POLICY usuarios_edicion_nombre ON public.usuarios FOR UPDATE TO authenticated
USING (id = (SELECT auth.uid())) WITH CHECK (id = (SELECT auth.uid()));

-- Membresías: solo lectura por miembro autorizado; gestión por permiso específico.
CREATE POLICY membresias_lectura ON public.usuarios_empresas FOR SELECT TO authenticated
USING (
  app_private.es_admin_plataforma((SELECT auth.uid())) OR
  (usuario_id = (SELECT auth.uid()) AND app_private.es_miembro(empresa_id)) OR
  app_private.tiene_permiso(empresa_id, 'USUARIOS.VER')
);
CREATE POLICY membresias_insert ON public.usuarios_empresas FOR INSERT TO authenticated
WITH CHECK (app_private.tiene_permiso(empresa_id, 'USUARIOS.ASIGNAR'));
CREATE POLICY membresias_update ON public.usuarios_empresas FOR UPDATE TO authenticated
USING (app_private.tiene_permiso(empresa_id, 'USUARIOS.ASIGNAR'))
WITH CHECK (app_private.tiene_permiso(empresa_id, 'USUARIOS.ASIGNAR'));
CREATE POLICY membresias_delete ON public.usuarios_empresas FOR DELETE TO authenticated
USING (app_private.tiene_permiso(empresa_id, 'USUARIOS.ASIGNAR'));

CREATE POLICY permisos_lectura ON public.permisos FOR SELECT TO authenticated
USING (true);

CREATE POLICY roles_lectura ON public.roles FOR SELECT TO authenticated
USING (app_private.es_admin_plataforma((SELECT auth.uid())) OR app_private.es_miembro(empresa_id));
CREATE POLICY roles_insert ON public.roles FOR INSERT TO authenticated
WITH CHECK (app_private.tiene_permiso(empresa_id, 'ROLES.GESTIONAR'));
CREATE POLICY roles_update ON public.roles FOR UPDATE TO authenticated
USING (app_private.tiene_permiso(empresa_id, 'ROLES.GESTIONAR'))
WITH CHECK (app_private.tiene_permiso(empresa_id, 'ROLES.GESTIONAR'));
CREATE POLICY roles_delete ON public.roles FOR DELETE TO authenticated
USING (app_private.tiene_permiso(empresa_id, 'ROLES.GESTIONAR'));

CREATE POLICY roles_permisos_lectura ON public.roles_permisos FOR SELECT TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.roles r WHERE r.id = roles_permisos.rol_id
    AND (app_private.es_admin_plataforma((SELECT auth.uid())) OR app_private.es_miembro(r.empresa_id))
));
CREATE POLICY roles_permisos_insert ON public.roles_permisos FOR INSERT TO authenticated
WITH CHECK (EXISTS (
  SELECT 1 FROM public.roles r WHERE r.id = roles_permisos.rol_id
    AND app_private.tiene_permiso(r.empresa_id, 'ROLES.GESTIONAR')
));
CREATE POLICY roles_permisos_delete ON public.roles_permisos FOR DELETE TO authenticated
USING (EXISTS (
  SELECT 1 FROM public.roles r WHERE r.id = roles_permisos.rol_id
    AND app_private.tiene_permiso(r.empresa_id, 'ROLES.GESTIONAR')
));

CREATE POLICY usuarios_roles_lectura ON public.usuarios_roles FOR SELECT TO authenticated
USING (
  app_private.es_admin_plataforma((SELECT auth.uid())) OR
  (usuario_id = (SELECT auth.uid()) AND app_private.es_miembro(empresa_id)) OR
  app_private.tiene_permiso(empresa_id, 'USUARIOS.VER')
);
CREATE POLICY usuarios_roles_insert ON public.usuarios_roles FOR INSERT TO authenticated
WITH CHECK (app_private.tiene_permiso(empresa_id, 'ROLES.ASIGNAR'));
CREATE POLICY usuarios_roles_delete ON public.usuarios_roles FOR DELETE TO authenticated
USING (app_private.tiene_permiso(empresa_id, 'ROLES.ASIGNAR'));

-- Bloquear exposición accidental del catálogo inicial sin RLS.
-- Su CRUD se habilitará después de integrar Supabase Auth y el alcance por empresa.
ALTER TABLE public.tipos_caso ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.tipos_caso FROM anon, authenticated;

COMMIT;
