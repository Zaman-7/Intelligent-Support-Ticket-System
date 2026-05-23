create table if not exists AI_Analysis
(
    analysis_id        int auto_increment
        primary key,
    ticket_id          int                                        not null,
    suggested_priority enum ('Low', 'Medium', 'High', 'Critical') null,
    confidence_score   float                                      null,
    reasoning          text                                       null,
    ai_draft_response  text                                       null,
    constraint ai_analysis_ibfk_1
        foreign key (ticket_id) references intelligent_system.Tickets (ticket_id)
            on delete cascade
);

create index ticket_id
    on AI_Analysis (ticket_id);

create table if not exists Categories
(
    categories_id int auto_increment
        primary key,
    category_name varchar(50) not null,
    description   text        null,
    constraint category_name
        unique (category_name)
);

create table if not exists Ticket_Status_Audit
(
    audit_id   int auto_increment
        primary key,
    ticket_id  int                                 null,
    old_status varchar(20)                         null,
    new_status varchar(20)                         null,
    changed_at timestamp default CURRENT_TIMESTAMP null
);

create table if not exists Ticket_Updates
(
    update_id   int auto_increment
        primary key,
    ticket_id   int                                  not null,
    user_id     int                                  not null,
    comments    text                                 not null,
    is_internal tinyint(1) default 0                 null,
    created_at  timestamp  default CURRENT_TIMESTAMP null,
    constraint ticket_updates_ibfk_1
        foreign key (ticket_id) references intelligent_system.Tickets (ticket_id)
            on delete cascade,
    constraint ticket_updates_ibfk_2
        foreign key (user_id) references intelligent_system.Users (user_id)
            on delete cascade
);

create index ticket_id
    on Ticket_Updates (ticket_id);

create index user_id
    on Ticket_Updates (user_id);

create definer = root@localhost trigger UpdateTicketTimestamp
    after insert
    on Ticket_Updates
    for each row
begin
    BEGIN
    UPDATE Tickets 
    SET updated_at = CURRENT_TIMESTAMP 
    WHERE ticket_id = NEW.ticket_id;
END
    end;

create table if not exists Tickets
(
    ticket_id         int auto_increment
        primary key,
    user_id           int                                                                          not null,
    categories_id     int                                                                          not null,
    assigned_agent_id int                                                                          null,
    subject           varchar(150)                                                                 not null,
    description       text                                                                         not null,
    status            enum ('Open', 'In Progress', 'Resolved', 'Closed') default 'Open'            null,
    priority          enum ('Low', 'Medium', 'High', 'Critical')         default 'Medium'          null,
    sla_due_date      timestamp                                                                    null,
    created_at        timestamp                                          default CURRENT_TIMESTAMP null,
    updated_at        timestamp                                          default CURRENT_TIMESTAMP null on update CURRENT_TIMESTAMP,
    constraint tickets_ibfk_1
        foreign key (user_id) references intelligent_system.Users (user_id)
            on delete cascade,
    constraint tickets_ibfk_2
        foreign key (categories_id) references intelligent_system.Categories (categories_id)
            on delete cascade,
    constraint tickets_ibfk_3
        foreign key (assigned_agent_id) references intelligent_system.Users (user_id)
            on delete set null,
    constraint chk_priority
        check (`priority` in (_utf8mb4\'Low\',_utf8mb4\'Medium\',_utf8mb4\'High\',_utf8mb4\'Critical\'))
);

create index assigned_agent_id
    on Tickets (assigned_agent_id);

create index categories_id
    on Tickets (categories_id);

create index user_id
    on Tickets (user_id);

create definer = root@localhost trigger LogStatusChange
    after update
    on Tickets
    for each row
begin
    BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO Ticket_Status_Audit (ticket_id, old_status, new_status)
        VALUES (OLD.ticket_id, OLD.status, NEW.status);
    END IF;
END
    end;

create table if not exists users
(
    user_id       int auto_increment
        primary key,
    username      varchar(50)                                                   not null,
    email         varchar(100)                                                  not null,
    password_hash varchar(255)                                                  not null,
    role          enum ('Customer', 'Agent', 'Admin') default 'Customer'        null,
    created_at    timestamp                           default CURRENT_TIMESTAMP null,
    constraint email
        unique (email),
    constraint unique_email
        unique (email)
);

create definer = root@localhost view agent_dashboard as
select `t`.`ticket_id` AS `ticket_id`,
       `t`.`subject`   AS `subject`,
       `t`.`priority`  AS `priority`,
       `t`.`status`    AS `status`,
       `c`.`username`  AS `Customer_Name`
from (`intelligent_system`.`tickets` `t` join `intelligent_system`.`users` `c` on ((`t`.`user_id` = `c`.`user_id`)))
where (`t`.`priority` in ('High', 'Critical'));

create definer = root@localhost view ai_performance_summary as
select `c`.`category_name`          AS `category_name`,
       avg(`ai`.`confidence_score`) AS `Avg_Confidence`,
       count(`t`.`ticket_id`)       AS `Tickets_Analyzed`
from ((`intelligent_system`.`categories` `c` join `intelligent_system`.`tickets` `t`
       on ((`c`.`categories_id` = `t`.`categories_id`))) join `intelligent_system`.`ai_analysis` `ai`
      on ((`t`.`ticket_id` = `ai`.`ticket_id`)))
group by `c`.`category_name`;

create definer = root@localhost view closed_tickets_archive as
select `intelligent_system`.`tickets`.`ticket_id`  AS `ticket_id`,
       `intelligent_system`.`tickets`.`subject`    AS `subject`,
       `intelligent_system`.`tickets`.`priority`   AS `priority`,
       `intelligent_system`.`tickets`.`updated_at` AS `closed_date`
from `intelligent_system`.`tickets`
where (`intelligent_system`.`tickets`.`status` = 'Closed');

create
    definer = root@localhost procedure CountInternalAgentNotes()
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
END;

create
    definer = root@localhost procedure FlagConfidenceAI()
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
END;

create
    definer = root@localhost procedure GenerateOpenTicketReport()
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
END;


