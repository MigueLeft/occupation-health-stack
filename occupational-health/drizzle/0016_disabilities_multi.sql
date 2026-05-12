ALTER TABLE "consultation_disabilities" DROP CONSTRAINT "uq_disability_consultation";
--> statement-breakpoint
DELETE FROM "consultation_disabilities" WHERE "disability_id" IS NULL;
--> statement-breakpoint
ALTER TABLE "consultation_disabilities" DROP CONSTRAINT "consultation_disabilities_disability_id_disabilities_id_fk";
--> statement-breakpoint
ALTER TABLE "consultation_disabilities" ALTER COLUMN "disability_id" SET NOT NULL;
--> statement-breakpoint
ALTER TABLE "consultation_disabilities" DROP COLUMN "has_disability";
--> statement-breakpoint
ALTER TABLE "consultation_disabilities" ADD CONSTRAINT "uq_cd_consultation_disability" UNIQUE("consultation_id","disability_id");
--> statement-breakpoint
ALTER TABLE "consultation_disabilities" ADD CONSTRAINT "consultation_disabilities_disability_id_disabilities_id_fk" FOREIGN KEY ("disability_id") REFERENCES "public"."disabilities"("id") ON DELETE cascade ON UPDATE no action;
