# 🗺️ Roadmap Completo - Sistema de Rutinas

## 🎯 **Objetivo Final**

Sistema completo de creación y gestión de rutinas con:

- ✅ Wizard de creación masiva (COMPLETADO)
- ⏳ Backend integration (PENDIENTE)
- ⏳ Sistema de modificaciones dinámicas (PENDIENTE)

---

## 📊 **Estado Actual**

### ✅ **COMPLETADO - Frontend Wizard**

- **RoutineWizard.jsx**: Wizard completo de 5 pasos
- **Estructura de datos**: Plantilla de microciclos con ejercicios
- **Campo RIR**: Agregado al formulario de ejercicios
- **Preview**: Vista previa de toda la rutina
- **UX/UI**: Navegación fluida y validaciones
- **Mock data**: Simulación completa del flujo

### 🔴 **PENDIENTE - Backend Integration**

- Conexión con APIs reales
- Creación masiva de entidades
- Manejo de errores del servidor
- Persistencia en base de datos

### 🔴 **PENDIENTE - Sistema de Modificaciones**

- Modal "Solo hoy" vs "Desde hoy"
- Overrides puntuales vs cambios permanentes
- Historial de modificaciones
- Visual feedback de campos modificados

---

## 🏗️ **FASE 1: Backend Integration**

_Prioridad: ALTA - Debe hacerse primero_

### **1.1 Actualizar Entidades de Base de Datos**

#### **Backend (NestJS + TypeORM)**

```typescript
// src/routine/entities/microcycle-day-exercise.entity.ts
@Entity('microcycle_day_exercises')
export class MicrocycleDayExercise {
  @PrimaryGeneratedColumn()
  id: number;

  // Campos base (plantilla)
  @Column()
  nombre: string;

  @Column()
  grupoMuscular: string;

  @Column()
  series: string;

  @Column()
  repeticiones: string;

  @Column()
  descanso: string;

  @Column()
  rirEsperado: string; // ✅ NUEVO CAMPO

  // Campos de override (modificaciones puntuales)
  @Column('json', { nullable: true })
  overrides: {
    [microcicloId: string]: {
      series?: string;
      repeticiones?: string;
      peso?: string;
      rirEsperado?: string;
      fechaModificacion: Date;
      razon?: string;
    };
  };

  @ManyToOne(() => MicrocycleDay)
  microcycleDay: MicrocycleDay;
}
```

#### **Nuevas tablas necesarias:**

```sql
-- Tabla para tracking de modificaciones
CREATE TABLE exercise_modifications (
  id SERIAL PRIMARY KEY,
  exercise_id INTEGER REFERENCES microcycle_day_exercises(id),
  microcycle_id INTEGER REFERENCES microcycles(id),
  field_name VARCHAR(50), -- 'series', 'repeticiones', etc
  old_value VARCHAR(100),
  new_value VARCHAR(100),
  scope ENUM('solo-dia', 'desde-dia'), -- Alcance del cambio
  created_at TIMESTAMP DEFAULT NOW(),
  created_by INTEGER REFERENCES users(id)
);
```

### **1.2 Crear APIs de Creación Masiva**

#### **Endpoint principal:**

```typescript
// src/routine/routine.controller.ts
@Post('/create-complete')
async createCompleteRoutine(@Body() wizardData: CreateCompleteRoutineDto) {
  return await this.routineService.createCompleteRoutine(wizardData);
}
```

#### **DTO para el wizard:**

```typescript
// src/routine/dto/create-complete-routine.dto.ts
export class CreateCompleteRoutineDto {
  studentId: number;

  macrocycle: {
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    objetivo: string;
  };

  mesociclos: Array<{
    nombre: string;
    fechaInicio: string;
    fechaFin: string;
    objetivo: string;
  }>;

  microciclos: Array<{
    mesocicloIndex: number;
    cantidadMicrociclos: number;
    plantillaDias: Array<{
      dia: number;
      nombre: string;
      esDescanso: boolean;
      ejercicios: Array<{
        nombre: string;
        grupoMuscular: string;
        series: string;
        repeticiones: string;
        descanso: string;
        rirEsperado: string; // ✅ NUEVO
      }>;
    }>;
  }>;
}
```

#### **Servicio de creación masiva:**

