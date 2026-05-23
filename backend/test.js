const db = require('/Users/aleemulzaman/Documents/DBMS Project/backend/config/db');

async function test() {
    try {
        await db.query('DROP TRIGGER IF EXISTS AutoWelcomeComment;');
        await db.query(`
            CREATE TRIGGER AutoWelcomeComment
            AFTER INSERT ON Tickets
            FOR EACH ROW
            BEGIN
                INSERT INTO Ticket_Updates (ticket_id, user_id, comments, is_internal)
                VALUES (NEW.ticket_id, NEW.user_id, 'System: We have received your ticket and the AI is currently classifying it. An agent will be assigned shortly.', FALSE);
            END;
        `);
        console.log("Trigger fixed");
    } catch(err) {
        console.error("DB Error:", err);
    }
    process.exit(0);
}
test();
