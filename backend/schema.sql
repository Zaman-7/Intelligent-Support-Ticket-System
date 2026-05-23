-- MySQL dump 10.13  Distrib 9.6.0, for macos26.2 (arm64)
--
-- Host: localhost    Database: Intelligent_System
-- ------------------------------------------------------
-- Server version	9.6.0-commercial

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
SET @MYSQLDUMP_TEMP_LOG_BIN = @@SESSION.SQL_LOG_BIN;
SET @@SESSION.SQL_LOG_BIN= 0;

--
-- GTID state at the beginning of the backup 
--

SET @@GLOBAL.GTID_PURGED=/*!80000 '+'*/ 'bb8d3472-fe97-11f0-be2b-3c8d0fa20324:1-256';

--
-- Temporary view structure for view `agent_dashboard`
--

DROP TABLE IF EXISTS `agent_dashboard`;
/*!50001 DROP VIEW IF EXISTS `agent_dashboard`*/;
SET @saved_cs_clienx t     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `agent_dashboard` AS SELECT 
 1 AS `ticket_id`,
 1 AS `subject`,
 1 AS `priority`,
 1 AS `status`,
 1 AS `Customer_Name`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `AI_Analysis`
--

DROP TABLE IF EXISTS `AI_Analysis`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `AI_Analysis` (
  `analysis_id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `suggested_priority` enum('Low','Medium','High','Critical') DEFAULT NULL,
  `confidence_score` float DEFAULT NULL,
  `reasoning` text,
  `ai_draft_response` text,
  PRIMARY KEY (`analysis_id`),
  KEY `ticket_id` (`ticket_id`),
  CONSTRAINT `ai_analysis_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `Tickets` (`ticket_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `AI_Analysis`
--

LOCK TABLES `AI_Analysis` WRITE;
/*!40000 ALTER TABLE `AI_Analysis` DISABLE KEYS */;
INSERT INTO `AI_Analysis` VALUES (1,1,'Critical',95.5,'VPN connectivity issues affecting remote work usually require immediate attention.','Hello, we are aware of the VPN connectivity issues. Can you please confirm which OS version you are currently running so we can provide the patch?'),(3,1,'Medium',15,'test1',NULL),(4,1,'Low',15,'test2',NULL),(5,1,'High',75,'test3',NULL),(6,1,'High',150.5,'Overconfident prediction',NULL),(7,1,'High',150.5,'Overconfident prediction',NULL);
/*!40000 ALTER TABLE `AI_Analysis` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `ai_performance_summary`
--

DROP TABLE IF EXISTS `ai_performance_summary`;
/*!50001 DROP VIEW IF EXISTS `ai_performance_summary`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `ai_performance_summary` AS SELECT 
 1 AS `category_name`,
 1 AS `Avg_Confidence`,
 1 AS `Tickets_Analyzed`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Categories`
--

DROP TABLE IF EXISTS `Categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Categories` (
  `categories_id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(50) NOT NULL,
  `description` text,
  PRIMARY KEY (`categories_id`),
  UNIQUE KEY `category_name` (`category_name`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Categories`
--

LOCK TABLES `Categories` WRITE;
/*!40000 ALTER TABLE `Categories` DISABLE KEYS */;
INSERT INTO `Categories` VALUES (2,'Technical Support','Bugs, downtime, and functional assistance'),(3,'General Inquiry','Questions about usage or platform details'),(4,'Billing Issues','Issues Related to payment '),(5,'Hardware ','Issues related to hardware'),(6,'Software','Issues with software'),(7,'Billing','Issues related to invoices, payments, and subscriptions');
/*!40000 ALTER TABLE `Categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Temporary view structure for view `closed_tickets_archive`
--

DROP TABLE IF EXISTS `closed_tickets_archive`;
/*!50001 DROP VIEW IF EXISTS `closed_tickets_archive`*/;
SET @saved_cs_client     = @@character_set_client;
/*!50503 SET character_set_client = utf8mb4 */;
/*!50001 CREATE VIEW `closed_tickets_archive` AS SELECT 
 1 AS `ticket_id`,
 1 AS `subject`,
 1 AS `priority`,
 1 AS `closed_date`*/;
SET character_set_client = @saved_cs_client;

--
-- Table structure for table `Ticket_Status_Audit`
--

DROP TABLE IF EXISTS `Ticket_Status_Audit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ticket_Status_Audit` (
  `audit_id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int DEFAULT NULL,
  `old_status` varchar(20) DEFAULT NULL,
  `new_status` varchar(20) DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ticket_Status_Audit`
--

LOCK TABLES `Ticket_Status_Audit` WRITE;
/*!40000 ALTER TABLE `Ticket_Status_Audit` DISABLE KEYS */;
/*!40000 ALTER TABLE `Ticket_Status_Audit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Ticket_Updates`
--

DROP TABLE IF EXISTS `Ticket_Updates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Ticket_Updates` (
  `update_id` int NOT NULL AUTO_INCREMENT,
  `ticket_id` int NOT NULL,
  `user_id` int NOT NULL,
  `comments` text NOT NULL,
  `is_internal` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`update_id`),
  KEY `ticket_id` (`ticket_id`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `ticket_updates_ibfk_1` FOREIGN KEY (`ticket_id`) REFERENCES `Tickets` (`ticket_id`) ON DELETE CASCADE,
  CONSTRAINT `ticket_updates_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Ticket_Updates`
--

LOCK TABLES `Ticket_Updates` WRITE;
/*!40000 ALTER TABLE `Ticket_Updates` DISABLE KEYS */;
INSERT INTO `Ticket_Updates` VALUES (1,1,1,'Any updates on this?',0,'2026-03-15 12:18:08'),(2,1,2,'Checking the gateway logs now.',1,'2026-03-15 12:18:08'),(4,1,2,'Please revert back with update',1,'2026-03-15 12:45:36'),(5,1,2,'Hello, we are aware of the VPN connectivity issues. Can you please confirm which OS version you are currently running so we can provide the patch?',0,'2026-03-15 12:45:49'),(6,4,2,'Forwarding to hardware department\n',1,'2026-03-15 12:47:03'),(7,5,2,'Ticket is open \n',0,'2026-03-16 08:16:27'),(8,5,2,'Forwarding to billings',1,'2026-03-16 08:17:12'),(9,1,1,'Any updates on this?',0,'2026-03-20 00:35:23'),(10,1,2,'Checking the gateway logs now.',1,'2026-03-20 00:35:23');
/*!40000 ALTER TABLE `Ticket_Updates` ENABLE KEYS */;
UNLOCK TABLES;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `UpdateTicketTimestamp` AFTER INSERT ON `ticket_updates` FOR EACH ROW BEGIN
    UPDATE Tickets 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE ticket_id = NEW.ticket_id;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Tickets`
--

DROP TABLE IF EXISTS `Tickets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Tickets` (
  `ticket_id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `categories_id` int NOT NULL,
  `assigned_agent_id` int DEFAULT NULL,
  `subject` varchar(150) NOT NULL,
  `description` text NOT NULL,
  `status` enum('Open','In Progress','Resolved','Closed') DEFAULT 'Open',
  `priority` enum('Low','Medium','High','Critical') DEFAULT 'Medium',
  `sla_due_date` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_id`),
  KEY `user_id` (`user_id`),
  KEY `categories_id` (`categories_id`),
  KEY `assigned_agent_id` (`assigned_agent_id`),
  CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `Users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `tickets_ibfk_2` FOREIGN KEY (`categories_id`) REFERENCES `Categories` (`categories_id`) ON DELETE CASCADE,
  CONSTRAINT `tickets_ibfk_3` FOREIGN KEY (`assigned_agent_id`) REFERENCES `Users` (`user_id`) ON DELETE SET NULL,
  CONSTRAINT `chk_priority` CHECK ((`priority` in (_utf8mb4'Low',_utf8mb4'Medium',_utf8mb4'High',_utf8mb4'Critical')))
) ENGINE=InnoDB AUTO_INCREMENT=70 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Tickets`
--

LOCK TABLES `Tickets` WRITE;
/*!40000 ALTER TABLE `Tickets` DISABLE KEYS */;
INSERT INTO `Tickets` VALUES (1,1,2,2,'Cannot connect to VPN','I am unable to connect to the corporate VPN since morning.','Closed','Critical','2026-03-15 16:18:08','2026-03-15 12:18:08','2026-03-20 00:35:23'),(4,4,5,2,'Fans not speeding up ','Fans aren\'t working as they are supposed, working very slow even when temperature is high','Closed','Medium','2026-03-16 12:42:26','2026-03-15 12:42:26','2026-03-16 08:20:10'),(5,5,4,2,'Payment didn\'t go through','Amount deducted but payment didn\'t go through','Closed','Medium','2026-03-17 08:15:44','2026-03-16 08:15:44','2026-03-16 08:20:15'),(6,1,4,2,'payment didn\'t','go through.','Open','Medium','2026-03-20 15:21:54','2026-03-19 15:21:54','2026-03-19 17:48:19'),(7,1,4,2,'Payment issues at Razrpay','Payment gateway not loading','Open','Medium','2026-03-20 17:42:51','2026-03-19 17:42:51','2026-03-19 17:45:22');
/*!40000 ALTER TABLE `Tickets` ENABLE KEYS */;
UNLOCK TABLES;

/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
/*!50003 CREATE*/ /*!50017 DEFINER=`root`@`localhost`*/ /*!50003 TRIGGER `LogStatusChange` AFTER UPDATE ON `tickets` FOR EACH ROW BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO Ticket_Status_Audit (ticket_id, old_status, new_status)
        VALUES (OLD.ticket_id, OLD.status, NEW.status);
    END IF;
END */;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Table structure for table `Users`
--

DROP TABLE IF EXISTS `Users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `Users` (
  `user_id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('Customer','Agent','Admin') DEFAULT 'Customer',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `unique_email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Users`
--

LOCK TABLES `Users` WRITE;
/*!40000 ALTER TABLE `Users` DISABLE KEYS */;
INSERT INTO `Users` VALUES (1,'Alice Walker','customer@example.com','hashedpassword','Customer','2026-03-15 12:18:08'),(2,'Agent Smith','agent@example.com','hashedpassword','Agent','2026-03-15 12:18:08'),(3,'Super Admin','admin@example.com','hashedpassword','Admin','2026-03-15 12:18:08'),(4,'Aleem','aleem@gmail.com','hashedpassword','Customer','2026-03-15 12:41:24'),(5,'Taubeej','bajaj@gmail.com','hashedpassword','Customer','2026-03-16 08:14:51'),(6,'Big Boss','boss@company','hashedpassword','Admin','2026-03-16 08:35:37'),(7,'JaneDoe','john@example.com','hash789','Customer','2026-03-19 15:36:53'),(8,'azb			','azb@hotmail.com','hashedpassword','Agent','2026-03-19 17:50:11');
/*!40000 ALTER TABLE `Users` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Dumping routines for database 'Intelligent_System'
--
/*!50003 DROP PROCEDURE IF EXISTS `CountInternalAgentNotes` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `CountInternalAgentNotes`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_agent_name VARCHAR(50);
    DECLARE v_note_count INT;
    DECLARE agent_cursor CURSOR FOR 
        SELECT u.username, COUNT(tu.update_id) 
        FROM Users u 
        JOIN ticket_updates tu ON u.user_id = tu.user_id 
        WHERE u.role = 'Agent' AND tu.is_internal = TRUE
        GROUP BY u.username;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN agent_cursor;
    read_loop: LOOP
        FETCH agent_cursor INTO v_agent_name, v_note_count;
        IF done THEN
            LEAVE read_loop;
        END IF;
        SELECT CONCAT('Agent ', v_agent_name, ' has written ', v_note_count, ' internal notes.') AS Audit_Log;
    END LOOP;
    CLOSE agent_cursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `FlagConfidenceAI` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `FlagConfidenceAI`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_ticket_id INT;
    DECLARE v_score FLOAT;
    DECLARE ai_cursor CURSOR FOR SELECT ticket_id, confidence_score FROM AI_Analysis WHERE confidence_score < 70.0;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN ai_cursor;
    read_loop: LOOP
        FETCH ai_cursor INTO v_ticket_id, v_score;
        IF done THEN
            LEAVE read_loop;
        END IF;
        SELECT CONCAT('WARNING: Ticket ', v_ticket_id, ' needs manual review. AI Score: ', v_score) AS Review_Alert;
    END LOOP;
    CLOSE ai_cursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;
/*!50003 DROP PROCEDURE IF EXISTS `GenerateOpenTicketReport` */;
/*!50003 SET @saved_cs_client      = @@character_set_client */ ;
/*!50003 SET @saved_cs_results     = @@character_set_results */ ;
/*!50003 SET @saved_col_connection = @@collation_connection */ ;
/*!50003 SET character_set_client  = utf8mb4 */ ;
/*!50003 SET character_set_results = utf8mb4 */ ;
/*!50003 SET collation_connection  = utf8mb4_0900_ai_ci */ ;
/*!50003 SET @saved_sql_mode       = @@sql_mode */ ;
/*!50003 SET sql_mode              = 'ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION' */ ;
DELIMITER ;;
CREATE DEFINER=`root`@`localhost` PROCEDURE `GenerateOpenTicketReport`()
BEGIN
    DECLARE done INT DEFAULT FALSE;
    DECLARE v_id INT;
    DECLARE v_subject VARCHAR(150);
    DECLARE ticket_cursor CURSOR FOR SELECT ticket_id, subject FROM Tickets WHERE status = 'Open';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;

    OPEN ticket_cursor;
    read_loop: LOOP
        FETCH ticket_cursor INTO v_id, v_subject;
        IF done THEN
            LEAVE read_loop;
        END IF;
        SELECT CONCAT('Report: Ticket ID ', v_id, ' - ', v_subject) AS Daily_Report;
    END LOOP;
    CLOSE ticket_cursor;
END ;;
DELIMITER ;
/*!50003 SET sql_mode              = @saved_sql_mode */ ;
/*!50003 SET character_set_client  = @saved_cs_client */ ;
/*!50003 SET character_set_results = @saved_cs_results */ ;
/*!50003 SET collation_connection  = @saved_col_connection */ ;

--
-- Final view structure for view `agent_dashboard`
--

/*!50001 DROP VIEW IF EXISTS `agent_dashboard`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `agent_dashboard` AS select `t`.`ticket_id` AS `ticket_id`,`t`.`subject` AS `subject`,`t`.`priority` AS `priority`,`t`.`status` AS `status`,`c`.`username` AS `Customer_Name` from (`tickets` `t` join `users` `c` on((`t`.`user_id` = `c`.`user_id`))) where (`t`.`priority` in ('High','Critical')) */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `ai_performance_summary`
--

/*!50001 DROP VIEW IF EXISTS `ai_performance_summary`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `ai_performance_summary` AS select `c`.`category_name` AS `category_name`,avg(`ai`.`confidence_score`) AS `Avg_Confidence`,count(`t`.`ticket_id`) AS `Tickets_Analyzed` from ((`categories` `c` join `tickets` `t` on((`c`.`categories_id` = `t`.`categories_id`))) join `ai_analysis` `ai` on((`t`.`ticket_id` = `ai`.`ticket_id`))) group by `c`.`category_name` */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;

--
-- Final view structure for view `closed_tickets_archive`
--

/*!50001 DROP VIEW IF EXISTS `closed_tickets_archive`*/;
/*!50001 SET @saved_cs_client          = @@character_set_client */;
/*!50001 SET @saved_cs_results         = @@character_set_results */;
/*!50001 SET @saved_col_connection     = @@collation_connection */;
/*!50001 SET character_set_client      = utf8mb4 */;
/*!50001 SET character_set_results     = utf8mb4 */;
/*!50001 SET collation_connection      = utf8mb4_0900_ai_ci */;
/*!50001 CREATE ALGORITHM=UNDEFINED */
/*!50013 DEFINER=`root`@`localhost` SQL SECURITY DEFINER */
/*!50001 VIEW `closed_tickets_archive` AS select `tickets`.`ticket_id` AS `ticket_id`,`tickets`.`subject` AS `subject`,`tickets`.`priority` AS `priority`,`tickets`.`updated_at` AS `closed_date` from `tickets` where (`tickets`.`status` = 'Closed') */;
/*!50001 SET character_set_client      = @saved_cs_client */;
/*!50001 SET character_set_results     = @saved_cs_results */;
/*!50001 SET collation_connection      = @saved_col_connection */;
SET @@SESSION.SQL_LOG_BIN = @MYSQLDUMP_TEMP_LOG_BIN;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-03-20  6:26:42
