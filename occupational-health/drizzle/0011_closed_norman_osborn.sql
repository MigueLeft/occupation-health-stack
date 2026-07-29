ALTER TABLE "position_risks" DROP CONSTRAINT "position_risks_position_id_risk_id_pk";--> statement-breakpoint
ALTER TABLE "position_risks" ADD COLUMN "assigned_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "position_risks" ADD COLUMN "removed_at" timestamp;--> statement-breakpoint
ALTER TABLE "position_risks" ADD CONSTRAINT "position_risks_position_id_risk_id_assigned_at_pk" PRIMARY KEY("position_id","risk_id","assigned_at");