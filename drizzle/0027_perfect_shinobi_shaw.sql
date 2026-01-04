ALTER TABLE `analyses` ADD `sessionCode` varchar(50);--> statement-breakpoint
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_sessionCode_unique` UNIQUE(`sessionCode`);