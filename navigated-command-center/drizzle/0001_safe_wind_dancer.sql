CREATE TABLE `operator_actions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`actionType` varchar(64) NOT NULL,
	`payload` text,
	`actorOpenId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `operator_actions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `scenario_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`scenarioId` varchar(32) NOT NULL,
	`action` enum('SET','CLEAR','RECALCULATE') NOT NULL,
	`delayMinutes` int NOT NULL DEFAULT 0,
	`affectedFleet` int NOT NULL DEFAULT 0,
	`actorOpenId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `scenario_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `train_eta_observations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trainId` varchar(16) NOT NULL,
	`etaMinutes` int NOT NULL,
	`scheduledMinutes` int NOT NULL,
	`confidence` int NOT NULL,
	`position` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `train_eta_observations_id` PRIMARY KEY(`id`)
);
