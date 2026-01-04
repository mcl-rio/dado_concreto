ALTER TABLE `llm_pricing` ADD `supportsSync` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `llm_pricing` ADD `priceUpdatedAt` timestamp;