// backend/src/domains/notificaciones/services/EmailService.js
const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const fs = require('fs').promises;
const path = require('path');
const logger = require('../../../shared/utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initialize();
  }

  /**
   * Inicializar transportador de email
   */
  async initialize() {
    try {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      await this.transporter.verify();
      logger.info('✅ EmailService inicializado correctamente');
    } catch (error) {
      logger.error('❌ Error inicializando EmailService:', error);
      // En desarrollo, usar transporter de prueba
      this.transporter = nodemailer.createTestAccount().then(account => {
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: account.user,
            pass: account.pass
          }
        });
      });
    }
  }

  /**
   * Cargar y compilar template de email
   */
  async loadTemplate(templateName, data) {
    try {
      // Cargar template base
      const basePath = path.join(__dirname, '../templates', 'base.hbs');
      const baseContent = await fs.readFile(basePath, 'utf8');
      
      // Cargar template específico
      const templatePath = path.join(__dirname, '../templates', `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      
      // Registrar helpers de handlebars
      handlebars.registerHelper('eq', function(a, b) {
        return a === b;
      });
      
      handlebars.registerHelper('lt', function(a, b) {
        return a < b;
      });
      
      handlebars.registerHelper('if', function(conditional, options) {
        if (conditional) {
          return options.fn(this);
        }
        return options.inverse(this);
      });

      // Preparar datos con información adicional
      const templateData = {
        ...data,
        fecha_envio: new Date().toLocaleString('es-AR'),
        base_url: process.env.FRONTEND_URL || 'http://localhost:5173'
      };
      
      // Compilar template específico
      const contentTemplate = handlebars.compile(templateContent);
      const compiledContent = contentTemplate(templateData);
      
      // Compilar template base con el contenido
      const baseTemplate = handlebars.compile(baseContent);
      const finalHtml = baseTemplate({
        ...templateData,
        contenido: compiledContent
      });
      
      return finalHtml;
    } catch (error) {
      logger.error(`Error cargando template ${templateName}:`, error);
      
      // Fallback a template simple
      return `
        <html>
          <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2>${data.titulo || 'Notificación SAT Digital'}</h2>
            <p>Ha ocurrido un evento en el sistema que requiere su atención.</p>
            <p><a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Acceder al Sistema</a></p>
            <hr>
            <small>Este es un mensaje automático del Sistema SAT Digital</small>
          </body>
        </html>
      `;
    }
  }

  /**
   * Enviar email con template
   */
  async sendEmail(options) {
    try {
      if (!this.transporter) {
        await this.initialize();
      }

      const emailOptions = {
        from: process.env.SMTP_FROM || 'SAT-Digital <noreply@satdigital.com>',
        to: options.to,
        subject: options.subject,
        html: options.html || await this.loadTemplate(options.template, options.data),
        attachments: options.attachments || []
      };

      const result = await this.transporter.sendMail(emailOptions);
      
      logger.info(`✅ Email enviado a ${options.to}: ${options.subject}`);
      return {
        success: true,
        messageId: result.messageId,
        preview: nodemailer.getTestMessageUrl(result)
      };

    } catch (error) {
      logger.error('❌ Error enviando email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Enviar notificación de inicio de período
   */
  async notificarInicioPeriodo(proveedor, auditoria, fechaLimite) {
    return await this.sendEmail({
      to: proveedor.email_contacto,
      subject: `📋 Nueva Auditoría Técnica - ${auditoria.sitio.nombre}`,
      template: 'inicio-periodo',
      data: {
        proveedor: proveedor.razon_social,
        sitio: auditoria.sitio.nombre,
        periodo: auditoria.periodo,
        fechaLimite: fechaLimite,
        enlaceAcceso: `${process.env.FRONTEND_URL}/auditorias/${auditoria.id}`,
        contactoSoporte: process.env.EMAIL_SOPORTE || 'soporte@satdigital.com'
      }
    });
  }

  /**
   * Enviar recordatorio de tiempo límite
   */
  async recordatorioTiempoLimite(proveedor, auditoria, diasRestantes) {
    const urgencia = diasRestantes <= 1 ? 'urgente' : diasRestantes <= 3 ? 'importante' : 'recordatorio';
    
    return await this.sendEmail({
      to: proveedor.email_contacto,
      subject: `⏰ ${diasRestantes === 1 ? 'ÚLTIMO DÍA' : `${diasRestantes} días restantes`} - Auditoría ${auditoria.sitio.nombre}`,
      template: 'recordatorio-tiempo-limite',
      data: {
        proveedor: proveedor.razon_social,
        sitio: auditoria.sitio.nombre,
        diasRestantes,
        urgencia,
        fechaLimite: auditoria.fecha_limite_carga,
        enlaceAcceso: `${process.env.FRONTEND_URL}/auditorias/${auditoria.id}`,
        seccionesPendientes: auditoria.secciones_pendientes || []
      }
    });
  }

  /**
   * Notificar nuevo mensaje en chat
   */
  async notificarNuevoMensaje(destinatario, conversacion, mensaje) {
    return await this.sendEmail({
      to: destinatario.email,
      subject: `💬 Nuevo mensaje - ${conversacion.titulo}`,
      template: 'nuevo-mensaje',
      data: {
        destinatario: destinatario.nombre,
        remitente: mensaje.usuario.nombre,
        conversacion: conversacion.titulo,
        sitio: conversacion.auditoria.sitio.nombre,
        mensaje: mensaje.contenido.substring(0, 200),
        enlaceConversacion: `${process.env.FRONTEND_URL}/auditorias/${conversacion.auditoria_id}/chat/${conversacion.id}`
      }
    });
  }

  /**
   * Notificar cambio de estado de auditoría
   */
  async notificarCambioEstado(usuarios, auditoria, estadoAnterior, estadoNuevo) {
    const promises = usuarios.map(usuario => 
      this.sendEmail({
        to: usuario.email,
        subject: `🔄 Estado actualizado - ${auditoria.sitio.nombre}`,
        template: 'cambio-estado',
        data: {
          usuario: usuario.nombre,
          sitio: auditoria.sitio.nombre,
          estadoAnterior,
          estadoNuevo,
          fecha: new Date(),
          enlaceAuditoria: `${process.env.FRONTEND_URL}/auditorias/${auditoria.id}`
        }
      })
    );

    return await Promise.allSettled(promises);
  }

  /**
   * Notificación de vencimiento de auditoría
   */
  async enviarNotificacionVencimiento(auditorId, auditoriaId) {
    try {
      const { Usuario, Auditoria, Sitio, Proveedor } = require('../../../shared/database/models');
      
      const auditor = await Usuario.findByPk(auditorId);
      const auditoria = await Auditoria.findByPk(auditoriaId, {
        include: [{
          model: Sitio,
          as: 'sitio',
          include: [{
            model: Proveedor,
            as: 'proveedor'
          }]
        }]
      });

      if (!auditor || !auditoria) {
        throw new Error('Auditor o auditoría no encontrados');
      }

      return await this.sendEmail({
        to: auditor.email,
        subject: `⏰ AUDITORÍA VENCIDA - ${auditoria.sitio.nombre}`,
        template: 'auditoria-vencida',
        data: {
          auditor: auditor.nombre,
          sitio: auditoria.sitio.nombre,
          proveedor: auditoria.sitio.proveedor.razon_social,
          fechaLimite: auditoria.fecha_limite_carga,
          enlaceAuditoria: `${process.env.FRONTEND_URL}/auditorias/${auditoria.id}/revision`
        }
      });
    } catch (error) {
      logger.error('Error enviando notificación de vencimiento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Notificación de transición automática de estado
   */
  async notificarTransicionAutomatica(auditoria, estadoAnterior, estadoNuevo, motivo) {
    try {
      const { AsignacionAuditor, Usuario, SeccionTecnica } = require('../../../shared/database/models');
      
      // Obtener auditor asignado
      const asignacion = await AsignacionAuditor.findOne({
        where: { auditoria_id: auditoria.id },
        include: [{
          model: Usuario,
          as: 'auditor',
          attributes: ['id', 'email', 'nombre']
        }]
      });

      if (!asignacion) {
        return { success: false, error: 'No hay auditor asignado' };
      }

      // Obtener información adicional según el estado
      let datosAdicionales = {};
      
      if (estadoNuevo === 'en_carga') {
        const secciones = await SeccionTecnica.count({
          where: { obligatoria: true, estado: 'activa' }
        });
        datosAdicionales.secciones_obligatorias = secciones;
      }

      const subject = `🔄 Estado Automático Actualizado - ${auditoria.sitio?.nombre}`;
      
      return await this.sendEmail({
        to: asignacion.auditor.email,
        subject,
        template: 'transicion-automatica',
        data: {
          titulo: 'Cambio Automático de Estado',
          auditoria: {
            id: auditoria.id,
            sitio: { nombre: auditoria.sitio?.nombre || 'Sitio' },
            periodo: { nombre: auditoria.periodo?.nombre || 'Período Actual' }
          },
          auditor: {
            nombre: asignacion.auditor.nombre,
            email: asignacion.auditor.email
          },
          estado_anterior: estadoAnterior,
          nuevo_estado: estadoNuevo,
          motivo: motivo,
          timestamp_formato: new Date().toLocaleString('es-AR'),
          fecha_limite_formato: auditoria.fecha_limite_carga ? 
            new Date(auditoria.fecha_limite_carga).toLocaleDateString('es-AR') : 'No definida',
          ...datosAdicionales
        }
      });
    } catch (error) {
      logger.error('Error enviando notificación de transición:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar recordatorio de vencimiento con template mejorado
   */
  async enviarRecordatorioVencimiento(auditoria, progreso, diasRestantes, seccionesFaltantes, auditor) {
    try {
      const subject = diasRestantes <= 1 ? 
        `🚨 ÚLTIMO DÍA - ${auditoria.sitio.nombre}` :
        `⏰ ${diasRestantes} días restantes - ${auditoria.sitio.nombre}`;

      return await this.sendEmail({
        to: auditoria.sitio.proveedor.email_contacto || auditor.email,
        subject,
        template: 'recordatorio-vencimiento',
        data: {
          titulo: 'Recordatorio de Vencimiento',
          auditoria: {
            id: auditoria.id,
            sitio: { 
              nombre: auditoria.sitio.nombre,
              proveedor: { nombre: auditoria.sitio.proveedor.razon_social }
            },
            periodo: { nombre: auditoria.periodo?.nombre || 'Período Actual' },
            estado: auditoria.estado
          },
          fecha_limite_formato: new Date(auditoria.fecha_limite_carga).toLocaleDateString('es-AR'),
          dias_restantes: diasRestantes,
          progreso,
          secciones_faltantes: seccionesFaltantes,
          auditor: {
            nombre: auditor.nombre,
            email: auditor.email
          },
          ultima_actualizacion: new Date().toLocaleString('es-AR')
        }
      });
    } catch (error) {
      logger.error('Error enviando recordatorio de vencimiento:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar resumen diario para auditores
   */
  async enviarResumenDiario(usuario, datosResumen) {
    try {
      return await this.sendEmail({
        to: usuario.email,
        subject: `📊 Resumen Diario SAT Digital - ${new Date().toLocaleDateString('es-AR')}`,
        template: 'resumen-diario',
        data: {
          titulo: 'Resumen Diario de Actividades',
          fecha_resumen: new Date().toLocaleDateString('es-AR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          usuario: {
            nombre: usuario.nombre,
            rol: usuario.rol,
            proveedor: usuario.proveedor ? { nombre: usuario.proveedor.razon_social } : null
          },
          metricas: datosResumen.metricas || {},
          alertas_importantes: datosResumen.alertas || [],
          auditorias_resumen: datosResumen.auditorias || [],
          mensajes_pendientes: datosResumen.mensajesPendientes || [],
          tareas_recomendadas: datosResumen.tareasRecomendadas || [
            'Revisar auditorías próximas a vencer',
            'Responder mensajes pendientes en el chat',
            'Verificar documentos cargados recientemente',
            'Actualizar el estado de auditorías en progreso'
          ],
          proximos_vencimientos: datosResumen.proximosVencimientos || [],
          consejo_diario: datosResumen.consejo || 'Mantenga una comunicación fluida con los proveedores para agilizar el proceso de auditoría.'
        }
      });
    } catch (error) {
      logger.error('Error enviando resumen diario:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar resumen semanal para administradores
   */
  async enviarResumenSemanal(emailAdmin, resumen) {
    return await this.sendEmail({
      to: emailAdmin,
      subject: `📊 Resumen Semanal SAT-Digital - ${new Date().toLocaleDateString()}`,
      template: 'resumen-semanal',
      data: {
        fecha: new Date(),
        totalAuditorias: resumen.totalAuditorias,
        documentosSubidos: resumen.documentosSubidos,
        mensajesEnviados: resumen.mensajesEnviados,
        auditoriasPorEstado: resumen.auditoriasPorEstado
      }
    });
  }

  /**
   * Enviar alerta urgente (24 horas)
   */
  async enviarAlertaUrgente(email, auditoria) {
    return await this.sendEmail({
      to: email,
      subject: `🚨 URGENTE: Auditoría vence en menos de 24 horas - ${auditoria.sitio.nombre}`,
      template: 'alerta-urgente',
      data: {
        sitio: auditoria.sitio.nombre,
        proveedor: auditoria.proveedor?.nombre_comercial || auditoria.sitio.proveedor.nombre_comercial,
        fechaLimite: auditoria.fecha_limite_carga,
        enlaceAuditoria: `${process.env.FRONTEND_URL}/auditorias/${auditoria.id}`
      }
    });
  }

  /**
   * Enviar alerta previa (72 horas)
   */
  async enviarAlertaPrevia(email, auditoria) {
    return await this.sendEmail({
      to: email,
      subject: `⚠️  Recordatorio: Auditoría vence en 3 días - ${auditoria.sitio.nombre}`,
      template: 'alerta-previa',
      data: {
        sitio: auditoria.sitio.nombre,
        proveedor: auditoria.proveedor?.nombre_comercial || auditoria.sitio.proveedor.nombre_comercial,
        fechaLimite: auditoria.fecha_limite_carga,
        enlaceAuditoria: `${process.env.FRONTEND_URL}/auditorias/${auditoria.id}`
      }
    });
  }

  /**
   * Enviar recordatorio de documentos pendientes
   */
  async enviarRecordatorioDocumentos(email, auditoria, porcentaje) {
    return await this.sendEmail({
      to: email,
      subject: `📄 Recordatorio: Documentos pendientes - ${auditoria.sitio.nombre} (${porcentaje}% completada)`,
      template: 'recordatorio-documentos',
      data: {
        sitio: auditoria.sitio.nombre,
        proveedor: auditoria.proveedor?.nombre_comercial || auditoria.sitio.proveedor.nombre_comercial,
        porcentaje,
        fechaLimite: auditoria.fecha_limite_carga,
        enlaceAuditoria: `${process.env.FRONTEND_URL}/auditorias/${auditoria.id}`
      }
    });
  }

  /**
   * Enviar recordatorio de próxima visita
   */
  async enviarRecordatorioVisita(email, auditoria) {
    const fechaVisita = new Date(auditoria.fecha_visita).toLocaleDateString('es-AR');
    
    return await this.sendEmail({
      to: email,
      subject: `🗓️  Recordatorio: Visita programada - ${auditoria.sitio.nombre}`,
      template: 'recordatorio-visita',
      data: {
        sitio: auditoria.sitio.nombre,
        proveedor: auditoria.proveedor?.nombre_comercial || auditoria.sitio.proveedor.nombre_comercial,
        fechaVisita,
        auditor: auditoria.auditor?.nombre,
        enlaceAuditoria: `${process.env.FRONTEND_URL}/auditorias/${auditoria.id}`
      }
    });
  }
}

module.exports = new EmailService();
