ALTER TABLE "consultations" ADD COLUMN "system_attended_by_id" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "medical_attended_by_id" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "psychological_attended_by_id" text;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_system_attended_by_id_user_id_fk" FOREIGN KEY ("system_attended_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_medical_attended_by_id_user_id_fk" FOREIGN KEY ("medical_attended_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultations" ADD CONSTRAINT "consultations_psychological_attended_by_id_user_id_fk" FOREIGN KEY ("psychological_attended_by_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;