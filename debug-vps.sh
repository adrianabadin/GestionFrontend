#!/bin/bash

# Script de diagnóstico para VPS
# Uso: bash debug-vps.sh

echo "🔍 DIAGNÓSTICO DE ESTILOS EN VPS"
echo "================================"
echo ""

# 1. Verificar archivos de fuentes
echo "1️⃣ Verificando archivos de fuentes..."
if [ -d "public/fonts" ]; then
    FONT_COUNT=$(ls -1 public/fonts/*.ttf 2>/dev/null | wc -l)
    echo "   ✓ Carpeta public/fonts existe"
    echo "   ✓ Archivos .ttf encontrados: $FONT_COUNT"
    if [ $FONT_COUNT -lt 5 ]; then
        echo "   ⚠️  ADVERTENCIA: Pocas fuentes encontradas"
    fi
else
    echo "   ✗ ERROR: Carpeta public/fonts NO existe"
fi
echo ""

# 2. Verificar archivo fonts.ts
echo "2️⃣ Verificando src/app/fonts.ts..."
if [ -f "src/app/fonts.ts" ]; then
    echo "   ✓ Archivo fonts.ts existe"
else
    echo "   ✗ ERROR: fonts.ts NO existe"
fi
echo ""

# 3. Verificar globals.css
echo "3️⃣ Verificando src/app/globals.css..."
if [ -f "src/app/globals.css" ]; then
    echo "   ✓ Archivo globals.css existe"
    grep -q "@tailwind" src/app/globals.css && echo "   ✓ Tailwind CSS configurado" || echo "   ✗ Tailwind NO configurado"
else
    echo "   ✗ ERROR: globals.css NO existe"
fi
echo ""

# 4. Limpiar cache
echo "4️⃣ Limpiando cache de Next.js..."
rm -rf .next
echo "   ✓ Cache .next eliminado"
echo ""

# 5. Reinstalar dependencias
echo "5️⃣ ¿Reinstalar node_modules? (Toma tiempo)"
read -p "   Presiona 'y' para reinstalar o cualquier tecla para omitir: " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Eliminando node_modules..."
    rm -rf node_modules package-lock.json
    echo "   Instalando dependencias..."
    npm install
    echo "   ✓ Dependencias reinstaladas"
else
    echo "   ⊘ Reinstalación omitida"
fi
echo ""

# 6. Compilar
echo "6️⃣ Compilando proyecto..."
npm run build
BUILD_EXIT_CODE=$?
echo ""

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ COMPILACIÓN EXITOSA"
    echo ""
    echo "7️⃣ Para iniciar el servidor:"
    echo "   npm start"
else
    echo "❌ ERROR EN COMPILACIÓN"
    echo ""
    echo "🔧 SOLUCIÓN DE EMERGENCIA:"
    echo "   Para usar layout SIN fuentes locales (diagnóstico):"
    echo "   1. cp src/app/layout.tsx src/app/layout.original.tsx"
    echo "   2. cp src/app/layout.backup.tsx src/app/layout.tsx"
    echo "   3. npm run build"
    echo "   4. npm start"
    echo ""
    echo "   Para restaurar:"
    echo "   cp src/app/layout.original.tsx src/app/layout.tsx"
fi
