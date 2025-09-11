const Bull = require('bull');
const DocumentAnalysisService = require('./DocumentAnalysisService');
const logger = require('../../../shared/utils/logger');
const { Op } = require('sequelize');

class QueueService {
    constructor() {
        this.documentAnalysisQueue = new Bull('document-analysis', {
            redis: {
                host: process.env.REDIS_HOST || 'localhost',
                port: process.env.REDIS_PORT || 6379,
            },
            defaultJobOptions: {
                removeOnComplete: 50, // Mantener los últimos 50 trabajos completados
                removeOnFail: 100,    // Mantener los últimos 100 trabajos fallidos
                attempts: 3,          // Reintentar hasta 3 veces
                backoff: {
                    type: 'exponential',
                    delay: 5000,
                }
            }
        });

        this.documentAnalysisService = new DocumentAnalysisService();
        this.setupWorkers();
        this.setupEventListeners();
    }

    setupWorkers() {
        // Worker para análisis individual de documentos
        this.documentAnalysisQueue.process('analyze-document', 2, async (job) => {
            const { filePath, seccionTecnica, metadata, auditoria_id, documento_id } = job.data;
            
            logger.info('🔄 Procesando análisis de documento', {
                jobId: job.id,
                fileName: metadata?.fileName || 'unknown',
                seccionTecnica,
                service: 'ia-analisis'
            });

            try {
                // Actualizar progreso
                await job.progress(10);

                // Realizar análisis
                const result = await this.documentAnalysisService.analyzeDocument(
                    filePath,
                    seccionTecnica,
                    metadata
                );

                await job.progress(50);

                // Guardar resultados en base de datos
                if (documento_id) {
                    await this.saveAnalysisResults(documento_id, result);
                }

                await job.progress(90);

                // Notificar via WebSocket si hay auditoria_id
                if (auditoria_id) {
                    await this.notifyAnalysisComplete(auditoria_id, documento_id, result);
                }

                await job.progress(100);

                logger.info('✅ Análisis de documento completado', {
                    jobId: job.id,
                    fileName: result.fileName,
                    success: result.analysis?.success || false,
                    service: 'ia-analisis'
                });

                return result;

            } catch (error) {
                logger.error('❌ Error en análisis de documento', {
                    jobId: job.id,
                    error: error.message,
                    service: 'ia-analisis'
                });
                throw error;
            }
        });

        // Worker para análisis en lote
        this.documentAnalysisQueue.process('batch-analyze', 1, async (job) => {
            const { documents, seccionTecnica, auditoria_id } = job.data;
            
            logger.info('🔄 Procesando análisis en lote', {
                jobId: job.id,
                count: documents.length,
                seccionTecnica,
                service: 'ia-analisis'
            });

            try {
                const results = [];
                const total = documents.length;

                for (let i = 0; i < documents.length; i++) {
                    const doc = documents[i];
                    
                    // Actualizar progreso
                    const progress = Math.round((i / total) * 90);
                    await job.progress(progress);

                    // Analizar documento
                    const result = await this.documentAnalysisService.analyzeDocument(
                        doc.filePath,
                        seccionTecnica,
                        doc.metadata
                    );

                    results.push(result);

                    // Guardar en base de datos si hay documento_id
                    if (doc.documento_id) {
                        await this.saveAnalysisResults(doc.documento_id, result);
                    }

                    // Pequeña pausa entre análisis
                    await new Promise(resolve => setTimeout(resolve, 2000));
                }

                await job.progress(95);

                // Notificar completado via WebSocket
                if (auditoria_id) {
                    await this.notifyBatchAnalysisComplete(auditoria_id, results);
                }

                await job.progress(100);

                logger.info('✅ Análisis en lote completado', {
                    jobId: job.id,
                    total: results.length,
                    successful: results.filter(r => r.analysis?.success).length,
                    service: 'ia-analisis'
                });

                return {
                    results,
                    summary: {
                        total: results.length,
                        successful: results.filter(r => r.analysis?.success).length,
                        failed: results.filter(r => !r.analysis?.success).length
                    }
                };

            } catch (error) {
                logger.error('❌ Error en análisis en lote', {
                    jobId: job.id,
                    error: error.message,
                    service: 'ia-analisis'
                });
                throw error;
            }
        });
    }

    setupEventListeners() {
        this.documentAnalysisQueue.on('completed', (job, result) => {
            logger.info('✅ Job completado', {
                jobId: job.id,
                type: job.data.type || 'unknown',
                service: 'ia-analisis'
            });
        });

        this.documentAnalysisQueue.on('failed', (job, err) => {
            logger.error('❌ Job fallido', {
                jobId: job.id,
                error: err.message,
                attempts: job.attemptsMade,
                service: 'ia-analisis'
            });
        });

        this.documentAnalysisQueue.on('progress', (job, progress) => {
            logger.info('📊 Progreso de job', {
                jobId: job.id,
                progress: `${progress}%`,
                service: 'ia-analisis'
            });
        });
    }

