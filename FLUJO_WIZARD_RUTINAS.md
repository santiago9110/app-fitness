# 🧙‍♂️ Wizard de Creación de Rutinas - Flujo Mejorado

## 🎯 **Objetivo**

Crear un flujo de wizard completo y fluido para la creación de rutinas (Macrociclo → Mesociclos → Microciclos) que permita al coach definir toda la estructura de una vez y tener un preview completo antes de crear.

---

## 📋 **Flujo Actual vs Propuesto**

### **❌ Flujo Actual (Problemático)**

```
StudentDetail.jsx
├─ Botón "Crear Rutina"
├─ MacroCycleForm (crear 1 macro)
├─ MesocycleForm (crear 1 meso)
├─ MicrocycleForm (crear 1 micro)
└─ FIN (solo 1 micro creado)
```

### **✅ Flujo Propuesto (Mejorado)**

```
StudentDetail.jsx
├─ Botón "Crear Rutina Completa"
└─ RoutineWizard.jsx
    ├─ Step 1: Configurar Macrociclo
    ├─ Step 2: Configurar Mesociclos (cantidad + nombres)
    ├─ Step 3: Configurar Microciclos (cantidad por meso)
    ├─ Step 4: Preview Timeline Completo
    └─ Step 5: Crear Todo + Redireccionar
```

---

## 🛠️ **Pasos Detallados del Wizard**

### **📝 STEP 1: Configurar Macrociclo**

```javascript
// Datos a capturar:
{
  objetivo: "Hipertrofia General",
  fechaInicio: "2025-08-06",
  fechaFin: "2025-12-06",
  observaciones: "Alumno principiante, enfoque en técnica"
}

// UI Elements:
- Input: Objetivo/Nombre del macrociclo
- Date: Fecha inicio
- Date: Fecha fin (auto-calculada o manual)
- Textarea: Observaciones generales
- Botón: "Siguiente: Configurar Mesociclos"
```

### **📅 STEP 2: Configurar Mesociclos**

```javascript
// Datos a capturar:
{
  cantidadMesociclos: 3,
  duracionDefecto: 4, // semanas por meso
  mesociclos: [
    { nombre: "Adaptación", duracion: 4, objetivo: "Técnica básica" },
    { nombre: "Desarrollo", duracion: 6, objetivo: "Incremento volumen" },
    { nombre: "Intensificación", duracion: 6, objetivo: "Máxima intensidad" }
  ]
}

// UI Elements:
- Slider/Input: ¿Cuántos mesociclos? (1-6)
- Input: Duración por defecto (semanas)
- Para cada mesociclo:
  ├─ Input: Nombre del mesociclo
  ├─ Input: Duración (semanas) [prefillado con defecto]
  └─ Input: Objetivo del mesociclo
- Timeline preview: Barra visual con fechas
- Botón: "Siguiente: Configurar Microciclos"
```

### **📆 STEP 3: Configurar Microciclos**

```javascript
// Datos a capturar:
{
  microciclosConfig: [
    {
      mesocicloIndex: 0,
      cantidadMicros: 4,
      duracionDefecto: 7, // días
      microciclos: [
        { nombre: "Semana 1", duracion: 7, objetivo: "Adaptación" },
        { nombre: "Semana 2", duracion: 7, objetivo: "Progresión" },
        // ... etc
      ]
    },
    // ... otros mesociclos
  ]
}

// UI Elements:
- Por cada mesociclo mostrar:
  ├─ Header: "Mesociclo: {nombre} ({duracion} semanas)"
  ├─ Input: ¿Cuántos microciclos?
  ├─ Input: Duración por defecto (días)
  └─ Para cada microciclo:
      ├─ Input: Nombre (ej: "Semana 1", "Semana 2")
      ├─ Input: Duración días [prefillado]
      └─ Input: Objetivo específico
- Botón: "Siguiente: Preview Completo"
```

### **👀 STEP 4: Preview Timeline Completo**

```javascript
// Vista previa visual:
- Timeline horizontal con todos los períodos
- Cards expandibles por mesociclo
- Cada mesociclo muestra sus microciclos
- Fechas calculadas automáticamente
- Resumen total: X meses, Y mesociclos, Z microciclos

// UI Elements:
- Timeline visual interactivo
- Botones: "Editar" para volver a pasos anteriores
- Botón principal: "Crear Rutina Completa"
- Botón secundario: "Cancelar Todo"
```

### **🚀 STEP 5: Creación y Confirmación**

