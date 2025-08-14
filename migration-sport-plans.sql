-- Migración para implementar SportPlan
-- Ejecutar en el siguiente orden para evitar errores de dependencias

-- 1. Crear la tabla sport_plans
CREATE TABLE sport_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR NOT NULL,
    weeklyFrequency INTEGER NOT NULL,
    monthlyFee DECIMAL(10,2) NOT NULL,
    description VARCHAR,
    isActive BOOLEAN DEFAULT true,
    sportId INTEGER NOT NULL,
    FOREIGN KEY (sportId) REFERENCES sports(id) ON DELETE CASCADE
);

-- 2. Crear índices para mejorar performance
CREATE INDEX idx_sport_plans_sport_id ON sport_plans(sportId);
CREATE INDEX idx_sport_plans_active ON sport_plans(isActive);

-- 3. Agregar columna sportPlanId a la tabla students (opcional, para la nueva modalidad)
ALTER TABLE students ADD COLUMN sportPlanId INTEGER;
ALTER TABLE students ADD CONSTRAINT fk_students_sport_plan 
    FOREIGN KEY (sportPlanId) REFERENCES sport_plans(id) ON DELETE SET NULL;

-- 4. Agregar columna sportPlanId a la tabla fees (opcional, para la nueva modalidad)
ALTER TABLE fees ADD COLUMN sportPlanId INTEGER;
ALTER TABLE fees ADD CONSTRAINT fk_fees_sport_plan 
    FOREIGN KEY (sportPlanId) REFERENCES sport_plans(id) ON DELETE SET NULL;

-- 5. Crear índices para las nuevas relaciones
CREATE INDEX idx_students_sport_plan_id ON students(sportPlanId);
CREATE INDEX idx_fees_sport_plan_id ON fees(sportPlanId);

-- 6. Insertar datos de ejemplo para migrar datos existentes
-- Ejemplo: Si tienes un deporte "Boxeo" con id=1 y fee=5000
-- INSERT INTO sport_plans (name, weeklyFrequency, monthlyFee, sportId, description) VALUES
-- ('2 veces por semana', 2, 4000.00, 1, 'Entrenamiento de boxeo 2 días a la semana'),
-- ('3 veces por semana', 3, 5000.00, 1, 'Entrenamiento de boxeo 3 días a la semana'),
-- ('Todos los días', 7, 8000.00, 1, 'Entrenamiento de boxeo todos los días');

-- 7. Comentar la columna monthlyFee de sports (mantenerla por compatibilidad pero no usarla)
-- ALTER TABLE sports ADD COLUMN monthlyFee_deprecated DECIMAL(10,2);
-- UPDATE sports SET monthlyFee_deprecated = monthlyFee;
-- Nota: No eliminar monthlyFee aún para mantener compatibilidad hacia atrás
