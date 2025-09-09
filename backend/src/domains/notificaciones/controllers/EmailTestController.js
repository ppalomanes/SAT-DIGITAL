/**
 * SAT-Digital Backend - Controlador de Testing de Emails
 * Sistema de pruebas para templates de email
 */

const EmailService = require('../services/EmailService');
const logger = require('../../../shared/utils/logger');

class EmailTestController {
  
  /**
   * Obtener lista de templates disponibles
   */
  async obtenerTemplates(req, res) {
    try {
      const templates = await EmailService.getAvailableTemplates();
      
      res.json({
        success: true,
        data: {
          templates,
          total: templates.length
        }
      });
    } catch (error) {
      logger.error('Error obteniendo templates:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo lista de templates',
        error: error.message
      });
    }
  }

  /**
   * Probar template específico
   */
  async probarTemplate(req, res) {
    try {
      const { template, email } = req.params;
      const { sampleData } = req.body;

      // Datos de ejemplo por defecto
      const defaultSampleData = {
        destinatario: 'Usuario de Prueba',
        titulo_notificacion: 'Prueba de Template',
        mensaje_principal: 'Este es un email de prueba del sistema SAT-Digital.',
        auditoria: {
          codigo: 'AUD-2024-001',
          sitio: 'Sitio de Prueba',
          proveedor: 'Proveedor de Prueba',
          periodo: 'Noviembre 2024'
        },
        fecha_limite: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR'),
        dias_restantes: 7,
        cta_url: `${process.env.FRONTEND_URL || 'http://localhost:3012'}/dashboard`,
        cta_texto: 'Acceder al Sistema'
      };

      const mergedData = { ...defaultSampleData, ...sampleData };

      const result = await EmailService.testEmailTemplate(template, email, mergedData);

      if (result.success) {
        res.json({
          success: true,
          message: `Template ${template} enviado exitosamente`,
          data: {
            template: result.templateName,
            messageId: result.messageId,
            previewUrl: result.previewUrl,
            sentTo: email
          }
        });
      } else {
        res.status(400).json({
          success: false,
          message: `Error enviando template ${template}`,
          error: result.error
        });
      }
    } catch (error) {
      logger.error('Error probando template:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno probando template',
        error: error.message
      });
    }
  }

  /**
   * Probar todos los templates disponibles
   */
  async probarTodosTemplates(req, res) {
    try {
      const { email } = req.params;
      
      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email de destino es requerido'
        });
      }

      const templates = await EmailService.getAvailableTemplates();
      const results = [];

      // Datos de ejemplo diferentes para cada tipo de template
      const templateSamples = {
        'notificacion-general': {
          titulo_notificacion: 'Notificación General de Prueba',
          mensaje_principal: 'Este es un mensaje de notificación general.',
          detalles_importantes: [
            { nombre: 'Fecha', valor: new Date().toLocaleDateString('es-AR') },
            { nombre: 'Sistema', valor: 'SAT-Digital v1.0' }
          ]
        },
        'cambio-estado-auditoria': {
          auditoria: {
            codigo: 'AUD-TEST-001',
            sitio: 'Centro de Datos Principal',
            proveedor: 'Grupo Activo SRL',
            periodo: 'Noviembre 2024'
          },
          estado_anterior: 'programada',
          estado_actual: 'en_carga',
          estado_anterior_class: 'programada',
          estado_actual_class: 'en-carga'
        },
        'recordatorio-documentos': {
          auditoria: {
            codigo: 'AUD-TEST-002',
            sitio: 'Sitio Secundario',
            proveedor: 'CityTech S.A.',
            periodo: 'Noviembre 2024'
          },
          fecha_limite: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR'),
          dias_restantes: 5,
          secciones_pendientes: [
            {
              numero: '1',
              nombre: 'Red y Topología',
              descripcion: 'Documentos de infraestructura de red',
              documentos_subidos: 2,
              documentos_requeridos: 5
            }
          ],
          progreso_general: 40,
          documentos_subidos_total: 8,
          documentos_requeridos_total: 20
        }
      };

      // Probar cada template con un pequeño delay
      for (let i = 0; i < templates.length; i++) {
        const template = templates[i];
        const sampleData = templateSamples[template.name] || {};
        
        const result = await EmailService.testEmailTemplate(
          template.name, 
          email, 
          {
            destinatario: 'Usuario de Prueba',
            titulo: `Test Template: ${template.name}`,
            ...sampleData
          }
        );
        
        results.push({
          template: template.name,
          success: result.success,
          error: result.error || null,
          messageId: result.messageId || null
        });

        // Delay de 500ms entre emails para evitar rate limiting
        if (i < templates.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      res.json({
        success: true,
        message: `Prueba completada: ${successful} exitosos, ${failed} fallidos`,
        data: {
          total: templates.length,
          successful,
          failed,
          results,
          sentTo: email
        }
      });
    } catch (error) {
      logger.error('Error probando todos los templates:', error);
      res.status(500).json({
        success: false,
        message: 'Error probando templates',
        error: error.message
      });
    }
  }

  /**
   * Envío masivo de prueba
   */
  async pruebaEnvioMasivo(req, res) {
    try {
      const { emails, template, data } = req.body;

      if (!emails || !Array.isArray(emails) || emails.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Lista de emails es requerida'
        });
      }

      if (!template) {
        return res.status(400).json({
          success: false,
          message: 'Template es requerido'
        });
      }

      // Limitar a máximo 20 emails para prueba
      const limitedEmails = emails.slice(0, 20);
      
      const emailList = limitedEmails.map((email, index) => ({
        email,
        data: {
          destinatario: `Usuario de Prueba ${index + 1}`,
          numero_prueba: index + 1,
          ...data
        }
      }));

      const result = await EmailService.sendBulkEmails(
        emailList,
        template,
        {
          titulo: 'Prueba de Envío Masivo',
          mensaje_principal: 'Este es un email de prueba del sistema de envío masivo.',
          ...data
        },
        {
          batchSize: 5,
          delayBetweenBatches: 2000,
          maxRetries: 2
        }
      );

      res.json({
        success: true,
        message: 'Envío masivo completado',
        data: {
          template,
          totalEmails: limitedEmails.length,
          sent: result.sent,
          failed: result.failed,
          errors: result.errors
        }
      });
    } catch (error) {
      logger.error('Error en prueba de envío masivo:', error);
      res.status(500).json({
        success: false,
        message: 'Error en envío masivo',
        error: error.message
      });
    }
  }

  /**
   * Verificar configuración SMTP
   */
  async verificarConfiguracion(req, res) {
    try {
      const config = {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        user: process.env.SMTP_USER ? '***configurado***' : 'no configurado',
        pass: process.env.SMTP_PASS ? '***configurado***' : 'no configurado',
        from: process.env.SMTP_FROM
      };

      let connectionStatus = 'no verificado';
      try {
        await EmailService.transporter.verify();
        connectionStatus = 'conectado';
      } catch (error) {
        connectionStatus = `error: ${error.message}`;
      }

      res.json({
        success: true,
        data: {
          configuration: config,
          connectionStatus,
          templatesDirectory: 'templates/',
          environment: process.env.NODE_ENV
        }
      });
    } catch (error) {
      logger.error('Error verificando configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error verificando configuración',
        error: error.message
      });
    }
  }
}

module.exports = new EmailTestController();