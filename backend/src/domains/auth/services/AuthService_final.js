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
}

module.exports = AuthService;
