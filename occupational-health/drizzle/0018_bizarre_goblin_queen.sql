CREATE TABLE "consultation_disabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"disability_id" uuid NOT NULL,
	CONSTRAINT "uq_cd_consultation_disability" UNIQUE("consultation_id","disability_id")
);
--> statement-breakpoint
CREATE TABLE "disabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "disabilities_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "report_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sello_medico" text
);
--> statement-breakpoint
ALTER TABLE "consultation_diagnostics" ADD COLUMN "requires_rest" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "consultation_diagnostics" ADD COLUMN "rest_days" integer;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "medical_attended_by_free_text" varchar(255);--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "psychological_attended_by_free_text" varchar(255);--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "chronic_diseases_snapshot" jsonb;--> statement-breakpoint
ALTER TABLE "consultation_disabilities" ADD CONSTRAINT "consultation_disabilities_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_disabilities" ADD CONSTRAINT "consultation_disabilities_disability_id_disabilities_id_fk" FOREIGN KEY ("disability_id") REFERENCES "public"."disabilities"("id") ON DELETE cascade ON UPDATE no action;