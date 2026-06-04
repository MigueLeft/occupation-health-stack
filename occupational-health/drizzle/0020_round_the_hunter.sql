CREATE TABLE "accident_types" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	CONSTRAINT "accident_types_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "consultation_diagnostics" ALTER COLUMN "disease_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "consultation_diagnostics" ADD COLUMN "accident_type_id" uuid;--> statement-breakpoint
ALTER TABLE "consultation_diagnostics" ADD CONSTRAINT "consultation_diagnostics_accident_type_id_accident_types_id_fk" FOREIGN KEY ("accident_type_id") REFERENCES "public"."accident_types"("id") ON DELETE no action ON UPDATE no action;