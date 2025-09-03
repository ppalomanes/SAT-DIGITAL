-- Tablas para Sistema de Comunicación Asíncrona
-- Checkpoint 2.3: Chat contextual y notificaciones

-- Tabla de conversaciones
CREATE TABLE conversaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    auditoria_id INT NOT NULL,
    seccion_id INT NULL,
    titulo VARCHAR(255) NOT NULL,
    categoria ENUM('tecnico', 'administrativo', 'solicitud', 'problema') DEFAULT 'tecnico',
    estado ENUM('abierta', 'en_proceso', 'respondida', 'cerrada') DEFAULT 'abierta',
    prioridad ENUM('baja', 'normal', 'alta') DEFAULT 'normal',
    iniciada_por INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (auditoria_id) REFERENCES auditorias(id),
    FOREIGN KEY (seccion_id) REFERENCES secciones_tecnicas(id),
    FOREIGN KEY (iniciada_por) REFERENCES usuarios(id)
);

-- Tabla de mensajes
CREATE TABLE mensajes (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    conversacion_id INT NOT NULL,
    usuario_id INT NOT NULL,
    contenido TEXT NOT NULL,
    tipo_mensaje ENUM('texto', 'archivo', 'sistema') DEFAULT 'texto',
    archivo_adjunto VARCHAR(500) NULL,
    referencia_documento_id INT NULL,
    responde_a_mensaje_id BIGINT NULL,
    estado_mensaje ENUM('enviado', 'leido', 'respondido') DEFAULT 'enviado',
    ip_origen VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (referencia_documento_id) REFERENCES documentos(id),
    FOREIGN KEY (responde_a_mensaje_id) REFERENCES mensajes(id),
    INDEX idx_conversacion_fecha (conversacion_id, created_at),
    INDEX idx_usuario_fecha (usuario_id, created_at)
);

-- Tabla de notificaciones personalizadas
CREATE TABLE notificaciones_usuario (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    tipo_notificacion ENUM('mensaje_nuevo', 'respuesta_recibida', 'estado_cambiado', 'plazo_venciendo') NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    contenido TEXT NOT NULL,
    enlace_accion VARCHAR(500),
    leida BOOLEAN DEFAULT FALSE,
    leida_en TIMESTAMP NULL,
    data_adicional JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    INDEX idx_usuario_leida (usuario_id, leida, created_at)
);
