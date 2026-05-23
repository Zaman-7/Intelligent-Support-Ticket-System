require('dotenv').config();
const express = require('express');
const router = express.Router();
const db = require('../config/db');

const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.AIzaSyCWEtPlggqdrrtVz2clNzrh01wKdoCemj0 }); // Requires GEMINI_API_KEY in .env

// Create new ticket (Customer)
router.post('/', async (req, res) => {
    const { user_id, categories_id, subject, description } = req.body;

    let connection;
    try {
        connection = await db.getConnection();
        await connection.beginTransaction();

        const [userRows] = await connection.query('SELECT username FROM Users WHERE user_id = ?', [user_id]);
        const customerName = userRows[0] ? userRows[0].username : 'Customer';

        // 1. Call Gemini API for Triage
        const prompt = `You are an expert IT support triage agent. Analyze the following support ticket and provide a structured JSON response.
Ticket Subject: ${subject}
Ticket Description: ${description}

Return ONLY a valid JSON object with the exact following fields:
- "suggested_priority": Must be exactly one of "Low", "Medium", "High", "Critical".
- "confidence_score": A float between 0 and 100 representing your confidence in this classification.
- "reasoning": A brief text explaining why you assigned this priority.
- "ai_draft_response": An empathetic, professional draft response to the user acknowledging their issue.`;

        const aiResponse = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: `Customer Name: ${customerName}\nSubject: ${subject}\nDescription: ${description}\n\nCRITICAL INSTRUCTIONS FOR ai_draft_response: \n1. DO NOT output a "Subject:" line. \n2. Start the very first line exactly like this: "Dear ${customerName},"\n3. You MUST use double newlines (\\n\\n) to create proper paragraph breaks. \n4. NEVER use bracketed placeholders like [User Name]. \n5. Sign off as "IntelliDesk AI Support".`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        suggested_priority: { type: "STRING", enum: ["Low", "Medium", "High", "Critical"] },
                        confidence_score: { type: "NUMBER" },
                        reasoning: { type: "STRING" },
                        ai_draft_response: { type: "STRING" }
                    },
                    required: ["suggested_priority", "confidence_score", "reasoning", "ai_draft_response"]
                }
            }
        });

        const aiResult = JSON.parse(aiResponse.text);

        // --- START FOOLPROOF FIX ---
        let finalConfidence = aiResult.confidence_score;

        // If the AI stubbornly returns a decimal (like 0.92) instead of a percentage (92.0)
        if (finalConfidence <= 1.0 && finalConfidence > 0) {
            finalConfidence = finalConfidence * 100;
        }

        // Optional: Round it to one decimal place to keep your UI clean (e.g., 92.5)
        finalConfidence = Math.round(finalConfidence * 10) / 10;
        // --- END FOOLPROOF FIX ---

        // 2. Insert Ticket (Keeps your new sla_extension_status!)
        const [ticketResult] = await connection.query(
            'INSERT INTO Tickets (user_id, categories_id, subject, description, status, priority, sla_due_date, sla_extension_status) VALUES (?, ?, ?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR), "None")',
            [user_id, categories_id, subject, description, 'Open', aiResult.suggested_priority]
        );
        const ticketId = ticketResult.insertId;

        // 3. Insert AI Analysis (Uses the normalized finalConfidence!)
        await connection.query(
            'INSERT INTO Ai_Analysis (ticket_id, confidence_score, reasoning, ai_draft_response, suggested_priority) VALUES (?, ?, ?, ?, ?)',
            [ticketId, finalConfidence, aiResult.reasoning, aiResult.ai_draft_response, aiResult.suggested_priority]
        );

        // 4. Add automatic system welcome comment (Keeps your welcome message!)
        await connection.query(
            'INSERT INTO Ticket_Updates (ticket_id, user_id, comments, is_internal) VALUES (?, ?, ?, ?)',
            [ticketId, user_id, `System (AI Triage): ${aiResult.ai_draft_response}`, 0]
        );


        await connection.commit();
        res.status(201).json({ message: 'Ticket created', ticket_id: ticketId });
    } catch (err) {
        if (connection) await connection.rollback();
        console.error('Ticket Creation Error:', err);
        res.status(500).json({ message: 'Server error during ticket creation and triage' });
    } finally {
        if (connection) connection.release();
    }
});

