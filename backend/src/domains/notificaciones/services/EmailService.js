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
      const templatePath = path.join(__dirname, '../templates', `${templateName}.html`);
      const templateContent = await fs.readFile(templatePath, 'utf8');
      const template = handlebars.compile(templateContent);
      return template(data);
    } catch (error) {
      logger.error(`Error cargando template ${templateName}:`, error);
      return null;
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
   * Enviar resumen diario para auditores
   */
  async enviarResumenDiario(auditor, resumenData) {
    return await this.sendEmail({
      to: auditor.email,
      subject: `📊 Resumen Diario - ${new Date().toLocaleDateString()}`,
      template: 'resumen-diario',
      data: {
        auditor: auditor.nombre,
        fecha: new Date(),
        auditoriasPendientes: resumenData.auditoriasPendientes,
        mensajesNoLeidos: resumenData.mensajesNoLeidos,
        proximasVisitas: resumenData.proximasVisitas,
        alertasCriticas: resumenData.alertasCriticas
      }
    });
  }
}

module.exports = new EmailService();
