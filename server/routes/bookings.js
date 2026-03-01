import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { bookings, users } from '../data/store.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();
router.use(authenticate);

// POST /api/bookings
router.post('/', (req, res) => {
    const { type, itemId, details, passengers, totalAmount, paymentMethod, promoCode, discountAmount } = req.body;
    if (!type || !totalAmount)
        return res.status(400).json({ success: false, message: 'type and totalAmount are required' });

    const validTypes = ['flight', 'hotel', 'train', 'bus', 'cab', 'holiday'];
    if (!validTypes.includes(type))
        return res.status(400).json({ success: false, message: `type must be one of: ${validTypes.join(', ')}` });

    if (paymentMethod === 'wallet') {
        const userIdx = users.findIndex(u => u.id === req.user.id);
        if (userIdx === -1) return res.status(404).json({ success: false, message: 'User not found' });
        if (users[userIdx].walletBalance < totalAmount)
            return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
        users[userIdx].walletBalance -= totalAmount;
    }

    const prefix = { flight: 'FL', hotel: 'HT', train: 'TR', bus: 'BS', cab: 'CB', holiday: 'HL' }[type];
    const booking = {
        id: uuid(),
        reference: `RS-${prefix}-${Date.now().toString(36).toUpperCase()}`,
        userId: req.user.id,
        type, itemId: itemId || null,
        details: details || {},
        passengers: passengers || [],
        totalAmount, discountAmount: discountAmount || 0,
        promoCode: promoCode || null,
        paymentMethod: paymentMethod || 'card',
        status: 'confirmed',
        bookedAt: new Date().toISOString(),
    };
    bookings.push(booking);
    res.status(201).json({ success: true, message: 'Booking confirmed', data: booking });
});

// GET /api/bookings
router.get('/', (req, res) => {
    const userBookings = bookings
        .filter(b => b.userId === req.user.id)
        .sort((a, b) => new Date(b.bookedAt) - new Date(a.bookedAt));
    res.json({ success: true, count: userBookings.length, data: userBookings });
});

// GET /api/bookings/:id
router.get('/:id', (req, res) => {
    const booking = bookings.find(b => b.id === req.params.id && b.userId === req.user.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
});

// DELETE /api/bookings/:id — cancel + refund to wallet
router.delete('/:id', (req, res) => {
    const idx = bookings.findIndex(b => b.id === req.params.id && b.userId === req.user.id);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (bookings[idx].status === 'cancelled')
        return res.status(400).json({ success: false, message: 'Booking is already cancelled' });

    bookings[idx].status = 'cancelled';
    bookings[idx].cancelledAt = new Date().toISOString();

    const userIdx = users.findIndex(u => u.id === req.user.id);
    if (userIdx !== -1) users[userIdx].walletBalance += bookings[idx].totalAmount;

    res.json({ success: true, message: 'Booking cancelled. Refund credited to wallet.', data: bookings[idx] });
});

export default router;
