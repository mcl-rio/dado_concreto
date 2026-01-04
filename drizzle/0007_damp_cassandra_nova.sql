CREATE TABLE `temperature_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`agentType` varchar(50) NOT NULL,
	`temperature` decimal(3,2) NOT NULL,
	`description` varchar(255),
	`updatedBy` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `temperature_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `temperature_config_agentType_unique` UNIQUE(`agentType`)
);
--> statement-breakpoint
ALTER TABLE `llm_usage_costs` ADD `temperature` decimal(3,2);