import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { users } from '../data/store.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ success: false, message: 'Email and password are required' });

    const user = users.find(u => u.email === email && u.password === password);
    if (!user)
        return res.status(401).json({ success: false, message: 'Invalid email or password' });

    const { password: _, ...safeUser } = user;
    const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.json({ success: true, token, user: safeUser });
});

// POST /api/auth/register
router.post('/register', (req, res) => {
    const { name, email, password, phone } = req.body;
    if (!name || !email || !password)
        return res.status(400).json({ success: false, message: 'Name, email and password are required' });

    if (users.find(u => u.email === email))
        return res.status(409).json({ success: false, message: 'Email already registered' });

    const newUser = {
        id: `USR-${uuid().slice(0, 8).toUpperCase()}`,
        name, email, password,
        phone: phone || '',
        avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF7A00&color=fff`,
        joinDate: new Date().toISOString().split('T')[0],
        walletBalance: 500,
        savedPassengers: [],
    };
    users.push(newUser);

    const { password: _, ...safeUser } = newUser;
    const token = jwt.sign(
        { id: newUser.id, email: newUser.email, name: newUser.name },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    res.status(201).json({ success: true, token, user: safeUser });
});

// GET /api/auth/me
router.get('/me', authenticate, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
});

export default router;
