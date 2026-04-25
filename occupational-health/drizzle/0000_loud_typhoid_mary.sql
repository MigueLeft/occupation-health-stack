CREATE TABLE "allergies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "allergies_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "body_systems" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "body_systems_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"address" varchar(500) NOT NULL,
	"rif" varchar(50) NOT NULL,
	"contact" varchar(255) NOT NULL,
	CONSTRAINT "companies_rif_unique" UNIQUE("rif")
);
--> statement-breakpoint
CREATE TABLE "consultation_diagnostics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"category_id" uuid NOT NULL,
	"disease_id" uuid NOT NULL,
	"body_system_id" uuid
);
--> statement-breakpoint
CREATE TABLE "consultations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_id" uuid NOT NULL,
	"type" varchar(20) NOT NULL,
	"current_treatment" text,
	"interview_conducted" boolean,
	"consultation_result" varchar(30),
	"psychological_result" varchar(30),
	"diagnosis_description" text,
	"recommendations" jsonb,
	CONSTRAINT "uq_consultation_request" UNIQUE("request_id")
);
--> statement-breakpoint
CREATE TABLE "disease_categories" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "disease_categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "diseases" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"is_chronic" boolean DEFAULT false NOT NULL,
	CONSTRAINT "diseases_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "exam_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"exam_id" uuid NOT NULL,
	"result_value" jsonb,
	"observation" text,
	"url" text,
	"result" varchar(20)
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"category" varchar(50) NOT NULL,
	CONSTRAINT "exams_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "patient_allergies" (
	"patient_id" varchar(20) NOT NULL,
	"allergy_id" uuid NOT NULL,
	CONSTRAINT "patient_allergies_patient_id_allergy_id_pk" PRIMARY KEY("patient_id","allergy_id")
);
--> statement-breakpoint
CREATE TABLE "patient_diseases" (
	"patient_id" varchar(20) NOT NULL,
	"disease_id" uuid NOT NULL,
	CONSTRAINT "patient_diseases_patient_id_disease_id_pk" PRIMARY KEY("patient_id","disease_id")
);
--> statement-breakpoint
CREATE TABLE "patients" (
	"cedula" varchar(20) PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"birth_date" date NOT NULL,
	"emergency_contact" jsonb NOT NULL,
	"email" varchar(255) NOT NULL,
	"blood_type" varchar(10) NOT NULL,
	"dominant_hand" varchar(20) NOT NULL,
	"uses_glasses" boolean DEFAULT false NOT NULL,
	"company_id" uuid NOT NULL,
	"position_id" uuid NOT NULL,
	CONSTRAINT "patients_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "physical_exams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"systolic_pressure" integer,
	"diastolic_pressure" integer,
	"heart_rate" integer,
	"weight" real,
	"height" real,
	"respiratory_rate" integer,
	"oxygen_saturation" real,
	"notes" text,
	CONSTRAINT "uq_physical_exam_consultation" UNIQUE("consultation_id")
);
--> statement-breakpoint
CREATE TABLE "positions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"company_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "psychometric_test_catalog" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"interpretations" jsonb NOT NULL,
	CONSTRAINT "psychometric_test_catalog_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "psychometric_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"catalog_test_id" uuid NOT NULL,
	"selected_interpretation" varchar(255) NOT NULL,
	"observations" text
);
--> statement-breakpoint
CREATE TABLE "requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"request_date" date DEFAULT CURRENT_DATE NOT NULL,
	"evaluation_reason" varchar(50) NOT NULL,
	"status" varchar(30) DEFAULT 'Pendiente' NOT NULL,
	"patient_id" varchar(20) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rest_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"requires_rest" boolean DEFAULT false NOT NULL,
	"days" integer,
	"start_date" date,
	"end_date" date,
	CONSTRAINT "uq_rest_period_consultation" UNIQUE("consultation_id")
);
--> statement-breakpoint
CREATE TABLE "risks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	CONSTRAINT "risks_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "consultation_diagnostics" ADD CONSTRAINT "consultation_diagnostics_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_diagnostics" ADD CONSTRAINT "consultation_diagnostics_category_id_disease_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."disease_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_diagnostics" ADD CONSTRAINT "consultation_diagnostics_disease_id_diseases_id_fk" FOREIGN KEY ("disease_id") REFERENCES "public"."diseases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_diagnostics" ADD CONSTRAINT "consultation_diagnostics_body_system_id_body_systems_id_fk" FOREIGN KEY ("body_system_id") REFERENCES "public"."body_systems"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_request_id_requests_id_fk" FOREIGN KEY ("request_id") REFERENCES "public"."requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "exam_results" ADD CONSTRAINT "exam_results_exam_id_exams_id_fk" FOREIGN KEY ("exam_id") REFERENCES "public"."exams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_patient_id_patients_cedula_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("cedula") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_allergy_id_allergies_id_fk" FOREIGN KEY ("allergy_id") REFERENCES "public"."allergies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_diseases" ADD CONSTRAINT "patient_diseases_patient_id_patients_cedula_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("cedula") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patient_diseases" ADD CONSTRAINT "patient_diseases_disease_id_diseases_id_fk" FOREIGN KEY ("disease_id") REFERENCES "public"."diseases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" ADD CONSTRAINT "patients_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "physical_exams" ADD CONSTRAINT "physical_exams_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "positions" ADD CONSTRAINT "positions_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychometric_tests" ADD CONSTRAINT "psychometric_tests_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychometric_tests" ADD CONSTRAINT "psychometric_tests_catalog_test_id_psychometric_test_catalog_id_fk" FOREIGN KEY ("catalog_test_id") REFERENCES "public"."psychometric_test_catalog"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_patient_id_patients_cedula_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("cedula") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rest_periods" ADD CONSTRAINT "rest_periods_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;