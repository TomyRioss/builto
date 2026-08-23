ALTER TABLE "Quote" ADD COLUMN "estimatedDays" INTEGER;

ALTER TABLE "Quote" ADD CONSTRAINT "Quote_estimatedDays_check"
CHECK ("estimatedDays" IS NULL OR "estimatedDays" BETWEEN 1 AND 365);
