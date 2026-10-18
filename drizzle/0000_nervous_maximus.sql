CREATE TABLE `audit` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`action` text NOT NULL,
	`target` text NOT NULL,
	`created` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `confirmations` (
	`report_id` text NOT NULL,
	`user_id` text NOT NULL,
	`prayer` text NOT NULL,
	`date` text NOT NULL,
	PRIMARY KEY(`report_id`, `user_id`, `prayer`, `date`)
);
--> statement-breakpoint
CREATE TABLE `limits` (
	`key` text PRIMARY KEY NOT NULL,
	`count` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `mosques` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`name_bn` text NOT NULL,
	`lat` text NOT NULL,
	`lon` text NOT NULL,
	`area` text NOT NULL,
	`source_url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`mosque_id` text NOT NULL,
	`times` text NOT NULL,
	`observed` text NOT NULL,
	`valid_until` text NOT NULL,
	`created` text NOT NULL,
	`source` text NOT NULL,
	`note` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`photo` text,
	`review_note` text
);
--> statement-breakpoint
CREATE INDEX `report_mosque` ON `reports` (`mosque_id`,`status`);--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`payload` text NOT NULL,
	`created` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL
);
