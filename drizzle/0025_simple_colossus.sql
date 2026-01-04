CREATE TABLE `system_parameters` (
	`id` int AUTO_INCREMENT NOT NULL,
	`key` varchar(100) NOT NULL,
	`value` text NOT NULL,
	`description` text,
	`type` enum('number','boolean','string') NOT NULL DEFAULT 'string',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `system_parameters_id` PRIMARY KEY(`id`),
	CONSTRAINT `system_parameters_key_unique` UNIQUE(`key`)
);
