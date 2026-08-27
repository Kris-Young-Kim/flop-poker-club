ALTER TABLE "profiles" ADD COLUMN "terms_agreed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "profiles" ADD COLUMN "terms_version" text;
