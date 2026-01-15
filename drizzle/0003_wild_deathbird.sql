ALTER TABLE `projects` ADD `userId` int;--> statement-breakpoint
ALTER TABLE `projects` ADD `isSaved` boolean DEFAULT false NOT NULL;