```javascript
// Proceso:
1. Loading: "Creando macrociclo..."
2. Loading: "Creando mesociclos... (1/3)"
3. Loading: "Creando microciclos... (7/12)"
4. Success: "✅ Rutina creada exitosamente"
5. Redirect: Ir al detalle del macrociclo creado

// Manejo de errores:
- Si falla algo, mostrar error específico
- Opción de reintentar
- Opción de guardar como borrador
```

---

## 🎨 **Diseño UX/UI**

### **📱 Responsivo**

- Mobile-first design
- Pasos colapsables en móvil
- Timeline simplificado en pantallas pequeñas

### **🎯 Componentes Clave**

```jsx
RoutineWizard.jsx
├─ ProgressIndicator (pasos 1-5)
├─ StepMacrocycle
├─ StepMesocycles
├─ StepMicrocycles
├─ StepPreview
└─ StepCreation
```

### **🎨 Visual Elements**

- Progress bar en la parte superior
- Cards con bordes coloridos por tipo
- Timeline horizontal con puntos de tiempo
- Loading states suaves
- Animaciones de transición entre pasos

---

## 📊 **Estructura de Datos Mockeada**

```javascript
// Estado inicial del wizard
const wizardState = {
  currentStep: 1,
  studentId: 123,

  // Step 1 data
  macrocycle: {
    objetivo: '',
    fechaInicio: '',
    fechaFin: '',
    observaciones: '',
  },

  // Step 2 data
  mesocyclesConfig: {
    cantidad: 3,
    duracionDefecto: 4,
    mesociclos: [],
  },

  // Step 3 data
  microcyclesConfig: [],

  // Calculated data
  timeline: {
    totalDias: 0,
    totalSemanas: 0,
    fechas: {},
  },
};
```

---

## 🔄 **Flujo de Navegación**

### **Entre Pasos**

```javascript
// Navegación
nextStep(); // Avanza validando datos actuales
prevStep(); // Retrocede manteniendo datos
goToStep(n); // Salta a paso específico si los anteriores están completos

// Validaciones por paso
validateStep1(); // Campos requeridos del macro
validateStep2(); // Al menos 1 mesociclo configurado
validateStep3(); // Todos los mesociclos tienen microciclos
validateStep4(); // Preview confirmado
```

### **Salida del Wizard**

```javascript
// Opciones de salida
onCancel(); // Confirmar salida, perder datos
onSaveAsDraft(); // Guardar progreso (futuro)
onComplete(); // Crear rutina y salir
```

---

## 🧪 **Implementación Sugerida**

### **Fase 1: Mock Complete**

1. Crear `RoutineWizard.jsx` con datos mockeados
2. Implementar los 5 pasos con navegación
3. Preview timeline funcional
4. UX/UI completa sin backend

### **Fase 2: Backend Integration**

1. Conectar con `useRoutineStore`
2. Llamadas API secuenciales
3. Manejo de errores real
4. Persistencia de datos

### **Fase 3: Refinamiento**

1. Optimizaciones de performance
2. Animaciones avanzadas
3. Funcionalidades extra (templates, duplicar, etc.)

---

## 🎯 **Objetivos de la Mejora**

### **✅ Problemas que Resuelve**

- ❌ **Flujo fragmentado** → ✅ Wizard unificado
- ❌ **Un microciclo por vez** → ✅ Configuración masiva
- ❌ **Sin preview** → ✅ Vista previa completa
- ❌ **UX confusa** → ✅ Pasos claros y guiados
- ❌ **Sin control de cantidad** → ✅ Usuario define todo

### **🎁 Beneficios Adicionales**

- 🚀 **Más rápido:** Crear rutina completa en 5 minutos
- 🎯 **Más claro:** El coach ve todo el plan antes de crear
- 📱 **Mobile-friendly:** Funciona perfecto en móvil
- 🔄 **Reversible:** Puede volver atrás y editar
- 📊 **Visual:** Timeline muestra el plan visualmente

---

## 📁 **Archivos a Crear/Modificar**

### **Nuevos Archivos**

```
src/scene/coach/
├─ RoutineWizard.jsx (componente principal)
├─ components/
│  ├─ StepMacrocycle.jsx
│  ├─ StepMesocycles.jsx
│  ├─ StepMicrocycles.jsx
│  ├─ StepPreview.jsx
│  ├─ ProgressIndicator.jsx
│  └─ TimelinePreview.jsx
└─ hooks/
   └─ useRoutineWizard.js (lógica del wizard)
```

### **Archivos a Modificar**

```
src/scene/coach/
├─ StudentDetail.jsx (integrar nuevo wizard)
└─ hooks/useRoutineStore.js (métodos batch para crear todo)
```

---

> **Próximo Paso:** Implementar `RoutineWizard.jsx` con mock data para validar el flujo UX antes de conectar backend.
