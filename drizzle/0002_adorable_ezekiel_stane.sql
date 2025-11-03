ALTER TABLE "organisations" ADD COLUMN "slug" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_slug_unique" UNIQUE("slug");