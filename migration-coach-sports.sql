-- Migración para agregar campos al coach y crear relación Many-to-Many con Sports
-- Ejecutar después de la migración básica

-- Agregar nuevos campos a la tabla coaches si no existen
ALTER TABLE coaches 
ADD COLUMN IF NOT EXISTS specialization VARCHAR,
ADD COLUMN IF NOT EXISTS experience VARCHAR,
ADD COLUMN IF NOT EXISTS certification VARCHAR,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS "userId" INTEGER;

-- Crear tabla de relación Many-to-Many entre coaches y sports
CREATE TABLE IF NOT EXISTS coach_sports (
    "coachId" INTEGER NOT NULL,
    "sportId" INTEGER NOT NULL,
    CONSTRAINT "PK_coach_sports" PRIMARY KEY ("coachId", "sportId"),
    CONSTRAINT "FK_coach_sports_coach" FOREIGN KEY ("coachId") REFERENCES coaches(id) ON DELETE CASCADE,
    CONSTRAINT "FK_coach_sports_sport" FOREIGN KEY ("sportId") REFERENCES sports(id) ON DELETE CASCADE
);

-- Crear índices para mejorar performance
CREATE INDEX IF NOT EXISTS "IDX_coach_sports_coachId" ON coach_sports ("coachId");
CREATE INDEX IF NOT EXISTS "IDX_coach_sports_sportId" ON coach_sports ("sportId");

-- Crear índice para userId en coaches
CREATE INDEX IF NOT EXISTS "IDX_coaches_userId" ON coaches ("userId");

-- Agregar constraint de foreign key para userId si no existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'FK_coaches_user'
    ) THEN
        ALTER TABLE coaches 
        ADD CONSTRAINT "FK_coaches_user" 
        FOREIGN KEY ("userId") REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;
