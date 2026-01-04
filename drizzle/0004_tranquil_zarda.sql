CREATE TABLE `counselor_llm_config` (
	`id` int AUTO_INCREMENT NOT NULL,
	`counselorId` varchar(50) NOT NULL,
	`counselorName` varchar(100) NOT NULL,
	`llmProvider` varchar(50) NOT NULL DEFAULT 'gemini',
	`llmModel` varchar(100) NOT NULL DEFAULT 'gemini-2.0-flash-exp',
	`endpoint` text,
	`apiKey` text,
	`isActive` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `counselor_llm_config_id` PRIMARY KEY(`id`),
	CONSTRAINT `counselor_llm_config_counselorId_unique` UNIQUE(`counselorId`)
);
