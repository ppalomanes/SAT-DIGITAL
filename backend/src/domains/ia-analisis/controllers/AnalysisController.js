const OllamaService = require('../services/OllamaService');
const DocumentAnalysisService = require('../services/DocumentAnalysisService');
const QueueService = require('../services/QueueService');
const logger = require('../../../shared/utils/logger');
const { AnalisisIA, Documento, SeccionTecnica, Auditoria } = require('../../../shared/database/models');
const path = require('path');

class AnalysisController {
    constructor() {
        this.ollamaService = new OllamaService();
        this.documentAnalysisService = new DocumentAnalysisService();
        this.queueService = new QueueService();
    }

    // Health check de Ollama
    async checkOllamaHealth(req, res) {
        try {
            logger.info('🔍 Verificando estado de Ollama', {
                ip: req.ip,
                service: 'ia-analisis'
            });

            const isHealthy = await this.ollamaService.checkHealth();
            const models = await this.ollamaService.listModels();
            
            res.json({
                success: true,
                status: isHealthy ? 'connected' : 'disconnected',
                models: models.models || [],
                timestamp: new Date()
            });

        } catch (error) {
            logger.error('❌ Error verificando Ollama', {
                error: error.message,
                service: 'ia-analisis'
            });
            
            res.status(503).json({
                success: false,
                error: 'Ollama service unavailable',
                message: error.message
            });
        }
    }

    // Analizar documento individual
    async analyzeDocument(req, res) {
        try {
            const { documento_id } = req.params;
            const { force_reanalysis = false } = req.query;

            logger.info('📄 Iniciando análisis de documento', {
                documento_id,
                force_reanalysis,
                usuario_id: req.user.id,
                service: 'ia-analisis'
            });

            // Verificar que el documento existe
            const documento = await Documento.findByPk(documento_id, {
                include: [
                    { model: SeccionTecnica, as: 'seccion' },
                    { model: Auditoria, as: 'auditoria' }
                ]
            });

            if (!documento) {
                return res.status(404).json({
                    success: false,
                    error: 'Documento no encontrado'
                });
            }

            // Verificar si ya tiene análisis y no se fuerza re-análisis
            if (documento.analisis_ia_completado && !force_reanalysis) {
                const analisisExistente = await AnalisisIA.findOne({
                    where: { documento_id, estado: 'completado' },
                    order: [['fecha_creacion', 'DESC']]
                });

                if (analisisExistente) {
                    return res.json({
                        success: true,
                        message: 'Documento ya tiene análisis previo',
                        analysis: analisisExistente,
                        reanalyzed: false
                    });
                }
            }

            // Agregar trabajo a la cola de análisis
            const job = await this.queueService.addDocumentAnalysisJob({
                filePath: documento.ruta_almacenamiento,
                seccionTecnica: documento.seccion.nombre,
                metadata: {
                    fileName: documento.nombre_original,
                    fileType: documento.tipo_archivo,
                    documentId: documento.id
                },
                auditoria_id: documento.auditoria_id,
                documento_id: documento.id
            });

            logger.info('✅ Job de análisis agregado', {
                jobId: job.id,
                documento_id,
                service: 'ia-analisis'
            });

            res.json({
                success: true,
                message: 'Análisis iniciado',
                jobId: job.id,
                estimatedTime: '2-5 minutos',
                documento: {
                    id: documento.id,
                    nombre: documento.nombre_original,
                    seccion: documento.seccion.nombre
                }
            });

        } catch (error) {
            logger.error('❌ Error iniciando análisis de documento', {
                documento_id: req.params.documento_id,
                error: error.message,
                service: 'ia-analisis'
            });

            res.status(500).json({
                success: false,
                error: 'Error iniciando análisis',
                message: error.message
            });
        }
    }

    // Análisis en lote por auditoría
    async analyzeBatchByAuditoria(req, res) {
        try {
            const { auditoria_id } = req.params;
            const { secciones = [], force_reanalysis = false } = req.body;

            logger.info('📦 Iniciando análisis en lote por auditoría', {
                auditoria_id,
                secciones: secciones.length,
                force_reanalysis,
                usuario_id: req.user.id,
                service: 'ia-analisis'
            });

            // Buscar documentos de la auditoría
            const whereConditions = { auditoria_id };
            if (secciones.length > 0) {
                whereConditions.seccion_id = secciones;
            }
            if (!force_reanalysis) {
                whereConditions.analisis_ia_completado = false;
            }

            const documentos = await Documento.findAll({
                where: whereConditions,
                include: [
                    { model: SeccionTecnica, as: 'seccion' }
                ]
            });

            if (documentos.length === 0) {
                return res.json({
                    success: true,
                    message: 'No hay documentos pendientes de análisis',
                    count: 0
                });
            }

            // Preparar datos para el trabajo en lote
            const documentsData = documentos.map(doc => ({
                filePath: doc.ruta_almacenamiento,
                metadata: {
                    fileName: doc.nombre_original,
                    fileType: doc.tipo_archivo,
                    documentId: doc.id
                },
                documento_id: doc.id
            }));

            // Agregar trabajo en lote a la cola
            const job = await this.queueService.addBatchAnalysisJob({
                documents: documentsData,
                seccionTecnica: 'Análisis en lote',
                auditoria_id
            });

            logger.info('✅ Job de análisis en lote agregado', {
                jobId: job.id,
                auditoria_id,
                documentCount: documentos.length,
                service: 'ia-analisis'
            });

            res.json({
                success: true,
                message: 'Análisis en lote iniciado',
                jobId: job.id,
                documentCount: documentos.length,
                estimatedTime: `${Math.ceil(documentos.length * 2)} minutos`,
                documents: documentos.map(doc => ({
                    id: doc.id,
                    nombre: doc.nombre_original,
                    seccion: doc.seccion.nombre
                }))
            });

        } catch (error) {
            logger.error('❌ Error iniciando análisis en lote', {
                auditoria_id: req.params.auditoria_id,
                error: error.message,
                service: 'ia-analisis'
            });

            res.status(500).json({
                success: false,
                error: 'Error iniciando análisis en lote',
                message: error.message
            });
        }
    }

