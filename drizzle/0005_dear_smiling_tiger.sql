CREATE TABLE `llm_usage_costs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int,
	`userId` int NOT NULL,
	`counselorId` varchar(50),
	`llmProvider` varchar(50) NOT NULL,
	`llmModel` varchar(100) NOT NULL,
	`inputTokens` int NOT NULL DEFAULT 0,
	`outputTokens` int NOT NULL DEFAULT 0,
	`totalTokens` int NOT NULL DEFAULT 0,
	`costUsd` decimal(10,6) NOT NULL DEFAULT '0.000000',
	`requestType` varchar(50),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `llm_usage_costs_id` PRIMARY KEY(`id`)
);
