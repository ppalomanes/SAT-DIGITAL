import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tab,
  Tabs,
  Paper,
  Alert,
  Snackbar
} from '@mui/material';
import { Email, Settings, Analytics, Info } from '@mui/icons-material';

// Components
import TemplatesList from '../components/TemplatesList';
import EmailTestForm from '../components/EmailTestForm';
import BulkEmailTest from '../components/BulkEmailTest';
import SmtpConfigCheck from '../components/SmtpConfigCheck';
import TestingLogs from '../components/TestingLogs';

// Services
import { emailTestService } from '../services/emailTestService';

const EmailTestingPage = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({ open: false, message: '', type: 'success' });
  const [testLogs, setTestLogs] = useState([]);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await emailTestService.getTemplates();
      setTemplates(data.templates || []);
    } catch (err) {
      setError('Error al cargar templates: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ open: true, message, type });
  };

  const addTestLog = (log) => {
    setTestLogs(prev => [
      {
        id: Date.now(),
        timestamp: new Date(),
        ...log
      },
      ...prev.slice(0, 49) // Mantener solo los últimos 50 logs
    ]);
  };

  const closeNotification = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  const tabsData = [
    {
      label: 'Templates',
      icon: <Email />,
      component: (
        <TemplatesList 
          templates={templates}
          loading={loading}
          onRefresh={loadTemplates}
          onNotification={showNotification}
          onTestLog={addTestLog}
        />
      )
    },
    {
      label: 'Prueba Individual',
      icon: <Email />,
      component: (
        <EmailTestForm 
          templates={templates}
          onNotification={showNotification}
          onTestLog={addTestLog}
        />
      )
    },
    {
      label: 'Prueba Masiva',
      icon: <Analytics />,
      component: (
        <BulkEmailTest 
          templates={templates}
          onNotification={showNotification}
          onTestLog={addTestLog}
        />
      )
    },
    {
      label: 'Configuración SMTP',
      icon: <Settings />,
      component: (
        <SmtpConfigCheck 
          onNotification={showNotification}
        />
      )
    }
  ];

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <Email sx={{ mr: 2, verticalAlign: 'middle' }} />
          Testing de Email Templates
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Sistema de pruebas y validación para templates de email de SAT-Digital
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Templates Disponibles
              </Typography>
              <Typography variant="h4">
                {templates.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Pruebas Realizadas
              </Typography>
              <Typography variant="h4">
                {testLogs.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Pruebas Exitosas
              </Typography>
              <Typography variant="h4" color="success.main">
                {testLogs.filter(log => log.success).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography color="text.secondary" gutterBottom variant="body2">
                Pruebas Fallidas
              </Typography>
              <Typography variant="h4" color="error.main">
                {testLogs.filter(log => !log.success).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Content */}
      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 0 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                borderBottom: 1,
                borderColor: 'divider',
                px: 2
              }}
            >
              {tabsData.map((tab, index) => (
                <Tab
                  key={index}
                  icon={tab.icon}
                  label={tab.label}
                  iconPosition="start"
                />
              ))}
            </Tabs>
            <Box sx={{ p: 3 }}>
              {tabsData[activeTab]?.component}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <TestingLogs 
            logs={testLogs}
            onClear={() => setTestLogs([])}
          />
        </Grid>
      </Grid>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={closeNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={closeNotification} 
          severity={notification.type}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmailTestingPage;