  /**
   * Obtener permisos basados en rol de usuario (actualizado según PDFs)
   * @param {string} rol - Rol del usuario
   * @returns {Array<string>} Lista de permisos
   */
  static getPermissionsByRole(rol) {
    const permisos = {
      admin: [
        // Gestión completa de usuarios y sistema
        'usuarios.crear',
        'usuarios.editar', 
        'usuarios.eliminar',
        'usuarios.listar',
        'proveedores.crear',
        'proveedores.editar',
        'proveedores.listar',
        'sitios.crear',
        'sitios.editar',
        'sitios.listar',
        'auditorias.crear',
        'auditorias.editar',
        'auditorias.listar',
        'auditorias.asignar',
        'documentos.ver_todos',
        'reportes.ver_todos',
        'bitacora.ver',
        'configuracion.editar',
        'pliegos.gestionar',
        'flujos.definir',
        'sistema.configurar',
        'asignacion.masiva'
      ],
      'auditor_general': [
        // Supervisión y coordinación general de auditorías
        'cronogramas.definir',
        'auditores.asignar',
        'auditorias.supervisar',
        'informes.aprobar',
        'auditorias.listar_todas',
        'reportes.generar',
        'dashboards.ver_completos',
        'comunicacion.proveedor',
        'comunicacion.auditor_interno',
        'pliegos.gestionar_especifico',
        'auditorias.historicas'
      ],
      'auditor_interno': [
        // Evaluación de auditorías asignadas
        'auditorias.listar_asignadas',
        'documentos.revisar',
        'documentos.evaluar',
        'observaciones.crear',
        'comunicacion.proveedor',
        'reportes.generar_asignadas',
        'evaluaciones.registrar',
        'solicitudes.aclaracion'
      ],
      'jefe_proveedor': [
        // Gestión a nivel empresa proveedora
        'documentos.cargar_empresa',
        'documentos.revisar_tecnicos',
        'documentos.aprobar',
        'documentos.rechazar',
        'auditorias.ver_empresa',
        'comunicacion.auditores',
        'tecnicos.supervisar',
        'reportes.ver_empresa'
      ],
      'tecnico_proveedor': [
        // Carga de sitios específicos asignados
        'documentos.cargar_asignados',
        'documentos.revisar_propios',
        'auditorias.ver_asignadas',
        'comunicacion.auditores_sitio',
        'reportes.ver_sitio'
      ],
      'visualizador': [
        // Solo visualización de dashboards ejecutivos
        'dashboards.ver',
        'reportes.ver_ejecutivos',
        'metricas.consultar',
        'filtros.aplicar',
        'informes.exportar_dashboard'
      ]
    };

    return permisos[rol] || [];
  }

  /**
   * Verificar si usuario tiene un permiso específico
   * @param {string} rol - Rol del usuario
   * @param {string} permiso - Permiso a verificar
   * @returns {boolean} True si tiene el permiso
   */
  static hasPermission(rol, permiso) {
    const permisos = this.getPermissionsByRole(rol);
    return permisos.includes(permiso);
  }

  /**
   * Obtener roles disponibles según el contexto
   * @returns {Object} Roles organizados por categorías
   */
  static getAvailableRoles() {
    return {
      administracion: ['admin'],
      auditores: ['auditor_general', 'auditor_interno'],
      proveedores: ['jefe_proveedor', 'tecnico_proveedor'],
      visualizacion: ['visualizador']
    };
  }

  /**
   * Validar jerarquía de roles para creación de usuarios
   * @param {string} rolCreador - Rol del usuario que crea
   * @param {string} rolNuevo - Rol que se quiere asignar
   * @returns {boolean} True si puede crear ese rol
   */
  static canCreateRole(rolCreador, rolNuevo) {
    const jerarquia = {
      'admin': ['admin', 'auditor_general', 'auditor_interno', 'jefe_proveedor', 'tecnico_proveedor', 'visualizador'],
      'auditor_general': ['auditor_interno'],
      'jefe_proveedor': ['tecnico_proveedor']
    };

    return jerarquia[rolCreador]?.includes(rolNuevo) || false;
  }