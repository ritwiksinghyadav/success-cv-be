CREATE TABLE "analyses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "analyses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userID" integer NOT NULL,
	"documentID" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"jobID" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"meta" text,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "candidate_analyses" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "candidate_analyses_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"candidateID" integer NOT NULL,
	"documentID" integer NOT NULL,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"jpbID" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"meta" text,
	"completedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "candidate_documents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "candidate_documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"candidateID" integer NOT NULL,
	"title" varchar(255),
	"fileURL" varchar(512) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"meta" text,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "candidate_processed_and_raw_data" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "candidate_processed_and_raw_data_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"analysisID" integer NOT NULL,
	"documentID" integer NOT NULL,
	"rawData" text NOT NULL,
	"processedData" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"meta" text
);
--> statement-breakpoint
CREATE TABLE "candidate_rewrites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "candidate_rewrites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"analysisID" integer NOT NULL,
	"documentID" integer NOT NULL,
	"processedDataID" integer NOT NULL,
	"rewriteContent" text,
	"jobID" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"meta" text
);
--> statement-breakpoint
CREATE TABLE "processed_and_raw_data" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "processed_and_raw_data_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"analysisID" integer NOT NULL,
	"documentID" integer NOT NULL,
	"rawData" text NOT NULL,
	"processedData" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"meta" text
);
--> statement-breakpoint
CREATE TABLE "rewrites" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "rewrites_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"analysisID" integer NOT NULL,
	"documentID" integer NOT NULL,
	"processedDataID" integer NOT NULL,
	"rewriteContent" text,
	"jobID" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"meta" text
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "documents_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"userID" integer NOT NULL,
	"title" varchar(255),
	"fileURL" varchar(512) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"meta" text,
	"deletedAt" timestamp
);
--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_userID_users_id_fk" FOREIGN KEY ("userID") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_documentID_documents_id_fk" FOREIGN KEY ("documentID") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_analyses" ADD CONSTRAINT "candidate_analyses_candidateID_candidates_id_fk" FOREIGN KEY ("candidateID") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_analyses" ADD CONSTRAINT "candidate_analyses_documentID_candidate_documents_id_fk" FOREIGN KEY ("documentID") REFERENCES "public"."candidate_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_documents" ADD CONSTRAINT "candidate_documents_candidateID_candidates_id_fk" FOREIGN KEY ("candidateID") REFERENCES "public"."candidates"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_processed_and_raw_data" ADD CONSTRAINT "candidate_processed_and_raw_data_analysisID_candidate_analyses_id_fk" FOREIGN KEY ("analysisID") REFERENCES "public"."candidate_analyses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_processed_and_raw_data" ADD CONSTRAINT "candidate_processed_and_raw_data_documentID_candidate_documents_id_fk" FOREIGN KEY ("documentID") REFERENCES "public"."candidate_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_rewrites" ADD CONSTRAINT "candidate_rewrites_analysisID_candidate_analyses_id_fk" FOREIGN KEY ("analysisID") REFERENCES "public"."candidate_analyses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_rewrites" ADD CONSTRAINT "candidate_rewrites_documentID_candidate_documents_id_fk" FOREIGN KEY ("documentID") REFERENCES "public"."candidate_documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_rewrites" ADD CONSTRAINT "candidate_rewrites_processedDataID_candidate_processed_and_raw_data_id_fk" FOREIGN KEY ("processedDataID") REFERENCES "public"."candidate_processed_and_raw_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processed_and_raw_data" ADD CONSTRAINT "processed_and_raw_data_analysisID_analyses_id_fk" FOREIGN KEY ("analysisID") REFERENCES "public"."analyses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "processed_and_raw_data" ADD CONSTRAINT "processed_and_raw_data_documentID_documents_id_fk" FOREIGN KEY ("documentID") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewrites" ADD CONSTRAINT "rewrites_analysisID_analyses_id_fk" FOREIGN KEY ("analysisID") REFERENCES "public"."analyses"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewrites" ADD CONSTRAINT "rewrites_documentID_documents_id_fk" FOREIGN KEY ("documentID") REFERENCES "public"."documents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewrites" ADD CONSTRAINT "rewrites_processedDataID_processed_and_raw_data_id_fk" FOREIGN KEY ("processedDataID") REFERENCES "public"."processed_and_raw_data"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_userID_users_id_fk" FOREIGN KEY ("userID") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;