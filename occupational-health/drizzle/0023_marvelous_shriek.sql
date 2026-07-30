ALTER TABLE "consultations" ADD COLUMN "created_at" timestamp with time zone DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "patients" ADD COLUMN "terminated_at" date;