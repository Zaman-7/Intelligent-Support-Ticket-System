const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Add/Edit/Delete Categories
router.post('/categories', async (req, res) => {
    const { category_name, description } = req.body;
    try {
        await db.query('INSERT INTO Categories (category_name, description) VALUES (?, ?)', [category_name, description]);
        res.json({ message: 'Category added' });
    } catch(err) {
        res.status(500).json({ message: 'Error adding category' });
    }
});

router.delete('/categories/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Categories WHERE categories_id = ?', [req.params.id]);
        res.json({ message: 'Category deleted' });
    } catch(err) {
        res.status(500).json({ message: 'Error deleting' });
    }
});

router.get('/agents', async (req, res) => {
    try {
        const [agents] = await db.query('SELECT user_id, username, email FROM Users WHERE role="Agent"');
        res.json(agents);
    } catch(err) {
        res.status(500).json({ message: 'Error fetching agents' });
    }
});

router.post('/agents', async (req, res) => {
    const { username, email } = req.body;
    try {
        const [existing] = await db.query('SELECT user_id FROM Users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        await db.query('INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)', [username, email, 'hashedpassword', 'Agent']);
        res.status(201).json({ message: 'Agent added successfully' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding agent' });
    }
});

router.delete('/agents/:id', async (req, res) => {
    try {
        await db.query('DELETE FROM Users WHERE user_id = ? AND role="Agent"', [req.params.id]);
        res.json({ message: 'Agent deleted successfully' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Error deleting agent' });
    }
});

// Resolution Queue - Only resolved tickets
router.get('/resolved-tickets', async (req, res) => {
    try {
        const [tickets] = await db.query(`
            SELECT t.*, u.username as customer_name, c.category_name 
            FROM Tickets t 
            JOIN Users u ON t.user_id = u.user_id 
            JOIN Categories c ON t.categories_id = c.categories_id
            WHERE t.status = 'Resolved'
        `);
        res.json(tickets);
    } catch(err) {
        res.status(500).json({ message: 'Error fetching resolved tickets' });
    }
});

// Final Closure
router.put('/tickets/:id/close', async (req, res) => {
    try {
        await db.query('UPDATE Tickets SET status="Closed" WHERE ticket_id=?', [req.params.id]);
        res.json({ message: 'Ticket closed completely' });
    } catch(err) {
        res.status(500).json({ message: 'Error closing ticket' });
    }
});

// View all active issues
router.get('/active-tickets', async (req, res) => {
    try {
        const [tickets] = await db.query(`
            SELECT t.*, u.username as customer_name, c.category_name, ag.username as agent_name
            FROM Tickets t 
            JOIN Users u ON t.user_id = u.user_id 
            JOIN Categories c ON t.categories_id = c.categories_id
            LEFT JOIN Users ag ON t.assigned_agent_id = ag.user_id
            WHERE t.status IN ('Open', 'In Progress')
            ORDER BY t.created_at DESC
        `);
        res.json(tickets);
    } catch(err) {
        res.status(500).json({ message: 'Error fetching active tickets' });
    }
});

// Assign ticket
router.put('/tickets/:id/assign', async (req, res) => {
    const { agent_id } = req.body;
    try {
        await db.query('UPDATE Tickets SET assigned_agent_id=?, status="In Progress" WHERE ticket_id=?', [agent_id || null, req.params.id]);
        res.json({ message: 'Ticket assigned successfully' });
    } catch(err) {
        res.status(500).json({ message: 'Error assigning ticket' });
    }
});

// Dashboard Analytics
router.get('/analytics', async (req, res) => {
    try {
        const [totalClosedObj] = await db.query('SELECT COUNT(*) as total FROM Tickets WHERE status="Closed"');
        const totalClosed = totalClosedObj[0].total;

        const [leaderboard] = await db.query(`
            SELECT u.username, COUNT(t.ticket_id) as resolved_count
            FROM Users u
            LEFT JOIN Tickets t ON t.assigned_agent_id = u.user_id AND t.status IN ('Resolved', 'Closed')
            WHERE u.role = 'Agent'
            GROUP BY u.user_id
        `);

        const [aiAccObj] = await db.query('SELECT AVG(confidence_score) as avg_confidence FROM AI_Analysis');
        const avg_confidence = aiAccObj[0].avg_confidence;

        res.json({ totalClosed, leaderboard, avg_confidence });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
});

// God View Archive - All tickets
router.get('/tickets/all', async (req, res) => {
    try {
        const [tickets] = await db.query(`
            SELECT t.*, 
                   c.category_name, 
                   u.username AS customer_name, 
                   a.username AS agent_name
            FROM Tickets t
            JOIN Categories c ON t.categories_id = c.categories_id
            JOIN Users u ON t.user_id = u.user_id
            LEFT JOIN Users a ON t.assigned_agent_id = a.user_id
            ORDER BY t.created_at DESC
        `);
        res.json(tickets);
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching all tickets' });
    }
});

// SLA Extension Approval
router.put('/tickets/:ticketId/approve-sla', async (req, res) => {
    try {
        await db.query('UPDATE Tickets SET sla_extension_status = "Approved", sla_due_date = DATE_ADD(sla_due_date, INTERVAL 24 HOUR) WHERE ticket_id = ?', [req.params.ticketId]);
        res.json({ message: 'SLA Extension approved' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Error approving SLA extension' });
    }
});

// SLA Extension Denial
router.put('/tickets/:ticketId/deny-sla', async (req, res) => {
    try {
        await db.query('UPDATE Tickets SET sla_extension_status = "Denied" WHERE ticket_id = ?', [req.params.ticketId]);
        res.json({ message: 'SLA Extension denied' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Error denying SLA extension' });
    }
});

module.exports = router;
