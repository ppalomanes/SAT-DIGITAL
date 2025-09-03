// frontend/src/domains/notificaciones/components/PanelNotificaciones.jsx
import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Badge,
  Button,
  Typography,
  Avatar,
  Space,
  Tag,
  Empty,
  Divider,
  Tooltip,
  Switch,
  Modal,
  message
} from 'antd';
import {
  BellOutlined,
  MailOutlined,
  MessageOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNotificacionesStore } from '../store/notificacionesStore';
import './PanelNotificaciones.css';

dayjs.extend(relativeTime);

const { Title, Text } = Typography;

const PanelNotificaciones = ({ compacto = false }) => {
  const [mostrarSoloNoLeidas, setMostrarSoloNoLeidas] = useState(false);
  const [modalConfigVisible, setModalConfigVisible] = useState(false);

  const {
    notificaciones,
    configuracion,
    noLeidas,
    loading,
    error,
    obtenerNotificaciones,
    marcarComoLeidas,
    obtenerConfiguracion,
    actualizarConfiguracion,
    limpiarError
  } = useNotificacionesStore();

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (error) {
      message.error(error);
      limpiarError();
    }
  }, [error, limpiarError]);

  const cargarDatos = async () => {
    await Promise.all([
      obtenerNotificaciones({ solo_no_leidas: mostrarSoloNoLeidas }),
      obtenerConfiguracion()
    ]);
  };

  const handleMarcarLeida = async (notificacionId) => {
    const resultado = await marcarComoLeidas([notificacionId]);
    if (resultado.success) {
      message.success('Notificación marcada como leída');
    }
  };

  const handleMarcarTodasLeidas = async () => {
    const idsNoLeidas = notificaciones
      .filter(n => !n.leida)
      .map(n => n.id);
    
    if (idsNoLeidas.length === 0) {
      message.info('No hay notificaciones por marcar');
      return;
    }

    const resultado = await marcarComoLeidas(idsNoLeidas);
    if (resultado.success) {
      message.success(`${idsNoLeidas.length} notificaciones marcadas como leídas`);
    }
  };

  const getIconoNotificacion = (tipo) => {
    const iconos = {
      'mensaje_nuevo': <MessageOutlined className="notif-icon notif-icon--mensaje" />,
      'respuesta_recibida': <MessageOutlined className="notif-icon notif-icon--respuesta" />,
      'estado_cambiado': <ExclamationCircleOutlined className="notif-icon notif-icon--estado" />,
      'plazo_venciendo': <BellOutlined className="notif-icon notif-icon--urgente" />
    };
    return iconos[tipo] || <BellOutlined className="notif-icon" />;
  };

  const getColorTipo = (tipo) => {
    const colores = {
      'mensaje_nuevo': 'blue',
      'respuesta_recibida': 'green', 
      'estado_cambiado': 'orange',
      'plazo_venciendo': 'red'
    };
    return colores[tipo] || 'default';
  };

  const handleConfiguracionChange = async (campo, valor) => {
    const nuevaConfiguracion = {
      ...configuracion,
      [campo]: valor
    };

    const resultado = await actualizarConfiguracion(nuevaConfiguracion);
    if (resultado.success) {
      message.success('Configuración actualizada');
    } else {
      message.error('Error actualizando configuración');
    }
  };

  const renderNotificacion = (notificacion) => (
    <List.Item
      key={notificacion.id}
      className={`notificacion-item ${!notificacion.leida ? 'notificacion-item--no-leida' : ''}`}
      actions={!compacto ? [
        <Tooltip title={notificacion.leida ? 'Ya leída' : 'Marcar como leída'}>
          <Button
            type="text"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleMarcarLeida(notificacion.id)}
            disabled={notificacion.leida}
          />
        </Tooltip>
      ] : []}
    >
      <List.Item.Meta
        avatar={
          <Badge dot={!notificacion.leida}>
            <Avatar 
              className="notificacion-avatar"
              icon={getIconoNotificacion(notificacion.tipo)}
            />
          </Badge>
        }
        title={
          <div className="notificacion-header">
            <Text strong={!notificacion.leida} className="notificacion-titulo">
              {notificacion.titulo}
            </Text>
            <div className="notificacion-meta">
              <Tag size="small" color={getColorTipo(notificacion.tipo)}>
                {notificacion.tipo.replace('_', ' ')}
              </Tag>
              <Text type="secondary" className="notificacion-fecha">
                {dayjs(notificacion.fecha).fromNow()}
              </Text>
            </div>
          </div>
        }
        description={
          <div className="notificacion-contenido">
            <Text type={notificacion.leida ? 'secondary' : undefined}>
              {notificacion.contenido}
            </Text>
          </div>
        }
      />
    </List.Item>
  );

  const renderModalConfiguracion = () => (
    <Modal
      title="Configuración de Notificaciones"
      open={modalConfigVisible}
      onCancel={() => setModalConfigVisible(false)}
      footer={null}
      width={600}
    >
      <div className="config-notificaciones">
        <Title level={5}>📧 Notificaciones por Email</Title>
        <div className="config-group">
          <div className="config-item">
            <Text>Nuevos mensajes en chat</Text>
            <Switch
              checked={configuracion.email_nuevos_mensajes}
              onChange={(checked) => handleConfiguracionChange('email_nuevos_mensajes', checked)}
            />
          </div>
          <div className="config-item">
            <Text>Recordatorios de auditorías</Text>
            <Switch
              checked={configuracion.email_recordatorios}
              onChange={(checked) => handleConfiguracionChange('email_recordatorios', checked)}
            />
          </div>
          <div className="config-item">
            <Text>Cambios de estado</Text>
            <Switch
              checked={configuracion.email_cambios_estado}
              onChange={(checked) => handleConfiguracionChange('email_cambios_estado', checked)}
            />
          </div>
          <div className="config-item">
            <Text>Resumen diario</Text>
            <Switch
              checked={configuracion.email_resumen_diario}
              onChange={(checked) => handleConfiguracionChange('email_resumen_diario', checked)}
            />
          </div>
        </div>

        <Divider />

        <Title level={5}>🔔 Notificaciones Push</Title>
        <div className="config-group">
          <div className="config-item">
            <Text>Notificaciones en tiempo real</Text>
            <Switch
              checked={configuracion.notificaciones_push}
              onChange={(checked) => handleConfiguracionChange('notificaciones_push', checked)}
            />
          </div>
          <div className="config-item">
            <Text>Alertas críticas inmediatas</Text>
            <Switch
              checked={configuracion.notificaciones_criticas_inmediatas}
              onChange={(checked) => handleConfiguracionChange('notificaciones_criticas_inmediatas', checked)}
            />
          </div>
        </div>
      </div>
    </Modal>
  );

  if (compacto) {
    return (
      <div className="panel-notificaciones panel-notificaciones--compacto">
        <div className="notificaciones-header">
          <Badge count={noLeidas} size="small">
            <BellOutlined className="notificaciones-icon" />
          </Badge>
          <Text strong>Notificaciones</Text>
        </div>
        
        {notificaciones.slice(0, 5).map(renderNotificacion)}
        
        {notificaciones.length > 5 && (
          <div className="ver-todas">
            <Button type="link" size="small">
              Ver todas ({notificaciones.length})
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="panel-notificaciones">
      <Card
        title={
          <div className="notificaciones-card-header">
            <Space>
              <Badge count={noLeidas} size="small">
                <BellOutlined />
              </Badge>
              <span>Notificaciones</span>
            </Space>
          </div>
        }
        extra={
          <Space>
            <Tooltip title="Configuración">
              <Button
                type="text"
                icon={<SettingOutlined />}
                onClick={() => setModalConfigVisible(true)}
              />
            </Tooltip>
            <Tooltip title="Actualizar">
              <Button
                type="text"
                icon={<ReloadOutlined />}
                loading={loading}
                onClick={cargarDatos}
              />
            </Tooltip>
          </Space>
        }
        className="notificaciones-card"
      >
        <div className="notificaciones-controles">
          <Space>
            <Switch
              checked={mostrarSoloNoLeidas}
              onChange={(checked) => {
                setMostrarSoloNoLeidas(checked);
                obtenerNotificaciones({ solo_no_leidas: checked });
              }}
              checkedChildren="No leídas"
              unCheckedChildren="Todas"
            />
            {noLeidas > 0 && (
              <Button
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={handleMarcarTodasLeidas}
              >
                Marcar todas como leídas ({noLeidas})
              </Button>
            )}
          </Space>
        </div>

        <Divider style={{ margin: '12px 0' }} />

        <List
          className="notificaciones-lista"
          loading={loading}
          dataSource={notificaciones}
          renderItem={renderNotificacion}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  mostrarSoloNoLeidas 
                    ? "No tienes notificaciones sin leer" 
                    : "No tienes notificaciones"
                }
              />
            )
          }}
        />
      </Card>

      {renderModalConfiguracion()}
    </div>
  );
};

export default PanelNotificaciones;
