-- Tablas que pueden ya existir (creadas por migraciones manuales previas)
CREATE TABLE IF NOT EXISTS "medical_specialties" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "medical_specialties_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "risk_exposure_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"risk_type" varchar(50) NOT NULL,
	"name" varchar(255) NOT NULL,
	"conditions" text,
	"health_effects" text,
	CONSTRAINT "risk_exposure_categories_risk_type_unique" UNIQUE("risk_type")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "consultation_referrals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"requires_referral" boolean DEFAULT false NOT NULL,
	"specialty_id" uuid,
	CONSTRAINT "uq_referral_consultation" UNIQUE("consultation_id")
);
--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN IF NOT EXISTS "sex" varchar(20);
--> statement-breakpoint
ALTER TABLE "rest_periods" ADD COLUMN IF NOT EXISTS "reason" varchar(50);
--> statement-breakpoint
ALTER TABLE "rest_periods" ADD COLUMN IF NOT EXISTS "disease_id" uuid;
--> statement-breakpoint
ALTER TABLE "rest_periods" ADD COLUMN IF NOT EXISTS "category_id" uuid;
--> statement-breakpoint
ALTER TABLE "rest_periods" ADD COLUMN IF NOT EXISTS "body_system_id" uuid;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consultation_referrals" ADD CONSTRAINT "consultation_referrals_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "consultation_referrals" ADD CONSTRAINT "consultation_referrals_specialty_id_medical_specialties_id_fk" FOREIGN KEY ("specialty_id") REFERENCES "public"."medical_specialties"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rest_periods" ADD CONSTRAINT "rest_periods_disease_id_diseases_id_fk" FOREIGN KEY ("disease_id") REFERENCES "public"."diseases"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rest_periods" ADD CONSTRAINT "rest_periods_category_id_disease_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."disease_categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rest_periods" ADD CONSTRAINT "rest_periods_body_system_id_body_systems_id_fk" FOREIGN KEY ("body_system_id") REFERENCES "public"."body_systems"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
