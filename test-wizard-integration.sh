#!/bin/bash

# Script para probar la integración del wizard con el backend
# Ejecutar desde la carpeta raíz del proyecto backend

echo "🧪 Iniciando tests de integración del Routine Wizard"

# 1. Verificar que el servidor esté corriendo
echo "📡 Verificando servidor..."
curl -f http://localhost:3000/health || {
  echo "❌ El servidor no está corriendo. Iniciarlo con: npm run start:dev"
  exit 1
}

# 2. Test de creación de rutina completa
echo "🚀 Probando creación de rutina completa..."

# Payload de prueba (compatible con el wizard)
PAYLOAD='{
  "studentId": 1,
  "macrocycle": {
    "nombre": "Preparación General",
    "fechaInicio": "2024-01-01",
    "fechaFin": "2024-03-31",
    "objetivo": "Acondicionamiento base"
  },
  "mesociclos": [
    {
      "nombre": "Adaptación",
      "fechaInicio": "2024-01-01",
      "fechaFin": "2024-01-31",
      "objetivo": "Adaptación inicial"
    },
    {
      "nombre": "Desarrollo",
      "fechaInicio": "2024-02-01",
      "fechaFin": "2024-02-28",
      "objetivo": "Desarrollo de fuerza"
    }
  ],
  "microciclos": [
    {
      "mesocicloIndex": 0,
      "cantidadMicrociclos": 2,
      "plantillaDias": [
        {
          "dia": 1,
          "nombre": "Pecho y Tríceps",
          "esDescanso": false,
          "ejercicios": [
            {
              "nombre": "Press Banca",
              "grupoMuscular": "Pecho",
              "series": "4",
              "repeticiones": "8-10",
              "descanso": "90s",
              "rirEsperado": "2-3"
            },
            {
              "nombre": "Press Inclinado",
              "grupoMuscular": "Pecho",
              "series": "3",
              "repeticiones": "10-12",
              "descanso": "75s",
              "rirEsperado": "2-3"
            }
          ]
        },
        {
          "dia": 2,
          "nombre": "Descanso",
          "esDescanso": true,
          "ejercicios": []
        }
      ]
    }
  ]
}'

# Hacer la petición
RESPONSE=$(curl -s -X POST \
  http://localhost:3000/routine/create-complete \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d "$PAYLOAD")

echo "📋 Respuesta del servidor:"
echo "$RESPONSE" | jq . || echo "$RESPONSE"

# 3. Verificar que se creó correctamente
if echo "$RESPONSE" | grep -q '"success":true'; then
  echo "✅ Rutina creada exitosamente!"
  
  # Extraer el ID del macrociclo
  MACRO_ID=$(echo "$RESPONSE" | jq -r '.macrocycleId // empty')
  
  if [ ! -z "$MACRO_ID" ]; then
    echo "🎯 Macrociclo creado con ID: $MACRO_ID"
    
    # Verificar en la base de datos
    echo "🔍 Verificando en la base de datos..."
    # TODO: Agregar query de verificación
  fi
else
  echo "❌ Error al crear la rutina"
  echo "$RESPONSE"
  exit 1
fi

echo ""
echo "🎉 Tests completados exitosamente!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Probar desde el frontend (wizard)"
echo "2. Verificar que los datos se guarden correctamente"
echo "3. Probar las APIs de modificación (FASE 2)"
