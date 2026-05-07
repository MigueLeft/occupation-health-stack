ALTER TABLE "rest_periods" ADD COLUMN "disease_id" uuid REFERENCES "diseases"("id") ON DELETE SET NULL;
