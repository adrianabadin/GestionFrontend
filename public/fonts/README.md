# Fuentes del Proyecto MPF.AI

Este directorio contiene las fuentes locales utilizadas en el proyecto para optimizar el rendimiento y evitar dependencias externas de Google Fonts.

## Fuentes Disponibles

### 1. Inter (Fuente Principal)
- **Tipo**: Variable Font
- **Archivos**:
  - `Inter-VariableFont_opsz,wght.ttf` - Normal
  - `Inter-Italic-VariableFont_opsz,wght.ttf` - Itálica
- **Pesos soportados**: 100-900 (dinámico)
- **Uso**: Fuente por defecto en todo el sitio

### 2. Roboto (Fuente Alternativa)
- **Tipo**: Variable Font
- **Archivos**:
  - `Roboto-VariableFont_wdth,wght.ttf` - Normal
  - `Roboto-Italic-VariableFont_wdth,wght.ttf` - Itálica
- **Características**: Soporta diferentes anchos (width) y pesos
- **Uso**: Disponible mediante `className="font-roboto"`

### 3. Roboto Condensed (Encabezados)
- **Tipo**: Fuentes estáticas
- **Pesos disponibles**: 100, 200, 300, 400, 500, 600, 700, 800, 900
- **Variantes**: Normal e Itálica para cada peso
- **Uso**: Ideal para encabezados o espacios reducidos con `className="font-roboto-condensed"`

## Uso en el Código

### Con Tailwind CSS (Recomendado)

```tsx
// Fuente Inter (por defecto)
<p className="font-inter font-normal">Texto normal</p>
<h1 className="font-inter font-bold">Título con Inter</h1>

// Fuente Roboto
<p className="font-roboto font-medium">Texto con Roboto</p>

// Fuente Roboto Condensed
<h2 className="font-roboto-condensed font-semibold">Encabezado compacto</h2>
```

### Pesos de Fuente Disponibles

- `font-thin` - 100
- `font-extralight` - 200
- `font-light` - 300
- `font-normal` - 400
- `font-medium` - 500
- `font-semibold` - 600
- `font-bold` - 700
- `font-extrabold` - 800
- `font-black` - 900

### CSS Variables

Las fuentes también están disponibles como variables CSS:

```css
/* En cualquier archivo CSS */
.custom-class {
  font-family: var(--font-inter);
}

.alternative-font {
  font-family: var(--font-roboto);
}

.condensed-font {
  font-family: var(--font-roboto-condensed);
}
```

## Ventajas de Fuentes Locales

1. **Rendimiento**: Carga más rápida al no depender de servidores externos
2. **Privacidad**: No se hacen peticiones a Google Fonts
3. **Offline**: El sitio funciona completamente offline
4. **GDPR**: Cumplimiento con regulaciones de privacidad europeas
5. **Control**: Versionado de fuentes junto con el código

## Optimizaciones de Next.js

Las fuentes están configuradas con:
- `display: swap` - Evita FOIT (Flash of Invisible Text)
- `preload: true` - Precarga para mejor rendimiento
- Variable fonts cuando sea posible - Menor tamaño de archivo
- Subsetting automático por Next.js

## Archivos de Configuración

- `/src/app/fonts.ts` - Definición de fuentes con next/font/local
- `/src/app/layout.tsx` - Aplicación de fuentes al layout raíz
- `/tailwind.config.ts` - Configuración de clases de utilidad
- `/src/app/globals.css` - Documentación de uso

## Mantenimiento

Para actualizar las fuentes:
1. Descarga las nuevas versiones
2. Reemplaza los archivos en este directorio
3. Verifica que los nombres de archivo coincidan con `/src/app/fonts.ts`
4. Ejecuta `npm run build` para verificar que todo funciona