    async addDocumentAnalysisJob(jobData, options = {}) {
        try {
            const job = await this.documentAnalysisQueue.add('analyze-document', jobData, {
                priority: options.priority || 0,
                delay: options.delay || 0,
                ...options
            });

            logger.info('📝 Job de análisis agregado', {
                jobId: job.id,
                fileName: jobData.metadata?.fileName,
                service: 'ia-analisis'
            });

            return job;
        } catch (error) {
            logger.error('❌ Error agregando job de análisis', {
                error: error.message,
                service: 'ia-analisis'
            });
            throw error;
        }
    }

    async addBatchAnalysisJob(jobData, options = {}) {
        try {
            const job = await this.documentAnalysisQueue.add('batch-analyze', jobData, {
                priority: options.priority || 0,
                delay: options.delay || 0,
                ...options
            });

            logger.info('📝 Job de análisis en lote agregado', {
                jobId: job.id,
                count: jobData.documents.length,
                service: 'ia-analisis'
            });

            return job;
        } catch (error) {
            logger.error('❌ Error agregando job de análisis en lote', {
                error: error.message,
                service: 'ia-analisis'
            });
            throw error;
        }
    }

    async saveAnalysisResults(documento_id, analysisResult) {
        try {
            const { Documento, AnalisisIA } = require('../../../shared/database/models');

            // Crear registro de análisis IA
            const analisis = await AnalisisIA.create({
                documento_id,
                modelo_ia: analysisResult.analysis?.model || 'ollama',
                tipo_analisis: analysisResult.fileExtension?.includes('image') ? 'vision' : 'text',
                resultado_ia: JSON.stringify(analysisResult.analysis?.response || {}),
                score_completitud: analysisResult.scores?.completitud,
                score_calidad: analysisResult.scores?.calidadTecnica,
                score_cumplimiento: analysisResult.scores?.cumplimiento,
                score_promedio: analysisResult.scores?.scorePromedio,
                tokens_utilizados: analysisResult.analysis?.tokens || 0,
                tiempo_procesamiento: analysisResult.analysis?.processingTime || null,
                estado: analysisResult.analysis?.success ? 'completado' : 'error',
                observaciones: analysisResult.error || null
            });

            // Actualizar documento con flag de análisis completado
            await Documento.update(
                { 
                    analisis_ia_completado: analysisResult.analysis?.success || false,
                    fecha_analisis_ia: new Date()
                },
                { where: { id: documento_id } }
            );

            logger.info('💾 Resultados de análisis guardados', {
                documento_id,
                analisis_id: analisis.id,
                success: analysisResult.analysis?.success,
                service: 'ia-analisis'
            });

        } catch (error) {
            logger.error('❌ Error guardando resultados de análisis', {
                documento_id,
                error: error.message,
                service: 'ia-analisis'
            });
        }
    }

    async notifyAnalysisComplete(auditoria_id, documento_id, result) {
        try {
            // Aquí integraremos con el WebSocket service existente
            const io = require('../../../app').io;
            if (io) {
                io.to(`auditoria_${auditoria_id}`).emit('analysis_complete', {
                    documento_id,
                    result: {
                        fileName: result.fileName,
                        success: result.analysis?.success,
                        scores: result.scores,
                        timestamp: result.timestamp
                    }
                });
            }
        } catch (error) {
            logger.error('❌ Error notificando análisis completado', {
                auditoria_id,
                documento_id,
                error: error.message,
                service: 'ia-analisis'
            });
        }
    }

    async notifyBatchAnalysisComplete(auditoria_id, results) {
        try {
            const io = require('../../../app').io;
            if (io) {
                io.to(`auditoria_${auditoria_id}`).emit('batch_analysis_complete', {
                    summary: {
                        total: results.length,
                        successful: results.filter(r => r.analysis?.success).length,
                        failed: results.filter(r => !r.analysis?.success).length
                    },
                    timestamp: new Date()
                });
            }
        } catch (error) {
            logger.error('❌ Error notificando análisis en lote completado', {
                auditoria_id,
                error: error.message,
                service: 'ia-analisis'
            });
        }
    }

    async getQueueStats() {
        try {
            const waiting = await this.documentAnalysisQueue.waiting();
            const active = await this.documentAnalysisQueue.active();
            const completed = await this.documentAnalysisQueue.completed();
            const failed = await this.documentAnalysisQueue.failed();

            return {
                waiting: waiting.length,
                active: active.length,
                completed: completed.length,
                failed: failed.length,
                total: waiting.length + active.length
            };
        } catch (error) {
            logger.error('❌ Error obteniendo estadísticas de queue', {
                error: error.message,
                service: 'ia-analisis'
            });
            return null;
        }
    }

    async getJobStatus(jobId) {
        try {
            const job = await this.documentAnalysisQueue.getJob(jobId);
            if (!job) {
                return null;
            }

            return {
                id: job.id,
                progress: job.progress(),
                state: await job.getState(),
                data: job.data,
                result: job.returnvalue,
                error: job.failedReason,
                attempts: job.attemptsMade,
                timestamp: job.timestamp
            };
        } catch (error) {
            logger.error('❌ Error obteniendo estado de job', {
                jobId,
                error: error.message,
                service: 'ia-analisis'
            });
            return null;
        }
    }
}

module.exports = QueueService;