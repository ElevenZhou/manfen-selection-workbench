ALTER TABLE `candidates` ADD `reference_apps` text DEFAULT '[]' NOT NULL;--> statement-breakpoint
ALTER TABLE `candidates` ADD `icon_url` text;--> statement-breakpoint
ALTER TABLE `candidates` ADD `icon_source` text DEFAULT 'generated' NOT NULL;--> statement-breakpoint
ALTER TABLE `candidates` ADD `icon_source_url` text;