CREATE TABLE `feishu_pushes` (
	`idempotency_key` text PRIMARY KEY NOT NULL,
	`report_id` text NOT NULL,
	`requested_by` text NOT NULL,
	`status` text NOT NULL,
	`http_status` integer,
	`provider_response` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`completed_at` text,
	FOREIGN KEY (`report_id`) REFERENCES `reports`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `feishu_pushes_report_idx` ON `feishu_pushes` (`report_id`,`created_at`);