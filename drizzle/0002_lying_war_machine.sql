CREATE TABLE `model3d_generations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`tripoTaskId` varchar(128),
	`status` enum('processing','completed','failed') NOT NULL DEFAULT 'processing',
	`modelUrl` text,
	`modelKey` varchar(512),
	`sourceGenerationId` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `model3d_generations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `description` text;--> statement-breakpoint
ALTER TABLE `projects` MODIFY COLUMN `status` enum('draft','generating_views','views_ready','generating_3d','completed','ordered') NOT NULL DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `projects` ADD `inputType` enum('text','single_image','multi_view') DEFAULT 'text' NOT NULL;--> statement-breakpoint
ALTER TABLE `projects` ADD `textPrompt` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `imageUrls` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `imageKeys` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `fourViewUrls` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `fourViewKeys` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `tripoTaskId` varchar(128);--> statement-breakpoint
ALTER TABLE `projects` ADD `tripoTaskStatus` enum('pending','queued','running','success','failed') DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE `projects` ADD `modelUrl` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `modelKey` varchar(512);--> statement-breakpoint
ALTER TABLE `projects` ADD `regenerationCount` int DEFAULT 0 NOT NULL;