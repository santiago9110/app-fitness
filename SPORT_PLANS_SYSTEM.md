# Sistema de Planes Deportivos (SportPlan)

## Descripción

El nuevo sistema permite que un mismo deporte tenga múltiples modalidades con diferentes frecuencias semanales y precios.

## Estructura

### Sport (Deporte)

- **id**: Identificador único
- **name**: Nombre del deporte (ej: "Boxeo", "Gym", "Fútbol")
- **description**: Descripción del deporte
- **sportPlans**: Lista de planes disponibles para este deporte

### SportPlan (Plan Deportivo)

- **id**: Identificador único
- **name**: Nombre del plan (ej: "2 veces por semana", "Plan básico")
- **weeklyFrequency**: Días por semana (2, 3, 7, etc.)
- **monthlyFee**: Precio mensual específico para este plan
- **description**: Descripción del plan
- **isActive**: Si el plan está activo o no
- **sportId**: Referencia al deporte
- **sport**: Relación con el deporte

## Ejemplos de Uso

### 1. Crear un deporte

```json
POST /sports
{
  "name": "Boxeo",
  "description": "Entrenamiento de boxeo profesional"
}
```

### 2. Crear planes para el deporte

```json
POST /sports/plans
{
  "name": "2 veces por semana",
  "weeklyFrequency": 2,
  "monthlyFee": 4000.00,
  "description": "Entrenamiento básico de boxeo",
  "sportId": 1
}

POST /sports/plans
{
  "name": "3 veces por semana",
  "weeklyFrequency": 3,
  "monthlyFee": 5500.00,
  "description": "Entrenamiento intermedio de boxeo",
  "sportId": 1
}

POST /sports/plans
{
  "name": "Todos los días",
  "weeklyFrequency": 7,
  "monthlyFee": 8000.00,
  "description": "Entrenamiento intensivo de boxeo",
  "sportId": 1
}
```

### 3. Asignar un plan a un estudiante

Al crear o actualizar un estudiante, ahora puedes especificar tanto el deporte como el plan específico:

```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "document": "12345678",
  "sportId": 1, // Boxeo
  "sportPlanId": 2 // Plan de 3 veces por semana
}
```

### 4. Crear cuotas basadas en el plan

Al generar las cuotas, el sistema puede usar el precio del `SportPlan` en lugar del precio base del `Sport`:

```json
{
  "studentId": 1,
  "sportPlanId": 2, // Tomará el precio de $5500 del plan
  "month": 1,
  "year": 2025
}
```

## Endpoints Disponibles

### Deportes

- `GET /sports` - Listar deportes (incluye planes)
- `GET /sports/:id` - Obtener deporte con sus planes
- `POST /sports` - Crear deporte
- `PATCH /sports/:id` - Actualizar deporte
- `DELETE /sports/:id` - Eliminar deporte

### Planes Deportivos

- `GET /sports/plans` - Listar todos los planes
- `GET /sports/plans?sportId=1` - Listar planes de un deporte específico
- `GET /sports/plans/:id` - Obtener plan específico
- `POST /sports/plans` - Crear plan
- `PATCH /sports/plans/:id` - Actualizar plan
- `DELETE /sports/plans/:id` - Eliminar plan

## Migración de Datos Existentes

1. **Ejecutar la migración SQL** (`migration-sport-plans.sql`)
2. **Crear planes para deportes existentes**:

   ```sql
   -- Ejemplo para migrar datos existentes
   INSERT INTO sport_plans (name, weeklyFrequency, monthlyFee, sportId, description)
   SELECT
     CONCAT(name, ' - Plan estándar') as name,
     3 as weeklyFrequency,
     monthlyFee,
     id as sportId,
     'Plan migrado automáticamente' as description
   FROM sports;
   ```

3. **Actualizar estudiantes existentes** (opcional):
   ```sql
   -- Asignar el primer plan disponible a estudiantes existentes
   UPDATE students
   SET sportPlanId = (
     SELECT sp.id
     FROM sport_plans sp
     WHERE sp.sportId = students.sportId
     LIMIT 1
   );
   ```

## Ventajas del Nuevo Sistema

1. **Flexibilidad**: Un deporte puede tener múltiples opciones de precios
2. **Escalabilidad**: Fácil agregar nuevos planes sin duplicar deportes
3. **Compatibilidad**: Mantiene las relaciones existentes para no romper el sistema actual
4. **Granularidad**: Precios específicos por frecuencia de entrenamiento
5. **Gestión**: Activar/desactivar planes individualmente

## Consideraciones

- Las relaciones antiguas con `Sport` se mantienen por compatibilidad
- Los nuevos estudiantes deberían usar `sportPlanId` en lugar de solo `sportId`
- Las cuotas pueden generarse usando `sportPlanId` para obtener el precio correcto
- El campo `monthlyFee` en `Sport` puede mantenerse como precio base o de referencia

## ✅ Compatibilidad y Migración Implementada

### Cambios Realizados para Mantener Compatibilidad

1. **Sport.monthlyFee restaurado**: Se mantuvo la propiedad `monthlyFee` en la entidad `Sport` como nullable para compatibilidad hacia atrás.

2. **Lógica de precios inteligente**: Implementada en todos los servicios:

   ```typescript
   const monthlyFee =
     student.sportPlan?.monthlyFee || student.sport?.monthlyFee;
   ```

3. **Servicios actualizados**:
   - ✅ `auth.service.ts` - Respuestas de usuario con precio correcto
   - ✅ `cron.service.ts` - Generación automática de cuotas
   - ✅ `fee.service.ts` - Generación manual de cuotas
   - ✅ `student.service.ts` - Cuotas para nuevos estudiantes

4. **Consultas mejoradas**: Todas incluyen relación `sportPlan` cuando es necesario.

5. **Creación de cuotas mejorada**: Las nuevas cuotas incluyen referencias tanto a `sport` como a `sportPlan`.

### Flujo de Precios

1. **Con SportPlan**: Si el estudiante tiene `sportPlanId`, se usa `sportPlan.monthlyFee`
2. **Sin SportPlan**: Se usa `sport.monthlyFee` como fallback
3. **Sin precio**: Se muestra advertencia/error para configurar precios

### Estado Actual

- ✅ **Compilación exitosa** - No hay errores de TypeScript
- ✅ **Compatibilidad total** - El código existente sigue funcionando
- ✅ **Nueva funcionalidad** - SportPlans totalmente implementados
- ✅ **Migración segura** - Los datos existentes no se pierden

### Próximos Pasos Recomendados

1. Ejecutar la migración SQL en la base de datos
2. Crear planes para deportes existentes
3. Actualizar frontend para mostrar planes disponibles
4. Migrar estudiantes existentes a usar SportPlans (opcional)
