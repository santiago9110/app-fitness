-- Migración para cambiar tipos de datos a DECIMAL
-- Ejecutar DESPUÉS de migration-sport-plans.sql

-- 1. Modificar la tabla fees para usar DECIMAL
ALTER TABLE fees 
  ALTER COLUMN value TYPE DECIMAL(10,2),
  ALTER COLUMN "amountPaid" TYPE DECIMAL(10,2);

-- 2. Modificar la tabla sports para usar DECIMAL (si la columna existe)
-- Solo ejecutar si la columna monthlyFee ya existe en sports
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'sports' AND column_name = 'monthlyFee') THEN
        ALTER TABLE sports ALTER COLUMN "monthlyFee" TYPE DECIMAL(10,2);
    ELSE
        -- Si no existe, agregarla
        ALTER TABLE sports ADD COLUMN "monthlyFee" DECIMAL(10,2);
    END IF;
END $$;

-- 3. Modificar la tabla payments para usar DECIMAL
ALTER TABLE payments 
  ALTER COLUMN "amountPaid" TYPE DECIMAL(10,2);

-- 4. Verificar que las constraint están bien
-- Los valores por defecto deberían funcionar correctamente con DECIMAL
