import { useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    CircularProgress,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip
} from '@mui/material';
import { Psychology, Analytics, CheckCircle, Error } from '@mui/icons-material';
import { useAuthStore } from '../../../domains/auth/store/authStore';

const TestIA = () => {
    const [texto, setTexto] = useState('');
    const [seccionTecnica, setSeccionTecnica] = useState('General');
    const [resultado, setResultado] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [healthStatus, setHealthStatus] = useState(null);
    const { token } = useAuthStore();

    const secciones = [
        'General',
        'Servidores',
        'Red',
        'Seguridad',
        'Base de Datos',
        'Conectividad',
        'Infraestructura'
    ];

    const checkHealthStatus = async () => {
        try {
            setLoading(true);
            const response = await fetch('http://localhost:3001/api/ia-analisis/health');
            const data = await response.json();
            setHealthStatus(data);
        } catch (err) {
            setError('Error verificando estado de IA: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const realizarAnalisis = async () => {
        if (!texto.trim()) {
            setError('Ingrese texto para analizar');
            return;
        }

        try {
            setLoading(true);
            setError('');
            setResultado(null);

            const response = await fetch('http://localhost:3001/api/ia-analisis/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    text: texto,
                    seccionTecnica,
                    type: 'text'
                })
            });

            const data = await response.json();

            if (data.success) {
                setResultado(data);
            } else {
                setError(data.message || 'Error en el análisis');
            }
        } catch (err) {
            setError('Error conectando con IA: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Psychology color="primary" />
                Test de Análisis con IA - Ollama
            </Typography>

            <Grid container spacing={3}>
                {/* Panel de Estado */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography variant="h6">Estado del Sistema IA</Typography>
                                <Button onClick={checkHealthStatus} disabled={loading} variant="outlined" size="small">
                                    Verificar Estado
                                </Button>
                            </Box>
                            {healthStatus && (
                                <Box sx={{ mt: 2 }}>
                                    <Chip
                                        icon={healthStatus.ollama?.healthy ? <CheckCircle /> : <Error />}
                                        label={`Ollama: ${healthStatus.ollama?.healthy ? 'Conectado' : 'Desconectado'}`}
                                        color={healthStatus.ollama?.healthy ? 'success' : 'error'}
                                        sx={{ mr: 1 }}
                                    />
                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                        Modelos disponibles: {healthStatus.ollama?.models?.length || 0}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        URL: {healthStatus.ollama?.url}
                                    </Typography>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Panel de Prueba */}
                <Grid item xs={12}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6" gutterBottom>
                                <Analytics sx={{ mr: 1 }} />
                                Prueba de Análisis de Texto
                            </Typography>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={8}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        rows={6}
                                        label="Texto para analizar"
                                        value={texto}
                                        onChange={(e) => setTexto(e.target.value)}
                                        placeholder="Ingrese el texto técnico que desea analizar con IA..."
                                        variant="outlined"
                                    />
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <FormControl fullWidth sx={{ mb: 2 }}>
                                        <InputLabel>Sección Técnica</InputLabel>
                                        <Select
                                            value={seccionTecnica}
                                            onChange={(e) => setSeccionTecnica(e.target.value)}
                                            label="Sección Técnica"
                                        >
                                            {secciones.map((seccion) => (
                                                <MenuItem key={seccion} value={seccion}>
                                                    {seccion}
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        onClick={realizarAnalisis}
                                        disabled={loading || !texto.trim()}
                                        startIcon={loading ? <CircularProgress size={20} /> : <Psychology />}
                                        size="large"
                                    >
                                        {loading ? 'Analizando...' : 'Analizar con IA'}
                                    </Button>
                                </Grid>
                            </Grid>

                            {error && (
                                <Alert severity="error" sx={{ mt: 2 }}>
                                    {error}
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Resultados */}
                {resultado && (
                    <Grid item xs={12}>
                        <Card>
                            <CardContent>
                                <Typography variant="h6" gutterBottom>
                                    Resultado del Análisis
                                </Typography>

                                <Grid container spacing={2}>
                                    <Grid item xs={12}>
                                        <Chip
                                            label={`Tipo: ${resultado.type === 'ia_real' ? 'IA Real' : 'Fallback'}`}
                                            color={resultado.type === 'ia_real' ? 'success' : 'warning'}
                                            sx={{ mb: 2 }}
                                        />
                                    </Grid>

                                    {resultado.type === 'ia_real' ? (
                                        <Grid item xs={12}>
                                            <Card variant="outlined" sx={{ bgcolor: 'success.50' }}>
                                                <CardContent>
                                                    <Typography variant="subtitle2" gutterBottom>
                                                        Respuesta de IA ({resultado.result?.model}):
                                                    </Typography>
                                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                                        {resultado.result?.ia_response}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                                                        Tokens procesados: {resultado.result?.tokens || 'N/A'} |
                                                        Sección: {resultado.result?.seccionTecnica}
                                                    </Typography>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                    ) : (
                                        <Grid item xs={12}>
                                            <Alert severity="info">
                                                <Typography variant="body2">
                                                    Se usó análisis de respaldo (fallback). Razón: IA no disponible
                                                </Typography>
                                            </Alert>
                                        </Grid>
                                    )}

                                    <Grid item xs={12}>
                                        <Typography variant="caption" color="text.secondary">
                                            Procesado: {new Date(resultado.timestamp).toLocaleString()}
                                        </Typography>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                )}
            </Grid>

            {/* Ejemplos de uso */}
            <Card sx={{ mt: 3 }}>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        Ejemplos de Texto para Probar
                    </Typography>
                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setTexto('El servidor cuenta con sistema de backup automático configurado para ejecutarse diariamente a las 02:00. Firewall activo y actualizado. Base de datos MySQL 8.0 operativa con actualizaciones de seguridad aplicadas.')}
                                sx={{ mb: 1, mr: 1 }}
                            >
                                Ejemplo: Servidores
                            </Button>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Button
                                variant="outlined"
                                size="small"
                                onClick={() => setTexto('La red cuenta con switch Cisco administrable, VLAN configuradas para segregar tráfico. Conectividad redundante con dos proveedores ISP. Monitoreo de ancho de banda implementado.')}
                                sx={{ mb: 1, mr: 1 }}
                            >
                                Ejemplo: Red
                            </Button>
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Box>
    );
};

export default TestIA;