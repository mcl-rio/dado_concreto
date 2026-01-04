CREATE TABLE `counselor_opinions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`analysisId` int NOT NULL,
	`counselorId` varchar(50) NOT NULL,
	`counselorName` varchar(100) NOT NULL,
	`opinionContent` text NOT NULL,
	`status` enum('pending','approved','rejected','revision_requested') NOT NULL DEFAULT 'pending',
	`reviewerFeedback` text,
	`revisionCount` int NOT NULL DEFAULT 0,
	`tokensUsed` int,
	`estimatedCost` decimal(10,4),
	`generatedAt` timestamp NOT NULL DEFAULT (now()),
	`reviewedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `counselor_opinions_id` PRIMARY KEY(`id`)
);
