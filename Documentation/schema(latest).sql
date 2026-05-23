CREATE TABLE `User`(
    `user_id` INT NOT NULL,
    `username` VARCHAR(255) NOT NULL,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `role` ENUM('') NOT NULL,
    `created_at` DATETIME NOT NULL,
    PRIMARY KEY(`user_id`)
);
CREATE TABLE `Categories`(
    `categories_id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `category_name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL
);
CREATE TABLE `Tickets`(
    `ticket_id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `user_id` INT NOT NULL,
    `subject` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `status` ENUM('') NOT NULL,
    `priority` ENUM('') NOT NULL,
    `categories_id` INT NOT NULL,
    `assigned_agent_id` INT NOT NULL,
    `created_at` DATETIME NOT NULL,
    `updated_at` DATETIME NOT NULL,
    `sla_due_date` DATETIME NOT NULL
);
CREATE TABLE `Ticket_Updates`(
    `update_id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `ticket_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `comment` TEXT NOT NULL,
    `is_internal` BOOLEAN NOT NULL,
    `created_at` DATETIME NOT NULL
);
CREATE TABLE `Ai_Analysis`(
    `analysis_id` INT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    `ticket_id` INT NOT NULL,
    `confidence_score` FLOAT(53) NOT NULL,
    `reasoning` TEXT NOT NULL,
    `ai_draft_response` TEXT NOT NULL,
    `suggested_priority` ENUM('') NOT NULL
);
ALTER TABLE
    `User` ADD CONSTRAINT `user_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `Tickets`(`user_id`);
ALTER TABLE
    `Tickets` ADD CONSTRAINT `tickets_ticket_id_foreign` FOREIGN KEY(`ticket_id`) REFERENCES `Ticket_Updates`(`ticket_id`);
ALTER TABLE
    `User` ADD CONSTRAINT `user_user_id_foreign` FOREIGN KEY(`user_id`) REFERENCES `Ticket_Updates`(`user_id`);
ALTER TABLE
    `Tickets` ADD CONSTRAINT `tickets_ticket_id_foreign` FOREIGN KEY(`ticket_id`) REFERENCES `Ai_Analysis`(`ticket_id`);
ALTER TABLE
    `Tickets` ADD CONSTRAINT `tickets_categories_id_foreign` FOREIGN KEY(`categories_id`) REFERENCES `Categories`(`categories_id`);