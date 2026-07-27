-- Repara 0011 y 0018, rotas desde que se generaron:
-- 0011 agregaba la PK nueva de position_risks (sobre assigned_at) ANTES de
-- crear la columna assigned_at, así que fallaba en su segunda sentencia.
-- 0018 volvía a hacer CREATE TABLE de "disabilities"/"consultation_disabilities",
-- ya creadas por 0014, así que fallaba en su primera sentencia.
-- sync-journal.mjs interpretaba ambos fallos como "ya aplicada" y las marcaba
-- como completas sin ejecutar el resto de las sentencias (requires_rest,
-- rest_days, removed_at, report_config nunca se crearon en ningún entorno).
ALTER TABLE "position_risks" ADD COLUMN IF NOT EXISTS "assigned_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "position_risks" ADD COLUMN IF NOT EXISTS "removed_at" timestamp;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "position_risks" DROP CONSTRAINT "position_risks_position_id_risk_id_pk";
EXCEPTION
 WHEN undefined_object THEN null;
END $$;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "position_risks" ADD CONSTRAINT "position_risks_position_id_risk_id_assigned_at_pk" PRIMARY KEY("position_id","risk_id","assigned_at");
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;--> statement-breakpoint
ALTER TABLE "consultation_diagnostics" ADD COLUMN IF NOT EXISTS "requires_rest" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "consultation_diagnostics" ADD COLUMN IF NOT EXISTS "rest_days" integer;--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "report_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sello_medico" text
);
