CREATE TABLE "disabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "disabilities_name_unique" UNIQUE("name")
);

CREATE TABLE "consultation_disabilities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"has_disability" boolean DEFAULT false NOT NULL,
	"disability_id" uuid,
	CONSTRAINT "uq_disability_consultation" UNIQUE("consultation_id")
);

ALTER TABLE "consultation_disabilities" ADD CONSTRAINT "consultation_disabilities_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "consultation_disabilities" ADD CONSTRAINT "consultation_disabilities_disability_id_disabilities_id_fk" FOREIGN KEY ("disability_id") REFERENCES "public"."disabilities"("id") ON DELETE set null ON UPDATE no action;
