# SAT-Digital Backend Setup Script for Windows PowerShell
# Automatiza la configuración inicial del entorno de desarrollo

Write-Host "🚀 SAT-Digital Backend Setup Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Verificar Node.js
Write-Host "📋 Checking Node.js version..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    $versionNumber = [int]($nodeVersion -replace "v|(\.\d+)+", "")
    
    if ($versionNumber -lt 18) {
        Write-Host "❌ Node.js version $nodeVersion detected. Minimum required: v18" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Node.js not found. Please install Node.js 18+ first." -ForegroundColor Red
    Write-Host "   Download from: https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Verificar npm
Write-Host "📋 Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ npm not found." -ForegroundColor Red
    exit 1
}

# Verificar XAMPP
Write-Host "📋 Checking XAMPP MySQL..." -ForegroundColor Yellow
$xamppPath = "C:\xampp\mysql\bin\mysql.exe"
if (Test-Path $xamppPath) {
    Write-Host "✅ XAMPP MySQL found" -ForegroundColor Green
} else {
    Write-Host "⚠️  XAMPP MySQL not found at default location" -ForegroundColor Yellow
    Write-Host "   Please ensure XAMPP is installed and MySQL is running" -ForegroundColor Yellow
}

# Instalar dependencias
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully" -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Copiar archivo de entorno
Write-Host "⚙️  Setting up environment..." -ForegroundColor Yellow
if (-Not (Test-Path ".env")) {
    Copy-Item ".env.example" ".env"
    Write-Host "✅ Environment file created (.env)" -ForegroundColor Green
    Write-Host "⚠️  Please edit .env file with your specific configuration" -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  Environment file already exists" -ForegroundColor Blue
}

# Crear directorios necesarios
Write-Host "📁 Creating required directories..." -ForegroundColor Yellow
$directories = @("logs", "uploads", "temp")
foreach ($dir in $directories) {
    if (-Not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
}
Write-Host "✅ Directories created" -ForegroundColor Green

# Ejecutar health check
Write-Host "🔍 Running health check..." -ForegroundColor Yellow
try {
    npm run health-check
} catch {
    Write-Host "⚠️  Health check encountered issues (this is normal for initial setup)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit .env file with your configuration" -ForegroundColor White
Write-Host "2. Start XAMPP Control Panel and ensure Apache + MySQL are running" -ForegroundColor White
Write-Host "3. Open phpMyAdmin (http://localhost/phpmyadmin)" -ForegroundColor White
Write-Host "4. Create database 'sat_digital'" -ForegroundColor White
Write-Host "5. Run 'npm run dev' to start development server" -ForegroundColor White
Write-Host ""
Write-Host "📚 Documentation: C:\xampp\htdocs\SAT-Digital\documentacion\" -ForegroundColor Yellow
Write-Host "🌐 Once running: http://localhost:3001/health" -ForegroundColor Yellow
Write-Host "🔧 API Base: http://localhost:3001/api/v1" -ForegroundColor Yellow
Write-Host ""

# Esperar input del usuario
Write-Host "Press any key to continue..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
