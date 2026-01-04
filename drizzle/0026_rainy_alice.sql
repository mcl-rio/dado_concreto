ALTER TABLE `email_config` ADD `emailSubject` text;--> statement-breakpoint
ALTER TABLE `email_config` ADD `emailBody` text;--> statement-breakpoint
ALTER TABLE `email_config` ADD `senderEmail` varchar(320) DEFAULT 'marlos@marlos.com.br';