// Get tickets for a specific user (Customer)
router.get('/user/:userId', async (req, res) => {
    try {
        const [tickets] = await db.query(
            `SELECT t.*, c.category_name 
             FROM Tickets t 
             JOIN Categories c ON t.categories_id = c.categories_id 
             WHERE t.user_id = ? 
             ORDER BY t.created_at DESC`,
            [req.params.userId]
        );
        res.json(tickets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get all Open and In Progress tickets (Agent Dashboard)
router.get('/active', async (req, res) => {
    try {
        const [tickets] = await db.query(
            `SELECT t.*, c.category_name, u.username as customer_name, a.confidence_score, a.reasoning
             FROM Tickets t 
             JOIN Categories c ON t.categories_id = c.categories_id
             JOIN Users u ON t.user_id = u.user_id
             LEFT JOIN AI_Analysis a ON t.ticket_id = a.ticket_id
             WHERE t.status IN ('Open', 'In Progress')
             ORDER BY t.priority DESC, t.sla_due_date ASC`
        );
        res.json(tickets);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get single ticket details
router.get('/:ticketId', async (req, res) => {
    try {
        const [tickets] = await db.query(
            `SELECT t.*, c.category_name, u.username as customer_name, a.confidence_score, a.reasoning, a.ai_draft_response, a.suggested_priority, ag.username as agent_name
             FROM Tickets t 
             JOIN Categories c ON t.categories_id = c.categories_id
             JOIN Users u ON t.user_id = u.user_id
             LEFT JOIN Users ag ON t.assigned_agent_id = ag.user_id
             LEFT JOIN AI_Analysis a ON t.ticket_id = a.ticket_id
             WHERE t.ticket_id = ?`,
            [req.params.ticketId]
        );

        if (tickets.length === 0) return res.status(404).json({ message: 'Ticket not found' });

        const [updates] = await db.query(
            `SELECT tu.*, u.username, u.role 
             FROM Ticket_Updates tu
             JOIN Users u ON tu.user_id = u.user_id
             WHERE tu.ticket_id = ?
             ORDER BY tu.created_at ASC`,
            [req.params.ticketId]
        );

        res.json({ ticket: tickets[0], updates });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Add update (reply or internal note)
// Assigned agent tracking
router.post('/:ticketId/updates', async (req, res) => {
    const { ticketId } = req.params;
    const { user_id, comments, is_internal, role } = req.body;
    try {
        if (role === 'Agent') {
            await db.query('UPDATE Tickets SET assigned_agent_id = ?, status="In Progress" WHERE ticket_id = ? AND assigned_agent_id IS NULL', [user_id, ticketId]);
        }
        await db.query(
            'INSERT INTO Ticket_Updates (ticket_id, user_id, comments, is_internal) VALUES (?, ?, ?, ?)',
            [ticketId, user_id, comments, is_internal ? 1 : 0]
        );
        res.status(201).json({ message: 'Update added' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update ticket status
router.put('/:ticketId/status', async (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body;
    try {
        // Validation check for Agent vs Admin resolve permissions logic natively tracked frontend mostly.
        await db.query('UPDATE Tickets SET status = ? WHERE ticket_id = ?', [status, ticketId]);
        res.json({ message: 'Ticket status updated' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Request SLA extension
router.put('/:ticketId/request-sla', async (req, res) => {
    const { ticketId } = req.params;
    try {
        await db.query('UPDATE Tickets SET sla_extension_status = "Requested" WHERE ticket_id = ?', [ticketId]);
        res.json({ message: 'SLA extension requested' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Generate contextual AI reply
router.post('/:ticketId/generate-reply', async (req, res) => {
    const { ticketId } = req.params;
    let connection;
    try {
        connection = await db.getConnection();

        const [tickets] = await connection.query('SELECT subject, description FROM Tickets WHERE ticket_id = ?', [ticketId]);
        if (tickets.length === 0) return res.status(404).json({ message: 'Ticket not found' });
        const ticket = tickets[0];

        const [updates] = await connection.query(
            `SELECT tu.comments, u.username, u.role 
             FROM Ticket_Updates tu
             JOIN Users u ON tu.user_id = u.user_id
             WHERE tu.ticket_id = ? AND tu.is_internal = 0
             ORDER BY tu.created_at ASC`,
            [ticketId]
        );

        let conversationHistory = `Ticket Subject: ${ticket.subject}\nTicket Description: ${ticket.description}\n\n`;
        if (updates.length > 0) {
            conversationHistory += "Conversation History:\n";
            updates.forEach(u => {
                const roleName = u.role === 'Agent' || u.role === 'Admin' ? 'Support Agent' : 'Customer';
                conversationHistory += `${roleName} (${u.username}): ${u.comments}\n\n`;
            });
        } else {
            conversationHistory += "No replies yet.\n\n";
        }

        const prompt = `${conversationHistory}
INSTRUCTIONS:
You are an IT Support Agent responding to the above ticket.
Write a plain-text contextual reply based on the latest messages.
Explicitly forbid the use of bracketed placeholders like [User Name] or [Agent Name].
Return ONLY a valid JSON object with a single "draft" field containing the reply text.
Return ONLY a valid JSON object with: 
- suggested_priority
- confidence_score (MUST be a number between 0 and 100 representing a percentage, e.g., 95.5. DO NOT use 0.0 to 1.0 probability decimals)
- reasoning
- ai_draft_response.`;

        const aiResponse = await ai.models.generateContent({
            model: 'gemini-3.1-pro-preview',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "OBJECT",
                    properties: {
                        draft: { type: "STRING" }
                    },
                    required: ["draft"]
                }
            }
        });

        const aiResult = JSON.parse(aiResponse.text);
        res.json({ draft: aiResult.draft });
    } catch (err) {
        console.error('Error generating AI reply:', err);
        res.status(500).json({ message: 'Server error generating reply' });
    } finally {
        if (connection) connection.release();
    }
});

module.exports = router;
