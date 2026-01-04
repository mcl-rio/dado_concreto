CREATE TABLE `analyses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`objective` text NOT NULL,
	`status` enum('draft','processing','completed','failed') NOT NULL DEFAULT 'draft',
	`analysisStructure` json,
	`reportStructure` json,
	`generatedContent` text,
	`savedToHistory` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`completedAt` timestamp,
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analysis_sources` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`sourceType` enum('file','news','web') NOT NULL,
	`title` varchar(500),
	`url` text,
	`fileKey` varchar(500),
	`fileName` varchar(255),
	`mimeType` varchar(100),
	`extractedText` text,
	`metadata` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analysis_sources_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analysis_templates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`templateType` enum('analysis','report') NOT NULL,
	`structure` json NOT NULL,
	`isDefault` boolean NOT NULL DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `analysis_templates_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `invited_users` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(320) NOT NULL,
	`validUntil` timestamp,
	`isActive` boolean NOT NULL DEFAULT true,
	`invitedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `invited_users_id` PRIMARY KEY(`id`),
	CONSTRAINT `invited_users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `validUntil` timestamp;--> statement-breakpoint
ALTER TABLE `users` ADD `isActive` boolean DEFAULT true NOT NULL;