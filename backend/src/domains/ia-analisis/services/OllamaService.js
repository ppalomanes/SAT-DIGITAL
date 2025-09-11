const axios = require('axios');
const logger = require('../../../shared/utils/logger');

class OllamaService {
    constructor() {
        this.baseURL = process.env.OLLAMA_URL || 'http://localhost:11434';
        this.textModel = process.env.OLLAMA_TEXT_MODEL || 'llama3.1:8b';
        this.visionModel = process.env.OLLAMA_VISION_MODEL || 'llava:7b';
        this.timeout = 300000; // 5 minutes timeout for AI requests
    }

    async checkHealth() {
        try {
            const response = await axios.get(`${this.baseURL}/api/version`);
            logger.info('✅ Ollama connection established', { 
                version: response.data.version,
                service: 'ia-analisis' 
            });
            return true;
        } catch (error) {
            logger.error('❌ Ollama connection failed', { 
                error: error.message,
                service: 'ia-analisis' 
            });
            return false;
        }
    }

    async generateTextAnalysis(prompt, context = '') {
        try {
            const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
            
            const response = await axios.post(`${this.baseURL}/api/generate`, {
                model: this.textModel,
                prompt: fullPrompt,
                stream: false,
                options: {
                    temperature: 0.1, // Low temperature for consistent technical analysis
                    top_p: 0.9,
                    num_predict: 2048
                }
            }, { timeout: this.timeout });

            return {
                success: true,
                response: response.data.response,
                model: this.textModel,
                tokens: response.data.eval_count || 0
            };
        } catch (error) {
            logger.error('❌ Error in text analysis', { 
                error: error.message,
                model: this.textModel,
                service: 'ia-analisis' 
            });
            return {
                success: false,
                error: error.message
            };
        }
    }

    async generateVisionAnalysis(imageBase64, prompt, context = '') {
        try {
            const fullPrompt = context ? `${context}\n\n${prompt}` : prompt;
            
            const response = await axios.post(`${this.baseURL}/api/generate`, {
                model: this.visionModel,
                prompt: fullPrompt,
                images: [imageBase64],
                stream: false,
                options: {
                    temperature: 0.1,
                    top_p: 0.9,
                    num_predict: 2048
                }
            }, { timeout: this.timeout });

            return {
                success: true,
                response: response.data.response,
                model: this.visionModel,
                tokens: response.data.eval_count || 0
            };
        } catch (error) {
            logger.error('❌ Error in vision analysis', { 
                error: error.message,
                model: this.visionModel,
                service: 'ia-analisis' 
            });
            return {
                success: false,
                error: error.message
            };
        }
    }

    async listModels() {
        try {
            const response = await axios.get(`${this.baseURL}/api/tags`);
            return {
                success: true,
                models: response.data.models || []
            };
        } catch (error) {
            logger.error('❌ Error listing models', { 
                error: error.message,
                service: 'ia-analisis' 
            });
            return {
                success: false,
                error: error.message
            };
        }
    }

    async analyzeDocumentText(text, seccionTecnica) {
        const context = `Eres un experto técnico en auditorías de infraestructura de centros de datos.
Estás analizando la sección técnica: "${seccionTecnica}".
Tu tarea es evaluar la calidad, completitud y cumplimiento técnico del documento.`;

        const prompt = `Analiza el siguiente texto de documento técnico:

${text}

Proporciona una evaluación estructurada que incluya:
1. COMPLETITUD (0-100): Porcentaje de información requerida presente
2. CALIDAD_TECNICA (0-100): Nivel técnico y precisión del contenido
3. CUMPLIMIENTO (0-100): Adherencia a estándares y normativas
4. OBSERVACIONES: Lista de puntos críticos encontrados
5. RECOMENDACIONES: Acciones sugeridas para mejora

Responde en formato JSON válido.`;

        return await this.generateTextAnalysis(prompt, context);
    }

    async analyzeDocumentImage(imageBase64, seccionTecnica, fileName = '') {
        const context = `Eres un experto técnico en auditorías de infraestructura de centros de datos.
Estás analizando una imagen de la sección técnica: "${seccionTecnica}".
Archivo: ${fileName}`;

        const prompt = `Analiza esta imagen técnica detalladamente:

Identifica y evalúa:
1. Elementos técnicos visibles
2. Estado de la infraestructura
3. Cumplimiento de normativas visibles
4. Problemas o anomalías detectadas
5. Calidad de la documentación fotográfica

Proporciona una evaluación estructurada que incluya:
1. COMPLETITUD (0-100): Información técnica visible
2. CALIDAD_TECNICA (0-100): Estado técnico observado
3. CUMPLIMIENTO (0-100): Adherencia a estándares visibles
4. ELEMENTOS_DETECTADOS: Lista de componentes identificados
5. OBSERVACIONES: Puntos críticos encontrados
6. RECOMENDACIONES: Acciones sugeridas

Responde en formato JSON válido.`;

        return await this.generateVisionAnalysis(imageBase64, prompt, context);
    }
}

module.exports = OllamaService;