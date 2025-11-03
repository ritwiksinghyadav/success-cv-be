CREATE TABLE "invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"generatedBy" integer NOT NULL,
	"organisationID" integer NOT NULL,
	"type" varchar(50) NOT NULL,
	"email" varchar(255),
	"isAccepted" boolean DEFAULT false,
	"acceptedCount" integer DEFAULT 0 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"expiresAt" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organisation_members" (
	"id" serial PRIMARY KEY NOT NULL,
	"userID" integer NOT NULL,
	"organisationID" integer NOT NULL,
	"role" varchar(100) NOT NULL,
	"invite_ref" uuid,
	"joinedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organisations" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"creatorID" integer NOT NULL,
	"address" text,
	"country" varchar(100),
	"state" varchar(100),
	"city" varchar(100),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_generatedBy_users_id_fk" FOREIGN KEY ("generatedBy") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invites" ADD CONSTRAINT "invites_organisationID_organisations_id_fk" FOREIGN KEY ("organisationID") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_userID_users_id_fk" FOREIGN KEY ("userID") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_organisationID_organisations_id_fk" FOREIGN KEY ("organisationID") REFERENCES "public"."organisations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisation_members" ADD CONSTRAINT "organisation_members_invite_ref_invites_id_fk" FOREIGN KEY ("invite_ref") REFERENCES "public"."invites"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_creatorID_users_id_fk" FOREIGN KEY ("creatorID") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;