# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SAT-Digital is a comprehensive web system for managing technical infrastructure audits of data centers, with automatic analysis using local AI (Ollama) and commercial service capabilities.

**Key Context:**
- Digitizes manual audit processes for 5 providers, 12 sites, conducted semi-annually (May/November)
- Processes ~520 documents per period across 13 technical sections
- Current state: Windows 11 + XAMPP development environment
- Goal: 70% automation of document analysis process

## Tech Stack

**Backend:**
- Node.js 18 + Express.js + MySQL 8.0 (via XAMPP)
- ORM: Sequelize
- Authentication: JWT + bcrypt
- WebSockets: Socket.IO for real-time chat
- File Processing: Multer, Sharp, PDF processing
- Queue: Bull/Agenda for heavy jobs
- Logging: Winston with rotation

**Frontend:**
- React 18 + Vite
- UI: Material-UI (@mui/material)
- State Management: Zustand
- Forms: React Hook Form + Zod validation
- File Upload: @formkit/drag-and-drop
- Charts: Chart.js + react-chartjs-2
- Tables: @mui/x-data-grid + @tanstack/react-table
- Dates: Day.js + @mui/x-date-pickers
- Animations: Framer Motion
- HTTP: Axios

**AI Integration (Phase 3):**
- Local: Ollama with LLaVA (vision) + Llama 3.1 (text)
- Document Processing: PDF.js, automatic extraction
- Analysis: Technical threshold validation

## Development Commands

**Backend (Node.js):**
```bash
cd backend
npm run dev          # Development with nodemon
npm start            # Production
npm run migrate      # Database migrations
npm run seed         # Database seeding
npm run db:reset     # Reset and seed database
npm test             # Run tests
npm run lint         # ESLint
npm run health-check # System health verification
```

**Frontend (React):**
```bash
cd frontend
npm run dev     # Development with Vite (port 5173)
npm run build   # Production build
npm run lint    # ESLint
npm run preview # Preview production build
```

**System Scripts (Windows .bat files):**
- `start-full-system.bat` - Starts both backend and frontend
- `start-backend.bat` - Backend only
- `start-frontend.bat` - Frontend only

## Architecture

**Domain-Driven Structure:**
```
src/domains/
├── auth/           # Authentication & authorization
├── users/          # User management
├── providers/      # Provider management (5 providers)
├── audits/         # Audit management
├── documentos/     # Document management (13 technical sections)
├── comunicacion/   # Async chat system
├── notificaciones/ # Email & platform notifications
├── calendario/     # Audit scheduling
└── dashboard/      # Executive dashboards
```

**Database Models (MySQL):**
- `usuarios` - RBAC system (admin, auditor, proveedor, visualizador)
- `proveedores` - 5 main providers with strict segregation
- `sitios` - 12 distributed sites
- `auditorias` - Semi-annual audit cycles
- `documentos` - Document management with versioning
- `bitacora` - Complete system audit trail

**User Roles & Permissions:**
- **Admin:** Complete system management
- **Auditor:** Evaluations and assignments
- **Proveedor:** Only their sites (critical segregation)
- **Visualizador:** Executive dashboards only

## Development Methodology

**CSS Standards:**
- BEM methodology for naming
- No inline styles or hardcoded values
- Modular architecture with semantic classes

**Code Organization:**
- Domain separation
- Clean architecture by layers
- Phase-by-phase documentation updates

**Security Requirements:**
- JWT authentication with refresh tokens
- Role-based access control (RBAC)
- Provider data segregation (critical)
- Complete audit logging

## Technical Sections (13 Total)

**Real-time Analysis:**
1. Network Topology
2. Infrastructure Documentation & Controls
3. Technology Room Power
4. CT Temperature
5. Servers
6. Internet
7. On-site Trained Personnel
8. Escalation (Contact Numbers)

**Batch Analysis:**
9. Technology Room
10. Connectivity (Cable Certification)
11. Hardware/Software/Headset & Home Internet Status
12. Information Security
13. Environment Information

## Development Phases

**Phase 1: Infrastructure Base** ✅
- Development environment with XAMPP
- Complete database with all tables
- JWT authentication + RBAC
- RESTful API base
- React frontend with base components

**Phase 2: Audit Management** (Current)
- Programmable calendar
- Document loading by sections
- Async chat provider ↔ auditor
- Automatic notifications
- Status workflow

