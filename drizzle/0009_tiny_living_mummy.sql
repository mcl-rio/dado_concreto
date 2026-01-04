CREATE TABLE `system_prompts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`promptKey` varchar(100) NOT NULL,
	`promptName` varchar(255) NOT NULL,
	`description` text,
	`promptContent` text NOT NULL,
	`defaultContent` text NOT NULL,
	`category` enum('agent','task','evaluation') NOT NULL DEFAULT 'agent',
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_prompts_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_prompts_promptKey_unique` UNIQUE(`promptKey`)
);
