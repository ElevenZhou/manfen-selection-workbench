CREATE TABLE `candidates` (
	`id` text PRIMARY KEY NOT NULL,
	`report_id` text NOT NULL,
	`route` text NOT NULL,
	`title` text NOT NULL,
	`category` text NOT NULL,
	`market` text NOT NULL,
	`route_score` real NOT NULL,
	`route_rank` integer NOT NULL,
	`decision` text NOT NULL,
	`data_completeness` real NOT NULL,
	`opportunity` text NOT NULL,
	`improvements` text NOT NULL,
	`package_status` text NOT NULL,
	FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `candidates_report_route_idx` ON `candidates` (`report_id`,`route`,`route_rank`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`period_label` text NOT NULL,
	`published_at` text NOT NULL,
	`title` text NOT NULL,
	`summary` text NOT NULL,
	`status` text NOT NULL,
	`total_selected` integer NOT NULL,
	`total_packages` integer NOT NULL,
	`source_run_id` text NOT NULL,
	`methodology_version` text NOT NULL,
	`payload` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `reports_published_at_idx` ON `reports` (`published_at`);