**Phase 3: AI & Analysis**
- Local Ollama integration
- Automatic PDF/Excel/image analysis
- Automatic scoring
- Intelligent recommendations

**Phase 4: Visits & Reports**
- Mobile workflow for visits
- AI vs reality comparison
- Customizable dashboards
- Business Intelligence

## Important URLs & Ports

- **Backend API:** http://localhost:3001/api
- **Frontend:** http://localhost:5173 (Vite) or http://localhost:3000
- **Health Check:** http://localhost:3001/health
- **phpMyAdmin:** http://localhost/phpmyadmin
- **Database:** `sat_digital` (MySQL)

## Provider Information

**5 Main Providers:**
1. **Grupo Activo SRL** - CUIT: 30-71044895-3 (Florida 141, CABA)
2. **Centro de Interacción Multimedia S.A. (APEX)** - CUIT: 30-70827680-0 (3 sites)
3. **CityTech S.A. (Teleperformance)** - CUIT: 30-70908678-9 (3 sites)
4. **CAT Technologies Argentina S.A** - CUIT: 30-70949292-2 (Mitre 853, CABA)
5. **Stratton Argentina SA (Konecta)** - CUIT: 30698477411 (3 sites)

## External Integrations

**Aternity API (Inventory):**
- URL: https://us3-odata.aternity.com/aternity.odata/latest/
- User: PJPalomanes@teco.com.ar
- Purpose: Real-time equipment inventory queries

## Documentation Structure

**Complete Documentation:** `documentacion/`
- `01-DOCUMENTO-MAESTRO.md` - Complete project vision
- `02-FASE-1-INFRAESTRUCTURA.md` - Technical base specifications
- `03-FASE-2-GESTION-AUDITORIAS.md` - Core business logic
- `04-FASE-3-IA-ANALISIS.md` - AI automation
- `05-FASE-4-VISITAS-REPORTES.md` - Final workflow
- `06-ESTADO-PROYECTO.md` - Progress control
- `07-CHECKPOINTS-GENERAL.md` - All checkpoints
- `08-PROMPTS-CONTINUIDAD.md` - Continuation prompts
- `PROMPT-CONTINUIDAD.md` - Current state context

## Current State & Next Steps

**Current Status:** Phase 2 Checkpoint 2.5 - Períodos de Auditoría COMPLETADO ✅
- ✅ **Sistema de períodos completo**: Gestión completa de períodos de auditoría
- ✅ **Autenticación real**: Login con JWT válidos y base de datos MySQL
- ✅ **Dashboard funcional**: Panel principal con métricas y período activo
- ✅ **6 usuarios creados**: Sistema RBAC completo con segregación por proveedor
- ✅ **Backend + Frontend operativos**: Ambos servicios funcionando correctamente
- ✅ **Base de datos poblada**: 5 proveedores, 12 sitios, 6 usuarios, secciones técnicas

**Credenciales de Acceso:**
- Admin: admin@satdigital.com / admin123
- Auditor General: auditor@satdigital.com / auditor123  
- Auditor Interno: auditoria@satdigital.com / auditor123
- Jefe Proveedor: proveedor@activo.com / proveedor123
- Técnico Proveedor: tecnico@activo.com / tecnico123
- Visualizador: visualizador@satdigital.com / visual123

**Próximos Desarrollos:**
1. **Sistema de Carga Documental**: Upload por secciones con validación automática
2. **Comunicación Asíncrona**: Chat auditor-proveedor en tiempo real
3. **Workflow de Estados**: Estados automáticos de auditorías
4. **Integración IA**: Ollama + LLaVA para análisis automático

**Key Files to Reference:**
- Backend entry point: `backend/src/app.js` (✅ funcionando)
- Frontend entry point: `frontend/src/main.jsx` (✅ funcionando)
- Database models: `backend/src/shared/database/models/` (✅ poblado)
- Seeders: `backend/src/shared/database/seeders.js` (✅ ejecutado)

## Testing Strategy

- **Unit Tests:** 60% (Jest + Supertest for backend, Vitest for frontend)
- **Integration Tests:** 25%
- **E2E Tests:** 15%
- **Coverage Target:** 80%+

## Performance & Scalability

- Multi-tenant architecture ready
- Normalized database for large volumes
- Local AI avoids external API costs
- Intelligent cache for frequent reports
- Automated daily backups
