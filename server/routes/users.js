import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import {
    getUserById,
    updateUser,
    getBookingsByUser,
} from '../services/dynamo.js';

const router = Router();
router.use(authenticate);

// GET /api/users/profile
router.get('/profile', async (req, res) => {
    try {
        const user = await getUserById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const { password: _, ...safeUser } = user;
        res.json({ success: true, data: safeUser });
    } catch (err) {
        console.error('[USERS] GET profile error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch profile' });
    }
});

// PATCH /api/users/profile
router.patch('/profile', async (req, res) => {
    try {
        const user = await getUserById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const allowed = ['name', 'phone', 'avatar'];
        const updates = {};
        allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
        if (Object.keys(updates).length) await updateUser(req.user.id, updates);
        const updated = { ...user, ...updates };
        const { password: _, ...safeUser } = updated;
        res.json({ success: true, message: 'Profile updated', data: safeUser });
    } catch (err) {
        console.error('[USERS] PATCH profile error:', err);
        res.status(500).json({ success: false, message: 'Failed to update profile' });
    }
});

// GET /api/users/wallet
router.get('/wallet', async (req, res) => {
    try {
        const user = await getUserById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: { walletBalance: user.walletBalance || 0 } });
    } catch (err) {
        console.error('[USERS] GET wallet error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch wallet' });
    }
});

// POST /api/users/wallet/add
router.post('/wallet/add', async (req, res) => {
    try {
        const { amount } = req.body;
        if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid amount required' });
        const user = await getUserById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const newBalance = (user.walletBalance || 0) + Number(amount);
        await updateUser(req.user.id, { walletBalance: newBalance });
        res.json({ success: true, message: `₹${amount} added to wallet`, data: { walletBalance: newBalance } });
    } catch (err) {
        console.error('[USERS] POST wallet/add error:', err);
        res.status(500).json({ success: false, message: 'Failed to add to wallet' });
    }
});

// GET /api/users/passengers
router.get('/passengers', async (req, res) => {
    try {
        const user = await getUserById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user.savedPassengers || [] });
    } catch (err) {
        console.error('[USERS] GET passengers error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch passengers' });
    }
});

// POST /api/users/passengers
router.post('/passengers', async (req, res) => {
    try {
        const { name, age, gender, relation } = req.body;
        if (!name || !age) return res.status(400).json({ success: false, message: 'name and age are required' });
        const user = await getUserById(req.user.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const passenger = { name, age: Number(age), gender: gender || '', relation: relation || '' };
        const savedPassengers = [...(user.savedPassengers || []), passenger];
        await updateUser(req.user.id, { savedPassengers });
        res.status(201).json({ success: true, message: 'Passenger saved', data: passenger });
    } catch (err) {
        console.error('[USERS] POST passengers error:', err);
        res.status(500).json({ success: false, message: 'Failed to save passenger' });
    }
});

// GET /api/users/stats
router.get('/stats', async (req, res) => {
    try {
        const [user, allBookings] = await Promise.all([
            getUserById(req.user.id),
            getBookingsByUser(req.user.id),
        ]);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        const confirmed = allBookings.filter(b => b.status === 'confirmed');
        const totalSpent = confirmed.reduce((sum, b) => sum + b.totalAmount, 0);
        const byType = confirmed.reduce((acc, b) => { acc[b.type] = (acc[b.type] || 0) + 1; return acc; }, {});
        res.json({
            success: true,
            data: {
                totalBookings: confirmed.length,
                cancelledBookings: allBookings.filter(b => b.status === 'cancelled').length,
                totalSpent,
                walletBalance: user.walletBalance || 0,
                bookingsByType: byType,
            },
        });
    } catch (err) {
        console.error('[USERS] GET stats error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch stats' });
    }
});

export default router;