```typescript
// src/routine/routine.service.ts
async createCompleteRoutine(data: CreateCompleteRoutineDto) {
  const queryRunner = this.dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Crear Macrociclo
    const macrocycle = await this.createMacrocycle(data.macrocycle, data.studentId);

    // 2. Crear Mesociclos
    const mesocycles = await this.createMesocycles(data.mesociclos, macrocycle.id);

    // 3. Crear Microciclos (replicando plantillas)
    for (const microConfig of data.microciclos) {
      const mesocycle = mesocycles[microConfig.mesocicloIndex];
      await this.createMicrocyclesFromTemplate(microConfig, mesocycle.id);
    }

    await queryRunner.commitTransaction();
    return { success: true, macrocycleId: macrocycle.id };

  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw new BadRequestException(`Error creating routine: ${error.message}`);
  } finally {
    await queryRunner.release();
  }
}

private async createMicrocyclesFromTemplate(config, mesocycleId) {
  // Crear N microciclos idénticos basados en la plantilla
  for (let i = 0; i < config.cantidadMicrociclos; i++) {
    const microcycle = await this.microcycleRepo.save({
      name: `Microciclo ${i + 1}`,
      mesocycleId,
      // ... otros campos
    });

    // Para cada día de la plantilla
    for (const diaTemplate of config.plantillaDias) {
      const day = await this.microcycleDayRepo.save({
        microcycleId: microcycle.id,
        dayNumber: diaTemplate.dia,
        name: diaTemplate.nombre,
        isRest: diaTemplate.esDescanso
      });

      // Para cada ejercicio de la plantilla
      for (const ejercicioTemplate of diaTemplate.ejercicios) {
        await this.exerciseRepo.save({
          microcycleDayId: day.id,
          nombre: ejercicioTemplate.nombre,
          grupoMuscular: ejercicioTemplate.grupoMuscular,
          series: ejercicioTemplate.series,
          repeticiones: ejercicioTemplate.repeticiones,
          descanso: ejercicioTemplate.descanso,
          rirEsperado: ejercicioTemplate.rirEsperado // ✅ NUEVO
        });
      }
    }
  }
}
```

### **1.3 Conectar Frontend con Backend**

#### **Actualizar RoutineWizard.jsx:**

```javascript
// Reemplazar la función createCompleteRoutine MOCK
const createCompleteRoutine = async () => {
  setLoading(true);
  setError(null);

  try {
    const response = await fetch('/api/routine/create-complete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        studentId,
        macrocycle: wizardData.macrocycle,
        mesociclos: wizardData.mesociclos,
        microciclos: wizardData.microciclos,
      }),
    });

    if (!response.ok) throw new Error('Error del servidor');

    const result = await response.json();

    setLoading(false);
    setTimeout(() => {
      onComplete && onComplete();
      navigate(`/coach/routine/${result.macrocycleId}`);
    }, 1000);
  } catch (err) {
    setLoading(false);
    setError('Error al crear la rutina: ' + err.message);
  }
};
```

---

## 🏗️ **FASE 2: Sistema de Modificaciones Dinámicas**

_Prioridad: MEDIA - Después de FASE 1_

### **2.1 Modal de Alcance de Cambio**

#### **Componente ChangeScopeModal.jsx:**

```jsx
const ChangeScopeModal = ({
  isOpen,
  onClose,
  exerciseName,
  fieldName,
  oldValue,
  newValue,
  currentMicrocycle,
  totalMicrocycles,
  onSoloDia,
  onDesdeDia,
}) => {
  const affectedCount = totalMicrocycles - currentMicrocycle + 1;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="change-scope-modal">
        <h3>💭 ¿Cómo aplicar este cambio?</h3>

        <div className="change-summary">
          <p>
            <strong>Ejercicio:</strong> {exerciseName}
          </p>
          <p>
            <strong>Campo:</strong> {fieldName}
          </p>
          <p>
            <strong>Cambio:</strong> {oldValue} →{' '}
            <span className="new-value">{newValue}</span>
          </p>
        </div>

        <div className="options">
          <button className="option-button solo-dia" onClick={onSoloDia}>
            <div className="option-icon">📅</div>
            <div className="option-content">
              <h4>Solo para este entrenamiento</h4>
              <p>Microciclo {currentMicrocycle} únicamente</p>
            </div>
          </button>

          <button className="option-button desde-dia" onClick={onDesdeDia}>
            <div className="option-icon">🚀</div>
            <div className="option-content">
              <h4>Actualizar hacia adelante</h4>
              <p>Aplicar a {affectedCount} microciclos restantes</p>
            </div>
          </button>
        </div>
      </div>
    </Modal>
  );
};
```

