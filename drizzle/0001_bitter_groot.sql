CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `mosques` ADD `details` text;--> statement-breakpoint
ALTER TABLE `reports` ADD `author_name` text;--> statement-breakpoint
ALTER TABLE `reports` ADD `proof_note` text;