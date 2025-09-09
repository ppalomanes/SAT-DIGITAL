import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
  Alert,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  History,
  CheckCircle,
  Error,
  Email,
  Delete,
  ExpandMore,
  Code,
  Refresh
} from '@mui/icons-material';

const TestingLogs = ({ logs, onClear }) => {
  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getStatusIcon = (success) => {
    return success ? 
      <CheckCircle sx={{ color: 'success.main' }} /> : 
      <Error sx={{ color: 'error.main' }} />;
  };

  const getStatusColor = (success) => {
    return success ? 'success' : 'error';
  };

  const successfulLogs = logs.filter(log => log.success);
  const failedLogs = logs.filter(log => !log.success);

  if (logs.length === 0) {
    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            <History sx={{ mr: 1, verticalAlign: 'middle' }} />
            Logs de Testing
          </Typography>
          <Alert severity="info">
            No hay logs de testing disponibles. Realiza algunas pruebas para ver el historial aquí.
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">
            <History sx={{ mr: 1, verticalAlign: 'middle' }} />
            Logs de Testing ({logs.length})
          </Typography>
          <Tooltip title="Limpiar logs">
            <IconButton onClick={onClear} size="small">
              <Delete />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Estadísticas rápidas */}
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            icon={<CheckCircle />}
            label={`${successfulLogs.length} exitosos`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<Error />}
            label={`${failedLogs.length} fallidos`}
            color="error"
            variant="outlined"
            size="small"
          />
        </Box>

        {/* Lista de logs */}
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          <List dense>
            {logs.map((log) => (
              <ListItem
                key={log.id}
                sx={{
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  mb: 1,
                  backgroundColor: log.success ? 'success.50' : 'error.50'
                }}
              >
                <ListItemIcon>
                  {getStatusIcon(log.success)}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" fontWeight="medium">
                        {log.template}
                      </Typography>
                      <Chip
                        label={log.success ? 'Exitoso' : 'Error'}
                        color={getStatusColor(log.success)}
                        size="small"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                        <Email sx={{ fontSize: 14 }} />
                        <Typography variant="caption">
                          {log.email}
                        </Typography>
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {formatTimestamp(log.timestamp)}
                      </Typography>
                      {log.message && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {log.message}
                        </Typography>
                      )}
                      {log.data && Object.keys(log.data).length > 0 && (
                        <Accordion sx={{ mt: 1, boxShadow: 'none' }}>
                          <AccordionSummary 
                            expandIcon={<ExpandMore />}
                            sx={{ 
                              minHeight: 'auto',
                              '& .MuiAccordionSummary-content': { margin: '4px 0' }
                            }}
                          >
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center' }}>
                              <Code sx={{ fontSize: 12, mr: 0.5 }} />
                              Ver datos
                            </Typography>
                          </AccordionSummary>
                          <AccordionDetails sx={{ pt: 0 }}>
                            <Box sx={{ 
                              backgroundColor: 'grey.100', 
                              p: 1, 
                              borderRadius: 1,
                              maxHeight: 100,
                              overflow: 'auto'
                            }}>
                              <pre style={{ 
                                margin: 0, 
                                fontSize: '0.7rem',
                                lineHeight: 1.2,
                                color: '#666'
                              }}>
                                {JSON.stringify(log.data, null, 2)}
                              </pre>
                            </Box>
                          </AccordionDetails>
                        </Accordion>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {logs.length > 10 && (
          <Box sx={{ mt: 2, textAlign: 'center' }}>
            <Button
              size="small"
              onClick={onClear}
              startIcon={<Delete />}
              color="error"
              variant="outlined"
            >
              Limpiar todos los logs
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default TestingLogs;