### **2.2 Hook para Gestión de Cambios**

#### **useExerciseModifications.js:**

```javascript
export const useExerciseModifications = () => {
  const [showModal, setShowModal] = useState(false);
  const [changeContext, setChangeContext] = useState(null);

  const handleExerciseChange = (exerciseId, field, newValue, context) => {
    const oldValue = context.currentValue;

    // Detectar si es un cambio significativo
    if (isSignificantChange(oldValue, newValue)) {
      setChangeContext({
        exerciseId,
        field,
        oldValue,
        newValue,
        ...context,
      });
      setShowModal(true);
    } else {
      // Cambios menores van directo como override puntual
      applyPunctualChange(exerciseId, field, newValue);
    }
  };

  const applyPunctualChange = async (exerciseId, field, value) => {
    await fetch(`/api/exercises/${exerciseId}/override`, {
      method: 'POST',
      body: JSON.stringify({
        field,
        value,
        scope: 'solo-dia',
        microcycleId: changeContext.microcycleId,
      }),
    });
  };

  const applyPermanentChange = async (exerciseId, field, value) => {
    await fetch(`/api/exercises/${exerciseId}/update-template`, {
      method: 'PUT',
      body: JSON.stringify({
        field,
        value,
        fromMicrocycle: changeContext.microcycleId,
      }),
    });
  };

  return {
    showModal,
    changeContext,
    handleExerciseChange,
    applyPunctualChange,
    applyPermanentChange,
    closeModal: () => setShowModal(false),
  };
};
```

### **2.3 Backend para Modificaciones**

#### **APIs de modificación:**

```typescript
// src/exercise/exercise.controller.ts

@Post(':id/override')
async createOverride(
  @Param('id') exerciseId: number,
  @Body() overrideData: CreateOverrideDto
) {
  return await this.exerciseService.createOverride(exerciseId, overrideData);
}

@Put(':id/update-template')
async updateTemplate(
  @Param('id') exerciseId: number,
  @Body() updateData: UpdateTemplateDto
) {
  return await this.exerciseService.updateTemplate(exerciseId, updateData);
}
```

---

## 🏗️ **FASE 3: Mejoras y Optimizaciones**

_Prioridad: BAJA - Funcionalidades extra_

### **3.1 Templates de Rutinas**

- Guardar configuraciones de wizard como templates
- Aplicar templates a nuevos alumnos
- Biblioteca de rutinas predefinidas

### **3.2 Análisis y Reportes**

- Dashboard de progreso por alumno
- Estadísticas de modificaciones más comunes
- Reportes de adherencia al plan

### **3.3 Funcionalidades Avanzadas**

- Duplicar rutinas entre alumnos
- Exportar a Excel/PDF
- Notificaciones automáticas
- Integración con apps de fitness

---

## 📅 **Cronograma Estimado**

### **FASE 1: Backend Integration** (2-3 semanas)

- **Semana 1**: Entidades y migraciones de BD
- **Semana 2**: APIs de creación masiva
- **Semana 3**: Conexión frontend + testing

### **FASE 2: Sistema de Modificaciones** (2 semanas)

- **Semana 1**: Modal y hooks de frontend
- **Semana 2**: APIs de override + testing

### **FASE 3: Mejoras** (1-2 semanas)

- **Según prioridades del negocio**

---

## 🎯 **Próximos Pasos Inmediatos**

1. **✅ AHORA**: Finalizar cualquier ajuste al wizard frontend
2. **🔥 SIGUIENTE**: Empezar FASE 1 - Backend Integration
   - Actualizar entidades con campo `rirEsperado`
   - Crear tabla de `exercise_modifications`
   - Implementar endpoint `/create-complete`
3. **📋 DESPUÉS**: FASE 2 - Sistema de modificaciones

---

## 📝 **Notas de Implementación**

### **Consideraciones Técnicas:**

- Usar transacciones para creación masiva
- Implementar soft deletes para histórico
- Cachear templates frecuentemente usados
- Validar datos del wizard en backend

### **Consideraciones UX:**

- Loading states durante creación masiva
- Mensajes de error específicos
- Confirmaciones antes de cambios masivos
- Breadcrumbs para navegación en rutinas

---

> **🚀 Estado**: Wizard frontend completado. Listo para iniciar FASE 1: Backend Integration.
