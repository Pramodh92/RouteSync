import { Router } from 'express';
import { users, bookings } from '../data/store.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// GET /api/users/profile
router.get('/profile', (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const { password: _, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
});

// PATCH /api/users/profile
router.patch('/profile', (req, res) => {
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
    const allowed = ['name', 'phone', 'avatar'];
    allowed.forEach(k => { if (req.body[k] !== undefined) users[idx][k] = req.body[k]; });
    const { password: _, ...safeUser } = users[idx];
    res.json({ success: true, message: 'Profile updated', data: safeUser });
});

// GET /api/users/wallet
router.get('/wallet', (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: { walletBalance: user.walletBalance } });
});

// POST /api/users/wallet/add
router.post('/wallet/add', (req, res) => {
    const { amount } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ success: false, message: 'Valid amount required' });
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
    users[idx].walletBalance += Number(amount);
    res.json({ success: true, message: `₹${amount} added to wallet`, data: { walletBalance: users[idx].walletBalance } });
});

// GET /api/users/passengers
router.get('/passengers', (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user.savedPassengers });
});

// POST /api/users/passengers
router.post('/passengers', (req, res) => {
    const { name, age, gender, relation } = req.body;
    if (!name || !age) return res.status(400).json({ success: false, message: 'name and age are required' });
    const idx = users.findIndex(u => u.id === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'User not found' });
    const passenger = { name, age: Number(age), gender: gender || '', relation: relation || '' };
    users[idx].savedPassengers.push(passenger);
    res.status(201).json({ success: true, message: 'Passenger saved', data: passenger });
});

// GET /api/users/stats
router.get('/stats', (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    const userBookings = bookings.filter(b => b.userId === req.user.id);
    const confirmed = userBookings.filter(b => b.status === 'confirmed');
    const totalSpent = confirmed.reduce((sum, b) => sum + b.totalAmount, 0);
    const byType = confirmed.reduce((acc, b) => { acc[b.type] = (acc[b.type] || 0) + 1; return acc; }, {});
    res.json({ success: true, data: { totalBookings: confirmed.length, cancelledBookings: userBookings.filter(b => b.status === 'cancelled').length, totalSpent, walletBalance: user.walletBalance, bookingsByType: byType } });
});

export default router;
