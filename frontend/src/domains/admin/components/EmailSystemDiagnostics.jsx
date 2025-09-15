import { useState, useEffect } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Grid,
    Alert,
    Chip,
    CircularProgress,
    TextField,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Email,
    Settings,
    CheckCircle,
    Error,
    Warning,
    Refresh,
    Send,
    ExpandMore
} from '@mui/icons-material';
import { useAuthStore } from '../../../domains/auth/store/authStore';
import { emailTestService } from '../../../domains/notificaciones/services/emailTestService';

const EmailSystemDiagnostics = () => {
    const [emailConfig, setEmailConfig] = useState(null);
    const [loading, setLoading] = useState(true);
    const [testEmail, setTestEmail] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [checking, setChecking] = useState(false);
    const { token } = useAuthStore();

    useEffect(() => {
        loadEmailConfig();
    }, []);

    const loadEmailConfig = async () => {
        setLoading(true);
        try {
            const result = await emailTestService.checkSMTPConfig();
            setEmailConfig(result.data);
        } catch (error) {
            console.error('Error loading email config:', error);
            setEmailConfig({
                connectionStatus: 'error',
                error: error.message,
                configuration: {
                    host: 'smtp.gmail.com',
                    port: 587,
                    secure: false
                }
            });
        } finally {
            setLoading(false);
        }
    };

    const sendTestEmail = async () => {
        if (!testEmail || !testEmail.includes('@')) {
            setTestResult({ success: false, error: 'Por favor ingresa un email válido' });
            return;
        }

        setChecking(true);
        setTestResult(null);

        try {
            const result = await emailTestService.testTemplate('notificacion-general', testEmail, {
                titulo: 'Test Email desde Panel de Diagnósticos',
                mensaje_principal: 'Este es un email de prueba enviado desde el panel de diagnósticos del sistema SAT-Digital.',
                destinatario: 'Usuario de Prueba'
            });

            setTestResult({
                success: true,
                message: 'Email enviado exitosamente',
                previewUrl: result.data?.previewUrl
            });
        } catch (error) {
            setTestResult({
                success: false,
                error: error.response?.data?.message || error.message
            });
        } finally {
            setChecking(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toLowerCase()) {
            case 'connected':
                return 'success';
            case 'disconnected':
            case 'error':
                return 'error';
            default:
                return 'warning';
        }
    };

    const getStatusIcon = (status) => {
        switch (status?.toLowerCase()) {
            case 'connected':
                return <CheckCircle />;
            case 'disconnected':
            case 'error':
                return <Error />;
            default:
                return <Warning />;
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 200 }}>
                <CircularProgress />
                <Typography variant="body1" sx={{ ml: 2 }}>
                    Verificando sistema de email...
                </Typography>
            </Box>
        );
    }

    return (
        <Box>
            <Grid container spacing={3}>
                {/* Estado del Email */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                Estado del Sistema Email
                            </Typography>

                            <Box sx={{ mb: 2 }}>
                                <Chip
                                    icon={getStatusIcon(emailConfig?.connectionStatus)}
                                    label={emailConfig?.connectionStatus === 'connected' ? 'Conectado' : 'Desconectado'}
                                    color={getStatusColor(emailConfig?.connectionStatus)}
                                    sx={{ mb: 1 }}
                                />
                            </Box>

                            {emailConfig?.connectionStatus === 'connected' ? (
                                <Alert severity="success">
                                    Sistema de email funcionando correctamente
                                </Alert>
                            ) : (
                                <Alert severity="error">
                                    {emailConfig?.error || 'Error de configuración SMTP'}
                                </Alert>
                            )}

                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Servidor:</strong> {emailConfig?.configuration?.host || 'No configurado'}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    <strong>Puerto:</strong> {emailConfig?.configuration?.port || 'No configurado'}
                                </Typography>
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>

                {/* Test de Email */}
                <Grid item xs={12} md={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                                Prueba de Email
                            </Typography>

                            <TextField
                                fullWidth
                                label="Email de prueba"
                                type="email"
                                value={testEmail}
                                onChange={(e) => setTestEmail(e.target.value)}
                                placeholder="test@ejemplo.com"
                                sx={{ mb: 2 }}
                                size="small"
                                helperText="Introduce un email válido para la prueba"
                            />

                            <Button
                                fullWidth
                                variant="contained"
                                startIcon={checking ? <CircularProgress size={16} /> : <Send />}
                                onClick={sendTestEmail}
                                disabled={checking || !testEmail}
                                size="small"
                            >
                                {checking ? 'Enviando...' : 'Enviar Email de Prueba'}
                            </Button>

                            {testResult && (
                                <Box sx={{ mt: 2 }}>
                                    <Alert severity={testResult.success ? 'success' : 'error'}>
                                        {testResult.success ? (
                                            <Box>
                                                <Typography variant="body2">
                                                    {testResult.message || 'Email enviado exitosamente'}
                                                </Typography>
                                                {testResult.previewUrl && (
                                                    <Typography variant="body2" sx={{ mt: 1 }}>
                                                        <a
                                                            href={testResult.previewUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: 'inherit', textDecoration: 'underline' }}
                                                        >
                                                            Ver email en Ethereal
                                                        </a>
                                                    </Typography>
                                                )}
                                            </Box>
                                        ) : (
                                            `Error: ${testResult.error}`
                                        )}
                                    </Alert>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Configuración */}
                <Grid item xs={12}>
                    <Accordion>
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Settings color="primary" />
                                <Typography variant="subtitle1">Configuración Gmail SMTP</Typography>
                                <Chip
                                    label="Pendiente"
                                    color="warning"
                                    size="small"
                                    sx={{ ml: 2 }}
                                />
                            </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Alert severity="info" sx={{ mb: 2 }}>
                                <Typography variant="body2">
                                    <strong>Para configurar Gmail:</strong>
                                    <br />
                                    1. Ve a tu cuenta de Google → Configuración → Seguridad
                                    <br />
                                    2. Habilita "Verificación en 2 pasos"
                                    <br />
                                    3. Genera una "Contraseña de aplicación"
                                    <br />
                                    4. Usa esa contraseña en la configuración SMTP
                                </Typography>
                            </Alert>

                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Servidor SMTP"
                                        value="smtp.gmail.com"
                                        disabled
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Puerto"
                                        value="587"
                                        disabled
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12} md={3}>
                                    <TextField
                                        fullWidth
                                        label="Encriptación"
                                        value="STARTTLS"
                                        disabled
                                        size="small"
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <Alert severity="warning">
                                        Configuración pendiente de implementación en el backend.
                                        El error actual de Gmail se resolverá configurando las credenciales SMTP.
                                    </Alert>
                                </Grid>
                            </Grid>
                        </AccordionDetails>
                    </Accordion>
                </Grid>
            </Grid>
        </Box>
    );
};

export default EmailSystemDiagnostics;