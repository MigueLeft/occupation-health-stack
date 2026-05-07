-- Agregar sexo al paciente
ALTER TABLE "patients" ADD COLUMN "sex" varchar(20);

-- Migrar datos de Pre/Post-vacacional
UPDATE "requests" SET "evaluation_reason" = 'Pre-vacacional' WHERE "evaluation_reason" = 'Pre/Post-vacacional';

-- Agregar motivo a los períodos de reposo
ALTER TABLE "rest_periods" ADD COLUMN "reason" varchar(50);

-- Catálogo de especialidades médicas
CREATE TABLE "medical_specialties" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "name" varchar(255) NOT NULL UNIQUE
);

-- Categorías de exposición a riesgos (catálogo padre para riesgos con efectos en la salud)
CREATE TABLE "risk_exposure_categories" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "risk_type" varchar(50) NOT NULL UNIQUE,
  "name" varchar(255) NOT NULL,
  "conditions" text,
  "health_effects" text
);

-- Referencias de consultas
CREATE TABLE "consultation_referrals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "consultation_id" uuid NOT NULL UNIQUE REFERENCES "consultations"("id") ON DELETE CASCADE,
  "requires_referral" boolean NOT NULL DEFAULT false,
  "specialty_id" uuid REFERENCES "medical_specialties"("id") ON DELETE SET NULL
);
