CREATE TABLE "geo_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "position_risks" (
	"position_id" uuid NOT NULL,
	"risk_id" uuid NOT NULL,
	CONSTRAINT "position_risks_position_id_risk_id_pk" PRIMARY KEY("position_id","risk_id")
);
--> statement-breakpoint
ALTER TABLE "patients" DROP CONSTRAINT "patients_email_unique";--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "email" varchar(255);--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "state_id" uuid;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "city_id" uuid;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "municipality_id" uuid;--> statement-breakpoint
ALTER TABLE "companies" ADD COLUMN "parish_id" uuid;--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "psychological_aptitude" varchar(30);--> statement-breakpoint
ALTER TABLE "consultations" ADD COLUMN "is_healthy" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "position_risks" ADD CONSTRAINT "position_risks_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "position_risks" ADD CONSTRAINT "position_risks_risk_id_risks_id_fk" FOREIGN KEY ("risk_id") REFERENCES "public"."risks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_state_id_geo_locations_id_fk" FOREIGN KEY ("state_id") REFERENCES "public"."geo_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_city_id_geo_locations_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."geo_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_municipality_id_geo_locations_id_fk" FOREIGN KEY ("municipality_id") REFERENCES "public"."geo_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "companies" ADD CONSTRAINT "companies_parish_id_geo_locations_id_fk" FOREIGN KEY ("parish_id") REFERENCES "public"."geo_locations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patients" DROP COLUMN "email";