ALTER TABLE "consultation_referrals" DROP CONSTRAINT "uq_referral_consultation";--> statement-breakpoint
DELETE FROM "consultation_referrals" WHERE "specialty_id" IS NULL;--> statement-breakpoint
ALTER TABLE "consultation_referrals" DROP CONSTRAINT "consultation_referrals_specialty_id_medical_specialties_id_fk";
--> statement-breakpoint
ALTER TABLE "consultation_referrals" ALTER COLUMN "specialty_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "consultation_referrals" ADD CONSTRAINT "consultation_referrals_specialty_id_medical_specialties_id_fk" FOREIGN KEY ("specialty_id") REFERENCES "public"."medical_specialties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_referrals" DROP COLUMN "requires_referral";--> statement-breakpoint
ALTER TABLE "consultation_referrals" ADD CONSTRAINT "uq_cr_consultation_specialty" UNIQUE("consultation_id","specialty_id");