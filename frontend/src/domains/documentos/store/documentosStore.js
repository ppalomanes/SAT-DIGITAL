import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import documentosService from '../services/documentosService';

const useDocumentosStore = create(
  persist(
    (set, get) => ({
      // Estado inicial
      documentos: [],
      documentosPorSeccion: {},
      progreso: {
        secciones_totales: 13,
        secciones_completas: 0,
        porcentaje_total: 0,
        completitud: false
      },
      cargaEnProgreso: false,
      archivosEnCola: [],
      loading: false,
      error: null,

      // Acciones
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      
      /**
       * Cargar documentos de una auditoría
       */
      cargarDocumentosAuditoria: async (auditoriaId) => {
        set({ loading: true, error: null });
        try {
          const response = await documentosService.obtenerDocumentos(auditoriaId);
          set({
            documentos: response.documentos || [],
            documentosPorSeccion: response.documentos_por_seccion || {},
            loading: false
          });
        } catch (error) {
          set({ 
            error: error.message || 'Error cargando documentos',
            loading: false 
          });
        }
      },

      /**
       * Subir archivos
       */
      subirArchivos: async (auditoriaId, seccionId, archivos, observaciones = '') => {
        set({ cargaEnProgreso: true, error: null });
        
        try {
          const formData = new FormData();
          formData.append('auditoria_id', auditoriaId.toString());
          formData.append('seccion_id', seccionId.toString());
          formData.append('observaciones', observaciones);
          
          // Agregar archivos al FormData
          Array.from(archivos).forEach((archivo, index) => {
            formData.append('documentos', archivo);
          });

          const response = await documentosService.cargarDocumentos(formData);
          
          // Actualizar estado con documentos nuevos
          const estadoActual = get();
          const nuevosDocumentos = [...estadoActual.documentos, ...response.documentos];
          
          set({
            documentos: nuevosDocumentos,
            progreso: response.progreso || estadoActual.progreso,
            cargaEnProgreso: false
          });

          // Recargar documentos para tener datos actualizados
          await get().cargarDocumentosAuditoria(auditoriaId);
          // Actualizar progreso después de recargar documentos
          await get().obtenerProgreso(auditoriaId);
          
          return response;
        } catch (error) {
          set({ 
            error: error.message || 'Error subiendo archivos',
            cargaEnProgreso: false 
          });
          throw error;
        }
      },

      /**
       * Eliminar documento
       */
      eliminarDocumento: async (documentoId, auditoriaId) => {
        set({ loading: true, error: null });
        try {
          await documentosService.eliminarDocumento(documentoId);
          
          // Actualizar estado local
          const estadoActual = get();
          const documentosFiltrados = estadoActual.documentos.filter(
            doc => doc.id !== documentoId
          );
          
          set({ 
            documentos: documentosFiltrados,
            loading: false 
          });

          // Recargar para actualizar progreso
          await get().cargarDocumentosAuditoria(auditoriaId);
          // Actualizar progreso después de recargar documentos
          await get().obtenerProgreso(auditoriaId);
        } catch (error) {
          set({ 
            error: error.message || 'Error eliminando documento',
            loading: false 
          });
          throw error;
        }
      },

      /**
       * Obtener progreso de auditoría
       */
      obtenerProgreso: async (auditoriaId) => {
        try {
          const progreso = await documentosService.obtenerProgreso(auditoriaId);
          set({ progreso });
          return progreso;
        } catch (error) {
          console.error('Error obteniendo progreso:', error);
          return null;
        }
      },

      /**
       * Agregar archivos a la cola de carga
       */
      agregarArchivosACola: (archivos) => {
        const nuevosArchivos = Array.from(archivos).map(archivo => ({
          id: Date.now() + Math.random(),
          archivo,
          estado: 'pendiente',
          progreso: 0
        }));
        
        set(state => ({
          archivosEnCola: [...state.archivosEnCola, ...nuevosArchivos]
        }));
      },

      /**
       * Limpiar cola de archivos
       */
      limpiarCola: () => set({ archivosEnCola: [] }),

      /**
       * Validar archivo antes de subir
       */
      validarArchivo: (archivo, seccionId) => {
        const errores = [];
        const warnings = [];

        // Validar tamaño máximo (200MB)
        const tamañoMaximo = 200 * 1024 * 1024;
        if (archivo.size > tamañoMaximo) {
          errores.push('Archivo excede el tamaño máximo de 200MB');
        }

        // Validar tipo de archivo
        const extensionesPermitidas = ['.pdf', '.jpg', '.jpeg', '.png', '.xlsx'];
        const extension = archivo.name.toLowerCase().substring(archivo.name.lastIndexOf('.'));
        
        if (!extensionesPermitidas.includes(extension)) {
          errores.push(`Tipo de archivo no permitido: ${extension}`);
        }

        // Validaciones específicas por sección
        const validacionesEspecificas = get().obtenerValidacionesSeccion(seccionId);
        if (validacionesEspecificas) {
          if (!validacionesEspecificas.extensiones.includes(extension.substring(1))) {
            errores.push(`Para esta sección se requiere: ${validacionesEspecificas.extensiones.join(', ')}`);
          }
          
          if (archivo.size > validacionesEspecificas.tamañoMaximo) {
            errores.push(`Tamaño máximo para esta sección: ${validacionesEspecificas.tamañoMaximo / (1024*1024)}MB`);
          }
        }

        return {
          valido: errores.length === 0,
          errores,
          warnings
        };
      },

      /**
       * Obtener validaciones específicas por sección
       */
      obtenerValidacionesSeccion: (seccionId) => {
        const validaciones = {
          1: { // Topología de red
            extensiones: ['pdf'],
            tamañoMaximo: 50 * 1024 * 1024
          },
          11: { // Parque informático
            extensiones: ['xlsx'],
            tamañoMaximo: 10 * 1024 * 1024
          },
          9: { // Cuarto tecnología
            extensiones: ['jpg', 'jpeg', 'png', 'pdf'],
            tamañoMaximo: 200 * 1024 * 1024
          }
        };
        
        return validaciones[seccionId] || {
          extensiones: ['pdf', 'jpg', 'jpeg', 'png', 'xlsx'],
          tamañoMaximo: 100 * 1024 * 1024
        };
      },

      /**
       * Resetear store
       */
      reset: () => set({
        documentos: [],
        documentosPorSeccion: {},
        progreso: {
          secciones_totales: 13,
          secciones_completas: 0,
          porcentaje_total: 0,
          completitud: false
        },
        cargaEnProgreso: false,
        archivosEnCola: [],
        loading: false,
        error: null
      })
    }),
    {
      name: 'documentos-store',
      partialize: (state) => ({
        // Solo persiste algunos datos, no el estado de carga
        progreso: state.progreso
      })
    }
  )
);

export default useDocumentosStore;