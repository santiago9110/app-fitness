-- Migración para actualizar las entidades de rutinas
-- Ejecutar después de actualizar el código

-- 1. Agregar campo 'objetivo' a macrocycles si no existe
ALTER TABLE macrocycle 
ADD COLUMN IF NOT EXISTS objetivo VARCHAR(255);

-- 2. Agregar campo 'objetivo' a mesocycles si no existe
ALTER TABLE mesocycle 
ADD COLUMN IF NOT EXISTS objetivo VARCHAR(255);

-- 3. Actualizar tabla exercise con los nuevos campos del wizard
-- Renombrar campos existentes para mantener datos
ALTER TABLE exercise 
RENAME COLUMN name TO nombre;

ALTER TABLE exercise 
RENAME COLUMN muscle TO grupoMuscular;

-- Agregar nuevos campos
ALTER TABLE exercise 
ADD COLUMN IF NOT EXISTS series VARCHAR(50);

ALTER TABLE exercise 
ADD COLUMN IF NOT EXISTS repeticiones VARCHAR(50);

ALTER TABLE exercise 
ADD COLUMN IF NOT EXISTS descanso VARCHAR(50);

ALTER TABLE exercise 
ADD COLUMN IF NOT EXISTS rirEsperado VARCHAR(50);

-- Agregar campo de overrides para modificaciones
ALTER TABLE exercise 
ADD COLUMN IF NOT EXISTS overrides JSON;

-- Eliminar campos que ya no se usan
ALTER TABLE exercise 
DROP COLUMN IF EXISTS type;

ALTER TABLE exercise 
DROP COLUMN IF EXISTS repRange;

ALTER TABLE exercise 
DROP COLUMN IF EXISTS tempo;

ALTER TABLE exercise 
DROP COLUMN IF EXISTS expectedRir;

-- 4. Actualizar tabla day con los nuevos campos
ALTER TABLE day 
RENAME COLUMN number TO dia;

-- Agregar campos del wizard
ALTER TABLE day 
ADD COLUMN IF NOT EXISTS nombre VARCHAR(255);

ALTER TABLE day 
ADD COLUMN IF NOT EXISTS esDescanso BOOLEAN DEFAULT FALSE;

-- Renombrar campo de fecha
ALTER TABLE day 
RENAME COLUMN date TO fecha;

-- 5. Crear tabla de modificaciones
CREATE TABLE IF NOT EXISTS exercise_modifications (
  id SERIAL PRIMARY KEY,
  exerciseId INTEGER NOT NULL,
  microcycleId INTEGER NOT NULL,
  fieldName VARCHAR(50) NOT NULL,
  oldValue VARCHAR(100),
  newValue VARCHAR(100),
  scope ENUM('solo-dia', 'desde-dia') NOT NULL,
  razon TEXT,
  createdBy INTEGER NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (exerciseId) REFERENCES exercise(id) ON DELETE CASCADE,
  FOREIGN KEY (microcycleId) REFERENCES microcycle(id) ON DELETE CASCADE
);

-- 6. Actualizar formato de fechas en microcycles si es necesario
-- (Esto depende del formato actual en tu BD)

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_exercise_modifications_exercise ON exercise_modifications(exerciseId);
CREATE INDEX IF NOT EXISTS idx_exercise_modifications_microcycle ON exercise_modifications(microcycleId);

-- Comentarios
COMMENT ON TABLE exercise_modifications IS 'Tabla para tracking de modificaciones de ejercicios';
COMMENT ON COLUMN exercise_modifications.scope IS 'solo-dia: cambio puntual, desde-dia: cambio permanente';
