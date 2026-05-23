const express = require('express');
const router = express.Router();
const db = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Middleware to verify JWT
const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

// Middleware to check Admin role
const adminMiddleware = (req, res, next) => {
    if (req.user && req.user.role === 'Admin') {
        next();
    } else {
        res.status(403).json({ message: 'Requires Admin role' });
    }
};

// Global Profile Editing
router.put('/profile', authMiddleware, async (req, res) => {
    const { username, email, password } = req.body;
    const userId = req.user.user_id;

    try {
        let query = 'UPDATE Users SET username = ?, email = ?';
        let params = [username, email];

        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            query += ', password_hash = ?';
            params.push(hashedPassword);
        }

        query += ' WHERE user_id = ?';
        params.push(userId);

        await db.query(query, params);
        
        // Fetch updated user to return (without password)
        const [users] = await db.query('SELECT user_id, username, email, role FROM Users WHERE user_id = ?', [userId]);
        
        res.json({ message: 'Profile updated successfully', user: users[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error updating profile' });
    }
});

// Get current profile
router.get('/profile', authMiddleware, async (req, res) => {
    const userId = req.user.user_id;
    try {
        const [users] = await db.query('SELECT user_id, username, email, role FROM Users WHERE user_id = ?', [userId]);
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching profile' });
    }
});

// Admin Agent Management
router.post('/agents', authMiddleware, adminMiddleware, async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const [existing] = await db.query('SELECT user_id FROM Users WHERE email = ?', [email]);
        if (existing.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query('INSERT INTO Users (username, email, password_hash, role) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, 'Agent']);
        res.status(201).json({ message: 'Agent added successfully' });
    } catch(err) {
        console.error(err);
        res.status(500).json({ message: 'Error adding agent' });
    }
});

module.exports = router;
