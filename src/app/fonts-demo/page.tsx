"use client";

import { Card, CardBody, Typography } from "@material-tailwind/react";

/**
 * Página de demostración de fuentes locales
 * Ruta: /fonts-demo
 */
export default function FontsDemoPage() {
  const weights = [
    { name: "Thin", class: "font-thin", weight: "100" },
    { name: "Extra Light", class: "font-extralight", weight: "200" },
    { name: "Light", class: "font-light", weight: "300" },
    { name: "Normal", class: "font-normal", weight: "400" },
    { name: "Medium", class: "font-medium", weight: "500" },
    { name: "Semi Bold", class: "font-semibold", weight: "600" },
    { name: "Bold", class: "font-bold", weight: "700" },
    { name: "Extra Bold", class: "font-extrabold", weight: "800" },
    { name: "Black", class: "font-black", weight: "900" },
  ];

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Demostración de Fuentes Locales
        </h1>
        <p className="text-gray-600">
          Todas las fuentes se cargan desde /public/fonts (sin Google Fonts)
        </p>
      </div>

      {/* Inter Font */}
      <Card>
        <CardBody>
          <Typography variant="h3" className="mb-4 font-inter">
            Inter - Fuente Principal (Variable Font)
          </Typography>
          <p className="text-sm text-gray-500 mb-6">
            Clase CSS: <code className="bg-gray-100 px-2 py-1 rounded">font-inter</code> o por defecto
          </p>

          <div className="space-y-4">
            {weights.map((weight) => (
              <div key={weight.weight} className="border-b pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 font-mono">
                    {weight.name} ({weight.weight})
                  </span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {weight.class}
                  </code>
                </div>
                <p className={`font-inter ${weight.class} text-xl`}>
                  The quick brown fox jumps over the lazy dog
                </p>
                <p className={`font-inter ${weight.class} text-lg`}>
                  El veloz murciélago hindú comía feliz cardillo y kiwi
                </p>
              </div>
            ))}
          </div>

          {/* Italic */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-3">Cursiva (Italic)</h4>
            <p className="font-inter font-normal italic text-xl mb-2">
              The quick brown fox jumps over the lazy dog (Normal Italic)
            </p>
            <p className="font-inter font-bold italic text-xl">
              The quick brown fox jumps over the lazy dog (Bold Italic)
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Roboto Font */}
      <Card>
        <CardBody>
          <Typography variant="h3" className="mb-4 font-roboto">
            Roboto - Fuente Alternativa (Variable Font)
          </Typography>
          <p className="text-sm text-gray-500 mb-6">
            Clase CSS: <code className="bg-gray-100 px-2 py-1 rounded">font-roboto</code>
          </p>

          <div className="space-y-4">
            {weights.map((weight) => (
              <div key={weight.weight} className="border-b pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 font-mono">
                    {weight.name} ({weight.weight})
                  </span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    font-roboto {weight.class}
                  </code>
                </div>
                <p className={`font-roboto ${weight.class} text-xl`}>
                  The quick brown fox jumps over the lazy dog
                </p>
                <p className={`font-roboto ${weight.class} text-lg`}>
                  El veloz murciélago hindú comía feliz cardillo y kiwi
                </p>
              </div>
            ))}
          </div>

          {/* Italic */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-3">Cursiva (Italic)</h4>
            <p className="font-roboto font-normal italic text-xl mb-2">
              The quick brown fox jumps over the lazy dog (Normal Italic)
            </p>
            <p className="font-roboto font-bold italic text-xl">
              The quick brown fox jumps over the lazy dog (Bold Italic)
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Roboto Condensed Font */}
      <Card>
        <CardBody>
          <Typography variant="h3" className="mb-4 font-roboto-condensed">
            Roboto Condensed - Encabezados y Espacios Reducidos
          </Typography>
          <p className="text-sm text-gray-500 mb-6">
            Clase CSS: <code className="bg-gray-100 px-2 py-1 rounded">font-roboto-condensed</code>
          </p>

          <div className="space-y-4">
            {weights.map((weight) => (
              <div key={weight.weight} className="border-b pb-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-500 font-mono">
                    {weight.name} ({weight.weight})
                  </span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                    font-roboto-condensed {weight.class}
                  </code>
                </div>
                <p className={`font-roboto-condensed ${weight.class} text-xl`}>
                  The quick brown fox jumps over the lazy dog
                </p>
                <p className={`font-roboto-condensed ${weight.class} text-lg`}>
                  El veloz murciélago hindú comía feliz cardillo y kiwi
                </p>
              </div>
            ))}
          </div>

          {/* Italic */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold mb-3">Cursiva (Italic)</h4>
            <p className="font-roboto-condensed font-normal italic text-xl mb-2">
              The quick brown fox jumps over the lazy dog (Normal Italic)
            </p>
            <p className="font-roboto-condensed font-bold italic text-xl">
              The quick brown fox jumps over the lazy dog (Bold Italic)
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Comparison */}
      <Card className="bg-blue-50">
        <CardBody>
          <Typography variant="h3" className="mb-6">
            Comparación de Fuentes
          </Typography>

          <div className="space-y-4">
            <div>
              <h4 className="text-sm text-gray-600 mb-2">Inter (Default)</h4>
              <p className="font-inter font-normal text-2xl">
                El sistema de gestión regional permite administrar eficientemente los departamentos
              </p>
            </div>

            <div>
              <h4 className="text-sm text-gray-600 mb-2">Roboto</h4>
              <p className="font-roboto font-normal text-2xl">
                El sistema de gestión regional permite administrar eficientemente los departamentos
              </p>
            </div>

            <div>
              <h4 className="text-sm text-gray-600 mb-2">Roboto Condensed</h4>
              <p className="font-roboto-condensed font-normal text-2xl">
                El sistema de gestión regional permite administrar eficientemente los departamentos
              </p>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Usage Examples */}
      <Card className="bg-green-50">
        <CardBody>
          <Typography variant="h3" className="mb-6">
            Ejemplos de Uso Recomendado
          </Typography>

          <div className="space-y-6">
            <div>
              <h4 className="font-semibold mb-2">Encabezado de Página Principal</h4>
              <h1 className="font-roboto-condensed font-bold text-4xl">
                Panel de Gestión Regional
              </h1>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Subtítulo</h4>
              <h2 className="font-inter font-semibold text-2xl">
                Departamentos y Gestión Ciudadana
              </h2>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Texto de Párrafo</h4>
              <p className="font-inter font-normal text-base leading-relaxed">
                Este es un ejemplo de texto de párrafo usando la fuente Inter que es muy legible
                y funciona perfectamente para contenido largo. La fuente Inter fue diseñada
                específicamente para interfaces digitales y pantallas.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Texto Destacado</h4>
              <p className="font-roboto font-medium text-lg">
                Información importante que necesita destacarse del resto del contenido
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Botón o CTA</h4>
              <button className="font-inter font-semibold text-base bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-colors">
                Guardar Cambios
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
