ALTER TABLE "patient_allergies" DROP CONSTRAINT "patient_allergies_patient_id_patients_cedula_fk";
--> statement-breakpoint
ALTER TABLE "patient_diseases" DROP CONSTRAINT "patient_diseases_patient_id_patients_cedula_fk";
--> statement-breakpoint
ALTER TABLE "requests" DROP CONSTRAINT "requests_patient_id_patients_cedula_fk";
--> statement-breakpoint
ALTER TABLE "patient_allergies" ADD CONSTRAINT "patient_allergies_patient_id_patients_cedula_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("cedula") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "patient_diseases" ADD CONSTRAINT "patient_diseases_patient_id_patients_cedula_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("cedula") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "requests" ADD CONSTRAINT "requests_patient_id_patients_cedula_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("cedula") ON DELETE cascade ON UPDATE cascade;