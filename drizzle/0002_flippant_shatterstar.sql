CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`analysisId` int,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) NOT NULL DEFAULT 'USD',
	`status` enum('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
	`paymentMethod` varchar(50),
	`transactionId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `analyses` ADD `context` text;--> statement-breakpoint
ALTER TABLE `analyses` ADD `selectedAnalysts` json;--> statement-breakpoint
ALTER TABLE `analyses` ADD `analysisSteps` json;--> statement-breakpoint
ALTER TABLE `analyses` ADD `estimatedCost` decimal(10,4);--> statement-breakpoint
ALTER TABLE `analyses` ADD `actualCost` decimal(10,4);--> statement-breakpoint
ALTER TABLE `analyses` ADD `totalTokensUsed` int;--> statement-breakpoint
ALTER TABLE `analyses` ADD `executionTime` int;--> statement-breakpoint
ALTER TABLE `analyses` ADD `isPaid` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `invited_users` ADD `analysisQuota` int DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `analysisQuota` int DEFAULT 5 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `analysisUsed` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `totalSpent` decimal(10,2) DEFAULT '0.00' NOT NULL;