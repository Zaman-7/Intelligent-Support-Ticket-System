# Database Schema Documentation: Customer Support System

This document outlines the database schema for the Customer Support or Ticketing System. Includes an overview of each table, its columns, and relationships.

## 1. `User` Table
Stores the credentials, basic details, and roles of the users in the system (e.g., customers, agents, admins).
- **`user_id`** (`INT`): Unique identifier for the user. *(Primary Key, Auto-Incremented)*
- **`username`** (`VARCHAR(255)`): The display name or username of the user.
- **`email`** (`VARCHAR(255)`): The user's email address.
- **`password`** (`VARCHAR(255)`): The hashed password for the user.
- **`role`** (`ENUM('customer', 'agent', 'admin')`): Defines the access level or type of the user.
- **`created_at`** (`DATETIME`): The timestamp when the user account was created.

## 2. `Categories` Table
Stores the different categories that a ticket can be classified under (e.g., 'Billing', 'Technical Support').
- **`category_id`** (`INT UNSIGNED`): Unique identifier for the category. *(Primary Key, Auto-Incremented)*
- **`category_name`** (`VARCHAR(255)`): The name of the category.
- **`description`** (`TEXT`): A detailed description of what the category covers.

## 3. `Tickets` Table
The core table storing the actual support requests or tickets submitted by users.
- **`ticket_id`** (`INT UNSIGNED`): Unique identifier for the ticket. *(Primary Key, Auto-Incremented)*
- **`user_id`** (`INT`): The ID of the user who created the ticket. *(Foreign Key pointing to `User.user_id`)*
- **`subject`** (`VARCHAR(255)`): The short title or subject of the ticket.
- **`description`** (`TEXT`): The detailed explanation of the user's issue.
- **`status`** (`ENUM('open', 'in_progress', 'resolved', 'closed')`): The current state of the ticket.
- **`priority`** (`ENUM('low', 'medium', 'high', 'urgent')`): The urgency level of the ticket.
- **`category_id`** (`INT UNSIGNED`): The ID of the category this ticket belongs to. *(Foreign Key pointing to `Categories.category_id`)*
- **`assigned_agent_id`** (`INT`): The ID of the support agent assigned to handle the ticket. Can be NULL if not yet assigned.
- **`created_at`** (`DATETIME`): The timestamp when the ticket was opened.
- **`updated_at`** (`DATETIME`): The timestamp when the ticket was last updated.

## 4. `Ticket_Updates` Table
Tracks all comments, replies, and internal notes made on a specific ticket.
- **`update_id`** (`INT UNSIGNED`): Unique identifier for the update record. *(Primary Key, Auto-Incremented)*
- **`ticket_id`** (`INT UNSIGNED`): The ticket this update belongs to. *(Foreign Key pointing to `Tickets.ticket_id`)*
- **`user_id`** (`INT`): The user or agent who posted the update. *(Foreign Key pointing to `User.user_id`)*
- **`comment_text`** (`TEXT`): The content of the comment or note.
- **`is_internal`** (`BOOLEAN`): If `true`, the comment is an internal note visible only to agents; if `false`, it is visible to the customer.
- **`created_at`** (`DATETIME`): The timestamp when the update was posted.

## 5. `Ai_Predictions` Table
Stores automated inferences or AI-driven insights related to a ticket.
- **`prediction_id`** (`INT UNSIGNED`): Unique identifier for the prediction. *(Primary Key, Auto-Incremented)*
- **`ticket_id`** (`INT UNSIGNED`): The ticket that was analyzed by the AI. *(Foreign Key pointing to `Tickets.ticket_id`)*
- **`confidence_score`** (`FLOAT`): A numerical score representing how certain the AI is about its prediction.
- **`feedback`** (`BOOLEAN`): Indicates whether the AI's prediction was helpful or confirmed by a human.

## Entity-Relationship (ER) Connections
* **One-to-Many:** One `User` can create multiple `Tickets`.
* **One-to-Many:** One `User` can post multiple `Ticket_Updates`.
* **One-to-Many:** One `Categories` (Category) can have multiple `Tickets` associated with it.
* **One-to-Many:** One `Tickets` (Ticket) can have multiple `Ticket_Updates` (replies/comments) and multiple `Ai_Predictions` associated with it. 
