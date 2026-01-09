CREATE TABLE `generations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`type` enum('three_view','model_3d') NOT NULL,
	`groupNumber` int,
	`assetUrls` text NOT NULL,
	`assetKeys` text NOT NULL,
	`isSelected` boolean NOT NULL DEFAULT false,
	`metadata` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `generations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`projectId` int NOT NULL,
	`contactEmail` varchar(320) NOT NULL,
	`contactPhone` varchar(32),
	`modificationFeedback` text,
	`paymentStatus` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
	`stripePaymentIntentId` varchar(128),
	`stripeSessionId` varchar(128),
	`depositAmount` decimal(10,2) NOT NULL DEFAULT '20.00',
	`orderStatus` enum('submitted','in_progress','completed','cancelled') NOT NULL DEFAULT 'submitted',
	`designerNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_projectId_unique` UNIQUE(`projectId`)
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sessionId` varchar(128) NOT NULL,
	`description` text NOT NULL,
	`sketchUrl` varchar(512),
	`sketchKey` varchar(512),
	`status` enum('draft','generating','completed','ordered') NOT NULL DEFAULT 'draft',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `projects_id` PRIMARY KEY(`id`)
);
