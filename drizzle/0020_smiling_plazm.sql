CREATE TABLE `llm_pricing` (
	`id` int AUTO_INCREMENT NOT NULL,
	`provider` varchar(50) NOT NULL,
	`modelName` varchar(100) NOT NULL,
	`displayName` varchar(150),
	`inputPricePerMillion` decimal(10,6) NOT NULL,
	`outputPricePerMillion` decimal(10,6) NOT NULL,
	`description` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `llm_pricing_id` PRIMARY KEY(`id`)
);
