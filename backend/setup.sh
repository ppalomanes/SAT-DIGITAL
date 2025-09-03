#!/bin/bash

# SAT-Digital Backend Setup Script
# Automatiza la configuración inicial del entorno de desarrollo

echo "🚀 SAT-Digital Backend Setup Script"
echo "=================================="

# Verificar Node.js
echo "📋 Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js not found. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt "18" ]; then
    echo "❌ Node.js version $NODE_VERSION detected. Minimum required: 18"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Verificar npm
echo "📋 Checking npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found."
    exit 1
fi
echo "✅ npm version: $(npm -v)"

# Instalar dependencias
echo "📦 Installing dependencies..."
if ! npm install; then
    echo "❌ Failed to install dependencies"
    exit 1
fi
echo "✅ Dependencies installed successfully"

# Copiar archivo de entorno
echo "⚙️  Setting up environment..."
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "✅ Environment file created (.env)"
    echo "⚠️  Please edit .env file with your specific configuration"
else
    echo "ℹ️  Environment file already exists"
fi

# Crear directorios necesarios
echo "📁 Creating required directories..."
mkdir -p logs uploads temp
echo "✅ Directories created"

# Verificar MySQL (XAMPP)
echo "🗄️  Checking MySQL connection..."
if ! command -v mysql &> /dev/null; then
    echo "⚠️  MySQL command not found. Make sure XAMPP is installed and MySQL is in PATH"
    echo "   You can continue and check manually later"
else
    echo "✅ MySQL client found"
fi

# Ejecutar health check
echo "🔍 Running health check..."
npm run health-check

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit .env file with your configuration"
echo "2. Start XAMPP and ensure MySQL is running"
echo "3. Create database 'sat_digital' in phpMyAdmin"
echo "4. Run 'npm run dev' to start development server"
echo ""
echo "📚 Documentation: C:\\xampp\\htdocs\\SAT-Digital\\documentacion\\"
echo "🌐 Once running: http://localhost:3001/health"
echo ""
