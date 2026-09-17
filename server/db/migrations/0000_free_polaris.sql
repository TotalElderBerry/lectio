CREATE TYPE "public"."session_status" AS ENUM('in_progress', 'completed');--> statement-breakpoint
CREATE TYPE "public"."step_name" AS ENUM('read', 'reflect', 'respond', 'rest');--> statement-breakpoint
CREATE TABLE "passage_cache" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"translation" text NOT NULL,
	"reference_key" text NOT NULL,
	"reference_display" text NOT NULL,
	"text" text NOT NULL,
	"verses" jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prayer_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"reference_display" text NOT NULL,
	"reference_key" text NOT NULL,
	"translation" text NOT NULL,
	"passage_text" text NOT NULL,
	"word_or_phrase" text,
	"status" "session_status" DEFAULT 'in_progress' NOT NULL,
	"local_date" text,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "session_steps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"step" "step_name" NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_settings" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"default_translation" text DEFAULT 'web' NOT NULL,
	"timers_enabled" boolean DEFAULT false NOT NULL,
	"chime_enabled" boolean DEFAULT true NOT NULL,
	"step_seconds" jsonb DEFAULT '{"read":180,"reflect":240,"respond":240,"rest":300}'::jsonb NOT NULL,
	"theme" text DEFAULT 'system' NOT NULL,
	"timezone" text DEFAULT 'UTC' NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"display_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "prayer_sessions" ADD CONSTRAINT "prayer_sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session_steps" ADD CONSTRAINT "session_steps_session_id_prayer_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."prayer_sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "passage_cache_translation_ref_unique" ON "passage_cache" USING btree ("translation","reference_key");--> statement-breakpoint
CREATE INDEX "prayer_sessions_user_started_idx" ON "prayer_sessions" USING btree ("user_id","started_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "prayer_sessions_user_local_date_idx" ON "prayer_sessions" USING btree ("user_id","local_date");--> statement-breakpoint
CREATE UNIQUE INDEX "session_steps_session_step_unique" ON "session_steps" USING btree ("session_id","step");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");