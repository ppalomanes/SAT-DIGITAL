// Middleware para Workflow Automático
// Checkpoint 2.9 - Sistema de Estados Automáticos
// Intercepta cambios relevantes y ejecuta transiciones automáticas

const WorkflowService = require('../../domains/audits/services/WorkflowService');
const logger = require('../utils/logger');

/**
 * Middleware que evalúa transiciones automáticas después de operaciones relevantes
 */
class WorkflowMiddleware {
  
  /**
   * Middleware para después de cargar documentos
   * Evalúa si debe cambiar de 'programada' a 'en_carga'
   * y de 'en_carga' a 'pendiente_evaluacion'
   */
  static async afterDocumentUpload(req, res, next) {
    // Solo aplicar si la respuesta fue exitosa
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const auditoriaId = req.params.auditoriaId || req.body.auditoria_id;
      const usuarioId = req.usuario?.id;

      if (auditoriaId) {
        try {
          // Ejecutar en background para no afectar la respuesta
          setImmediate(async () => {
            try {
              // Verificar transición programada -> en_carga
              await WorkflowService.verificarInicioCargar(auditoriaId, usuarioId);
              
              // Verificar transición en_carga -> pendiente_evaluacion
              await WorkflowService.verificarCargaCompleta(auditoriaId, usuarioId);
              
              // Emitir evento WebSocket para actualizar UI
              if (req.io) {
                req.io.emit('workflow_check', {
                  auditoriaId,
                  action: 'document_uploaded',
                  timestamp: new Date()
                });
              }
            } catch (error) {
              logger.error('Error en workflow automático después de cargar documento:', error);
            }
          });
        } catch (error) {
          logger.error('Error configurando workflow automático:', error);
        }
      }
    }
    
    next();
  }

  /**
   * Middleware para después de completar evaluación
   * Evalúa si debe cambiar de 'pendiente_evaluacion' a 'evaluada'
   */
  static async afterEvaluationComplete(req, res, next) {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const auditoriaId = req.params.auditoriaId || req.body.auditoria_id;
      const usuarioId = req.usuario?.id;

      if (auditoriaId) {
        setImmediate(async () => {
          try {
            // Cambiar a estado evaluada
            await WorkflowService.cambiarEstado(
              auditoriaId,
              WorkflowService.ESTADOS.EVALUADA,
              'Sistema - Transición automática por completar evaluación',
              usuarioId
            );

            if (req.io) {
              req.io.emit('workflow_check', {
                auditoriaId,
                action: 'evaluation_completed',
                timestamp: new Date()
              });
            }
          } catch (error) {
            logger.error('Error en workflow automático después de evaluación:', error);
          }
        });
      }
    }
    
    next();
  }

  /**
   * Middleware para verificaciones manuales de workflow
   */
  static async checkWorkflowStatus(req, res, next) {
    const auditoriaId = req.params.auditoriaId;
    
    if (auditoriaId) {
      try {
        const usuarioId = req.usuario?.id;
        
        // Verificar todas las transiciones posibles
        await WorkflowService.verificarInicioCargar(auditoriaId, usuarioId);
        await WorkflowService.verificarCargaCompleta(auditoriaId, usuarioId);
        
        logger.info(`Verificación manual de workflow para auditoría ${auditoriaId}`);
      } catch (error) {
        logger.error('Error en verificación manual de workflow:', error);
      }
    }
    
    next();
  }

  /**
   * Middleware para agregar información de progreso a las respuestas
   */
  static async addProgressInfo(req, res, next) {
    const originalSend = res.send;
    
    res.send = function(data) {
      // Solo procesar respuestas JSON exitosas
      if (res.statusCode >= 200 && res.statusCode < 300 && 
          res.getHeader('content-type')?.includes('application/json')) {
        try {
          let jsonData = typeof data === 'string' ? JSON.parse(data) : data;
          
          // Si la respuesta contiene datos de auditoría, agregar progreso
          if (jsonData.data && typeof jsonData.data === 'object') {
            const auditoriaId = jsonData.data.id || req.params.auditoriaId;
            
            if (auditoriaId) {
              // Ejecutar en background para no bloquear la respuesta
              setImmediate(async () => {
                try {
                  const progreso = await WorkflowService.obtenerMetricas();
                  
                  // Emitir progreso via WebSocket
                  if (req.io) {
                    req.io.emit('workflow_progress', {
                      auditoriaId,
                      metricas: progreso,
                      timestamp: new Date()
                    });
                  }
                } catch (error) {
                  logger.error('Error obteniendo progreso de workflow:', error);
                }
              });
            }
          }
          
          data = typeof data === 'string' ? JSON.stringify(jsonData) : jsonData;
        } catch (error) {
          // Si hay error parseando JSON, enviar data original
          logger.debug('No se pudo procesar respuesta para progreso:', error.message);
        }
      }
      
      originalSend.call(this, data);
    };
    
    next();
  }

  /**
   * Middleware para logging de cambios de estado
   */
  static async logStateChanges(req, res, next) {
    const auditoriaId = req.params.auditoriaId;
    const action = req.method + ' ' + req.path;
    
    if (auditoriaId) {
      logger.info(`Workflow Action: ${action} for auditoría ${auditoriaId}`, {
        usuario: req.usuario?.email,
        ip: req.ip,
        userAgent: req.get('User-Agent')
      });
    }
    
    next();
  }

  /**
   * Middleware para manejar errores de workflow
   */
  static handleWorkflowErrors(error, req, res, next) {
    if (error.message.includes('Transición inválida')) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_WORKFLOW_TRANSITION',
        message: error.message,
        currentState: error.currentState || null,
        attemptedState: error.attemptedState || null
      });
    }
    
    if (error.message.includes('workflow') || error.message.includes('estado')) {
      logger.error('Error de workflow:', error);
      return res.status(500).json({
        success: false,
        error: 'WORKFLOW_ERROR', 
        message: 'Error procesando cambio de estado automático'
      });
    }
    
    next(error);
  }

  /**
   * Factory para crear middleware específico por ruta
   */
  static createRouteSpecificMiddleware(options = {}) {
    const { 
      enableDocumentWorkflow = true,
      enableEvaluationWorkflow = true,
      enableProgressInfo = true,
      enableLogging = true
    } = options;

    const middlewares = [];
    
    if (enableLogging) {
      middlewares.push(this.logStateChanges);
    }
    
    if (enableProgressInfo) {
      middlewares.push(this.addProgressInfo);
    }
    
    return middlewares;
  }

  /**
   * Configurar middleware global de workflow
   */
  static setup(app) {
    // Middleware de logging para todas las rutas de auditorías
    app.use('/api/auditorias/*', this.logStateChanges);
    app.use('/api/documentos/*', this.logStateChanges);
    
    // Middleware de manejo de errores
    app.use(this.handleWorkflowErrors);
    
    logger.info('✅ Workflow Middleware configurado globalmente');
  }
}

module.exports = WorkflowMiddleware;