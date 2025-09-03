// frontend/src/domains/notificaciones/components/DashboardNotificacionesAdmin.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  Select,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  message,
  Divider,
  Alert,
  Progress,
  Typography
} from 'antd';
import {
  MailOutlined,
  SendOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  EyeOutlined,
  BugOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useNotificacionesStore } from '../store/notificacionesStore';

const { Option } = Select;
const { Title, Text } = Typography;

const DashboardNotificacionesAdmin = () => {
  const [periodo, setPeriodo] = useState('30d');
  const [modalTestVisible, setModalTestVisible] = useState(false);
  const [form] = Form.useForm();

  const {
    dashboardData,
    loading,
    error,
    obtenerDashboardAdmin,
    enviarEmailPrueba,
    limpiarError
  } = useNotificacionesStore();

  useEffect(() => {
    cargarDashboard();
  }, [periodo]);

  useEffect(() => {
    if (error) {
      message.error(error);
      limpiarError();
    }
  }, [error, limpiarError]);

  const cargarDashboard = () => {
    obtenerDashboardAdmin(periodo);
  };

  const handleEnviarEmailPrueba = async (values) => {
    try {
      const resultado = await enviarEmailPrueba(values.tipo, values.email);
      
      if (resultado.success) {
        message.success('Email de prueba enviado exitosamente');
        if (resultado.resultado?.preview) {
          Modal.info({
            title: 'Email enviado',
            content: (
              <div>
                <p>El email de prueba fue enviado correctamente.</p>
                <p>
                  <a href={resultado.resultado.preview} target="_blank" rel="noopener noreferrer">
                    Ver preview del email
                  </a>
                </p>
              </div>
            )
          });
        }
        setModalTestVisible(false);
        form.resetFields();
      } else {
        message.error(resultado.error || 'Error enviando email de prueba');
      }
    } catch (error) {
      message.error('Error enviando email de prueba');
    }
  };

  const columnas = [
    {
      title: 'Usuario',
      dataIndex: 'usuario',
      key: 'usuario',
      render: (text, record) => (
        <div>
          <div><strong>{text}</strong></div>
          <div><Text type="secondary">{record.email}</Text></div>
        </div>
      )
    },
    {
      title: 'Tipo',
      dataIndex: 'tipo',
      key: 'tipo',
      render: (tipo) => {
        const colores = {
          'mensaje_nuevo': 'blue',
          'recordatorio': 'orange',
          'cambio_estado': 'green',
          'resumen_diario': 'purple',
          'plazo_venciendo': 'red'
        };
        return (
          <Tag color={colores[tipo] || 'default'}>
            {tipo.replace('_', ' ')}
          </Tag>
        );
      }
    },
    {
      title: 'Título',
      dataIndex: 'titulo',
      key: 'titulo'
    },
    {
      title: 'Estado',
      dataIndex: 'leida',
      key: 'leida',
      render: (leida) => (
        <Tag color={leida ? 'green' : 'orange'} icon={leida ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}>
          {leida ? 'Leída' : 'No leída'}
        </Tag>
      )
    },
    {
      title: 'Fecha',
      dataIndex: 'fecha',
      key: 'fecha',
      render: (fecha) => dayjs(fecha).format('DD/MM/YYYY HH:mm')
    }
  ];

  const renderEstadisticas = () => {
    if (!dashboardData?.estadisticas) return null;

    return (
      <Row gutter={[16, 16]}>
        {dashboardData.estadisticas.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card>
              <Statistic
                title={stat.tipo.replace('_', ' ').toUpperCase()}
                value={stat.total}
                suffix="enviadas"
                prefix={<MailOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Text type="secondary">Leídas: {stat.leidas}</Text>
                <Progress
                  percent={stat.tasa_lectura}
                  size="small"
                  status={stat.tasa_lectura > 80 ? 'success' : stat.tasa_lectura > 60 ? 'normal' : 'exception'}
                />
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    );
  };

  const renderEstadoColas = () => {
    if (!dashboardData?.estadoColas) return null;

    const { email_queue } = dashboardData.estadoColas;

    return (
      <Card title="Estado de Colas de Email" size="small">
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="En Espera"
              value={email_queue.waiting}
              valueStyle={{ color: '#faad14' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Procesando"
              value={email_queue.active}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Completados"
              value={email_queue.completed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Fallidos"
              value={email_queue.failed}
              valueStyle={{ color: '#ff4d4f' }}
            />
          </Col>
        </Row>
        <Divider />
        <Text type="secondary">
          Último procesamiento: {dayjs(dashboardData.estadoColas.last_processed).fromNow()}
        </Text>
      </Card>
    );
  };

  return (
    <div className="dashboard-notificaciones-admin">
      <div className="dashboard-header">
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2}>
              <MailOutlined /> Dashboard de Notificaciones
            </Title>
          </Col>
          <Col>
            <Space>
              <Select
                value={periodo}
                onChange={setPeriodo}
                style={{ width: 120 }}
              >
                <Option value="7d">7 días</Option>
                <Option value="30d">30 días</Option>
                <Option value="90d">90 días</Option>
              </Select>
              <Button
                icon={<BugOutlined />}
                onClick={() => setModalTestVisible(true)}
              >
                Probar Email
              </Button>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={cargarDashboard}
              >
                Actualizar
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {error && (
        <Alert
          message="Error cargando dashboard"
          description={error}
          type="error"
          closable
          style={{ marginBottom: 16 }}
        />
      )}

      {/* Estadísticas principales */}
      <Card
        title="Estadísticas de Notificaciones"
        style={{ marginBottom: 16 }}
        loading={loading}
      >
        {renderEstadisticas()}
      </Card>

      {/* Estado de colas */}
      <div style={{ marginBottom: 16 }}>
        {renderEstadoColas()}
      </div>

      {/* Tabla de notificaciones recientes */}
      <Card
        title="Notificaciones Recientes"
        extra={
          <Space>
            <Text type="secondary">Período: {periodo}</Text>
            <Button
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                // Implementar modal para ver todas
              }}
            >
              Ver todas
            </Button>
          </Space>
        }
      >
        <Table
          columns={columnas}
          dataSource={dashboardData?.notificacionesRecientes || []}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true
          }}
        />
      </Card>

      {/* Modal para probar emails */}
      <Modal
        title="Enviar Email de Prueba"
        open={modalTestVisible}
        onCancel={() => setModalTestVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEnviarEmailPrueba}
        >
          <Form.Item
            name="email"
            label="Email destinatario"
            rules={[
              { required: true, message: 'Ingrese un email' },
              { type: 'email', message: 'Email inválido' }
            ]}
          >
            <Input placeholder="test@ejemplo.com" />
          </Form.Item>

          <Form.Item
            name="tipo"
            label="Tipo de template"
            rules={[{ required: true, message: 'Seleccione un tipo' }]}
          >
            <Select placeholder="Seleccionar template">
              <Option value="inicio-periodo">Inicio de Período</Option>
              <Option value="recordatorio-tiempo-limite">Recordatorio</Option>
              <Option value="nuevo-mensaje">Nuevo Mensaje</Option>
              <Option value="cambio-estado">Cambio de Estado</Option>
              <Option value="resumen-diario">Resumen Diario</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={loading}
              >
                Enviar Prueba
              </Button>
              <Button onClick={() => setModalTestVisible(false)}>
                Cancelar
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default DashboardNotificacionesAdmin;
