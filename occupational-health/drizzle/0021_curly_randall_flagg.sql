CREATE TABLE "consultation_psychological_results" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"consultation_id" uuid NOT NULL,
	"indicator_id" uuid NOT NULL,
	"value_id" uuid NOT NULL,
	CONSTRAINT "uq_consultation_indicator" UNIQUE("consultation_id","indicator_id")
);
--> statement-breakpoint
CREATE TABLE "psychological_indicator_values" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"indicator_id" uuid NOT NULL,
	"name" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "uq_indicator_value_name" UNIQUE("indicator_id","name")
);
--> statement-breakpoint
CREATE TABLE "psychological_indicators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(100) NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "psychological_indicators_name_unique" UNIQUE("name")
);
--> statement-breakpoint
ALTER TABLE "consultation_psychological_results" ADD CONSTRAINT "consultation_psychological_results_consultation_id_consultations_id_fk" FOREIGN KEY ("consultation_id") REFERENCES "public"."consultations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_psychological_results" ADD CONSTRAINT "consultation_psychological_results_indicator_id_psychological_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."psychological_indicators"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "consultation_psychological_results" ADD CONSTRAINT "consultation_psychological_results_value_id_psychological_indicator_values_id_fk" FOREIGN KEY ("value_id") REFERENCES "public"."psychological_indicator_values"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "psychological_indicator_values" ADD CONSTRAINT "psychological_indicator_values_indicator_id_psychological_indicators_id_fk" FOREIGN KEY ("indicator_id") REFERENCES "public"."psychological_indicators"("id") ON DELETE cascade ON UPDATE no action;