const OllamaService = require('./OllamaService');
const logger = require('../../../shared/utils/logger');
const fs = require('fs').promises;
const path = require('path');
const pdf = require('pdf-parse');
const sharp = require('sharp');

class DocumentAnalysisService {
    constructor() {
        this.ollamaService = new OllamaService();
        this.supportedFormats = {
            text: ['.txt', '.md'],
            pdf: ['.pdf'],
            images: ['.jpg', '.jpeg', '.png', '.bmp', '.tiff'],
            office: ['.docx', '.xlsx', '.pptx']
        };
    }

    async analyzeDocument(filePath, seccionTecnica, metadata = {}) {
        try {
            logger.info('🔍 Iniciando análisis de documento', {
                filePath: path.basename(filePath),
                seccionTecnica,
                service: 'ia-analisis'
            });

            const fileExtension = path.extname(filePath).toLowerCase();
            const analysisResult = {
                fileName: path.basename(filePath),
                filePath,
                seccionTecnica,
                fileExtension,
                timestamp: new Date(),
                metadata,
                analysis: null,
                scores: null,
                error: null
            };

            // Determinar tipo de archivo y procesar
            if (this.supportedFormats.images.includes(fileExtension)) {
                analysisResult.analysis = await this.analyzeImageDocument(filePath, seccionTecnica);
            } else if (this.supportedFormats.pdf.includes(fileExtension)) {
                analysisResult.analysis = await this.analyzePdfDocument(filePath, seccionTecnica);
            } else if (this.supportedFormats.text.includes(fileExtension)) {
                analysisResult.analysis = await this.analyzeTextDocument(filePath, seccionTecnica);
            } else {
                throw new Error(`Formato de archivo no soportado: ${fileExtension}`);
            }

            // Extraer scores si el análisis fue exitoso
            if (analysisResult.analysis && analysisResult.analysis.success) {
                analysisResult.scores = this.extractScores(analysisResult.analysis.response);
            }

            logger.info('✅ Análisis completado', {
                fileName: analysisResult.fileName,
                success: analysisResult.analysis?.success || false,
                scores: analysisResult.scores,
                service: 'ia-analisis'
            });

            return analysisResult;

        } catch (error) {
            logger.error('❌ Error en análisis de documento', {
                filePath: path.basename(filePath),
                error: error.message,
                service: 'ia-analisis'
            });
            
            return {
                fileName: path.basename(filePath),
                filePath,
                seccionTecnica,
                error: error.message,
                timestamp: new Date()
            };
        }
    }

    async analyzeImageDocument(filePath, seccionTecnica) {
        try {
            // Convertir imagen a base64
            const imageBuffer = await fs.readFile(filePath);
            
            // Optimizar imagen si es muy grande (max 2MB para Ollama)
            let processedBuffer = imageBuffer;
            if (imageBuffer.length > 2 * 1024 * 1024) {
                processedBuffer = await sharp(imageBuffer)
                    .resize(1920, 1080, { 
                        fit: 'inside', 
                        withoutEnlargement: true 
                    })
                    .jpeg({ quality: 85 })
                    .toBuffer();
            }

            const imageBase64 = processedBuffer.toString('base64');
            
            return await this.ollamaService.analyzeDocumentImage(
                imageBase64, 
                seccionTecnica, 
                path.basename(filePath)
            );

        } catch (error) {
            logger.error('❌ Error procesando imagen', {
                filePath: path.basename(filePath),
                error: error.message,
                service: 'ia-analisis'
            });
            throw error;
        }
    }

    async analyzePdfDocument(filePath, seccionTecnica) {
        try {
            const pdfBuffer = await fs.readFile(filePath);
            const pdfData = await pdf(pdfBuffer);
            
            // Extraer texto del PDF
            const text = pdfData.text;
            
            if (!text || text.trim().length === 0) {
                throw new Error('PDF no contiene texto extraíble');
            }

            return await this.ollamaService.analyzeDocumentText(text, seccionTecnica);

        } catch (error) {
            logger.error('❌ Error procesando PDF', {
                filePath: path.basename(filePath),
                error: error.message,
                service: 'ia-analisis'
            });
            throw error;
        }
    }

    async analyzeTextDocument(filePath, seccionTecnica) {
        try {
            const text = await fs.readFile(filePath, 'utf8');
            
            if (!text || text.trim().length === 0) {
                throw new Error('Archivo de texto vacío');
            }

            return await this.ollamaService.analyzeDocumentText(text, seccionTecnica);

        } catch (error) {
            logger.error('❌ Error procesando texto', {
                filePath: path.basename(filePath),
                error: error.message,
                service: 'ia-analisis'
            });
            throw error;
        }
    }

    extractScores(aiResponse) {
        try {
            // Intentar parsear como JSON
            const parsed = JSON.parse(aiResponse);
            
            return {
                completitud: this.normalizeScore(parsed.COMPLETITUD),
                calidadTecnica: this.normalizeScore(parsed.CALIDAD_TECNICA),
                cumplimiento: this.normalizeScore(parsed.CUMPLIMIENTO),
                scorePromedio: 0
            };
            
        } catch (error) {
            // Si no es JSON válido, extraer scores con regex
            const scores = {
                completitud: this.extractScoreFromText(aiResponse, 'COMPLETITUD'),
                calidadTecnica: this.extractScoreFromText(aiResponse, 'CALIDAD_TECNICA'),
                cumplimiento: this.extractScoreFromText(aiResponse, 'CUMPLIMIENTO')
            };

            // Calcular promedio
            const validScores = Object.values(scores).filter(score => score !== null);
            scores.scorePromedio = validScores.length > 0 
                ? Math.round(validScores.reduce((a, b) => a + b, 0) / validScores.length)
                : 0;

            return scores;
        }
    }

    extractScoreFromText(text, scoreType) {
        const regex = new RegExp(`${scoreType}[:\\s]+([0-9]+)`, 'i');
        const match = text.match(regex);
        return match ? parseInt(match[1]) : null;
    }

    normalizeScore(score) {
        if (typeof score === 'number' && score >= 0 && score <= 100) {
            return Math.round(score);
        }
        return null;
    }

    async batchAnalyzeDocuments(documentsData, seccionTecnica) {
        logger.info('🔄 Iniciando análisis en lote', {
            count: documentsData.length,
            seccionTecnica,
            service: 'ia-analisis'
        });

        const results = [];
        const errors = [];

        for (const docData of documentsData) {
            try {
                const result = await this.analyzeDocument(
                    docData.filePath,
                    seccionTecnica,
                    docData.metadata
                );
                results.push(result);
                
                // Pequeña pausa entre análisis para no sobrecargar Ollama
                await new Promise(resolve => setTimeout(resolve, 1000));
                
            } catch (error) {
                errors.push({
                    fileName: docData.fileName || path.basename(docData.filePath),
                    error: error.message
                });
            }
        }

        logger.info('✅ Análisis en lote completado', {
            successful: results.length,
            errors: errors.length,
            service: 'ia-analisis'
        });

        return {
            results,
            errors,
            summary: {
                total: documentsData.length,
                successful: results.length,
                failed: errors.length
            }
        };
    }
}

module.exports = DocumentAnalysisService;