    // Obtener estado de job
    async getJobStatus(req, res) {
        try {
            const { job_id } = req.params;

            const status = await this.queueService.getJobStatus(job_id);
            
            if (!status) {
                return res.status(404).json({
                    success: false,
                    error: 'Job no encontrado'
                });
            }

            res.json({
                success: true,
                job: status
            });

        } catch (error) {
            logger.error('❌ Error obteniendo estado de job', {
                job_id: req.params.job_id,
                error: error.message,
                service: 'ia-analisis'
            });

            res.status(500).json({
                success: false,
                error: 'Error obteniendo estado de job',
                message: error.message
            });
        }
    }

    // Obtener estadísticas de la cola
    async getQueueStats(req, res) {
        try {
            const stats = await this.queueService.getQueueStats();

            res.json({
                success: true,
                stats,
                timestamp: new Date()
            });

        } catch (error) {
            logger.error('❌ Error obteniendo estadísticas de cola', {
                error: error.message,
                service: 'ia-analisis'
            });

            res.status(500).json({
                success: false,
                error: 'Error obteniendo estadísticas',
                message: error.message
            });
        }
    }

    // Obtener análisis de documento
    async getDocumentAnalysis(req, res) {
        try {
            const { documento_id } = req.params;

            const analisis = await AnalisisIA.findAll({
                where: { documento_id },
                include: [{
                    model: Documento,
                    as: 'documento',
                    attributes: ['nombre_original', 'tipo_archivo'],
                    include: [{
                        model: SeccionTecnica,
                        as: 'seccion',
                        attributes: ['nombre', 'descripcion']
                    }]
                }],
                order: [['fecha_creacion', 'DESC']]
            });

            if (analisis.length === 0) {
                return res.status(404).json({
                    success: false,
                    error: 'No se encontraron análisis para este documento'
                });
            }

            res.json({
                success: true,
                analisis,
                latest: analisis[0]
            });

        } catch (error) {
            logger.error('❌ Error obteniendo análisis de documento', {
                documento_id: req.params.documento_id,
                error: error.message,
                service: 'ia-analisis'
            });

            res.status(500).json({
                success: false,
                error: 'Error obteniendo análisis',
                message: error.message
            });
        }
    }

    // Obtener estadísticas de análisis por auditoría
    async getAuditoriaStats(req, res) {
        try {
            const { auditoria_id } = req.params;

            // Estadísticas generales
            const stats = await AnalisisIA.getEstadisticasPorAuditoria(auditoria_id);
            
            // Scores por sección
            const scoresPorSeccion = await AnalisisIA.getScoresPorSeccion(auditoria_id);

            // Documentos analizados vs total
            const totalDocumentos = await Documento.count({
                where: { auditoria_id }
            });

            const documentosAnalizados = await Documento.count({
                where: { 
                    auditoria_id,
                    analisis_ia_completado: true 
                }
            });

            res.json({
                success: true,
                stats: {
                    general: stats,
                    scoresPorSeccion,
                    progreso: {
                        total: totalDocumentos,
                        analizados: documentosAnalizados,
                        pendientes: totalDocumentos - documentosAnalizados,
                        porcentajeCompleto: Math.round((documentosAnalizados / totalDocumentos) * 100)
                    }
                },
                timestamp: new Date()
            });

        } catch (error) {
            logger.error('❌ Error obteniendo estadísticas de auditoría', {
                auditoria_id: req.params.auditoria_id,
                error: error.message,
                service: 'ia-analisis'
            });

            res.status(500).json({
                success: false,
                error: 'Error obteniendo estadísticas',
                message: error.message
            });
        }
    }

    // Test rápido de análisis
    async testAnalysis(req, res) {
        try {
            const { text, type = 'text' } = req.body;

            if (!text) {
                return res.status(400).json({
                    success: false,
                    error: 'Texto requerido para análisis'
                });
            }

            logger.info('🧪 Test de análisis', {
                type,
                textLength: text.length,
                usuario_id: req.user.id,
                service: 'ia-analisis'
            });

            let result;
            if (type === 'text') {
                result = await this.ollamaService.analyzeDocumentText(text, 'Test Section');
            } else {
                result = await this.ollamaService.analyzeDocumentImage(text, 'Test Section', 'test-image');
            }

            res.json({
                success: true,
                result,
                timestamp: new Date()
            });

        } catch (error) {
            logger.error('❌ Error en test de análisis', {
                error: error.message,
                service: 'ia-analisis'
            });

            res.status(500).json({
                success: false,
                error: 'Error en test de análisis',
                message: error.message
            });
        }
    }
}

module.exports = AnalysisController;