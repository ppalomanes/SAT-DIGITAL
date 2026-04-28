# SAT-Digital — Ambientes y Deploy

## Arquitectura de ambientes

```
┌─────────────────────────────┐     ┌──────────────────────────────────┐
│   LOCAL (desarrollo)        │     │   PRODUCCIÓN                     │
│                             │     │                                  │
│  PC propia, otra red        │     │  DWIN0540 - 10.75.247.181        │
│  localhost:5173 (frontend)  │     │  http://sat.personal.com.ar      │
│  localhost:3001 (backend)   │     │  D:\webs\SAT-DIGITAL\            │
│  Rama git: local            │     │  Rama git: main                  │
└─────────────────────────────┘     └──────────────────────────────────┘
              │                                      │
              └──────────────┬───────────────────────┘
                             │
                    ┌────────▼────────┐
                    │   DWIN0293      │
                    │   SQL Server    │
                    │  sat_digital_v2 │
                    │  (compartida)   │
                    └─────────────────┘
```

---

## Reglas de ramas

| Rama    | Propósito                        | Se despliega en |
|---------|----------------------------------|-----------------|
| `local` | Desarrollo diario, nuevas features | Tu PC local     |
| `main`  | Código estable, producción       | DWIN0540        |

**Regla:** nunca desarrollar directo en `main`. Todo pasa por `local` primero.

---

## Flujo de trabajo diario

### 1. Desarrollar en local

```bash
# Estás siempre en la rama local
git checkout local

# Hacés cambios, los commiteás
git add .
git commit -m "feat: descripcion del cambio"

# Pusheás tu rama como respaldo
git push origin local
```

### 2. Probar localmente

```bash
# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev
# Abre http://localhost:5173
```

### 3. Subir a producción (deploy)

```bash
# Paso 1: desde tu PC, mergear local a main y pushear
git checkout main
git merge local
git push origin main
git checkout local        # volver a trabajar en local
```

```
# Paso 2: en DWIN0540 (RDP al servidor)
# Click derecho → Ejecutar como Administrador:
D:\webs\SAT-DIGITAL\deploy\deploy.bat
```

El script hace automáticamente:
- `git pull origin main`
- `npm install --production` (backend)
- `npm run build` (frontend)
- Reinicia el servicio Windows `satbackend.exe`

---

## Revertir un deploy que salió mal

```bash
# En DWIN0540, PowerShell como Administrador:

# Ver historial de commits
git -C D:\webs\SAT-DIGITAL log --oneline -5

# Revertir al commit anterior
git -C D:\webs\SAT-DIGITAL reset --hard HEAD~1

# Reiniciar el servicio
sc stop "satbackend.exe"
timeout /t 3 /nobreak
sc start "satbackend.exe"
```

---

## Variables de entorno

Los archivos `.env` **no van a Git** (están en `.gitignore`).  
Cada ambiente tiene su propio `.env` configurado directamente en el servidor.

| Archivo                  | Ambiente     | Ubicación          |
|--------------------------|--------------|--------------------|
| `backend/.env`           | Producción   | DWIN0540 (manual)  |
| `backend/.env.local`     | Desarrollo   | Tu PC (manual)     |
| `frontend/.env`          | Producción   | DWIN0540 (manual)  |
| `frontend/.env.local`    | Desarrollo   | Tu PC (manual)     |

Si agregás una variable nueva al proyecto, acordate de agregarla manualmente
en el `.env` del servidor antes de hacer el deploy.

---

## Comandos útiles de referencia

```bash
# Ver en qué rama estás
git branch

# Ver estado de cambios
git status

# Ver diferencias entre local y main
git log main..local --oneline

# Ver estado del servicio en DWIN0540
sc query "satbackend.exe"

# Reiniciar servicio manualmente en DWIN0540
sc stop "satbackend.exe" && timeout /t 3 && sc start "satbackend.exe"

# Ver logs del servicio en DWIN0540
type D:\webs\SAT-DIGITAL\backend\daemon\satbackend.err.log
type D:\webs\SAT-DIGITAL\backend\daemon\satbackend.out.log
```

---

## Checklist antes de cada deploy

- [ ] El backend corre sin errores en local (`npm run dev`)
- [ ] El frontend carga correctamente en `http://localhost:5173`
- [ ] Todos los cambios están commiteados en `local`
- [ ] `git push origin local` ejecutado (respaldo)
- [ ] Si agregaste variables `.env` nuevas → agregarlas en DWIN0540 antes del deploy
- [ ] `git checkout main && git merge local && git push origin main`
- [ ] Ejecutar `deploy.bat` en DWIN0540 como Administrador
- [ ] Verificar `http://sat.personal.com.ar/dashboard` después del deploy
