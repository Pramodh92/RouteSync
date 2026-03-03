import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import {
    putBooking,
    getBooking,
    getBookingsByUser,
    updateBookingStatus,
    getUserById,
    updateUser,
} from '../services/dynamo.js';

const router = Router();
router.use(authenticate);

// POST /api/bookings
router.post('/', async (req, res) => {
    try {
        const { type, itemId, details, passengers, totalAmount, paymentMethod, promoCode, discountAmount } = req.body;
        if (!type || !totalAmount)
            return res.status(400).json({ success: false, message: 'type and totalAmount are required' });

        const validTypes = ['flight', 'hotel', 'train', 'bus', 'cab', 'holiday'];
        if (!validTypes.includes(type))
            return res.status(400).json({ success: false, message: `type must be one of: ${validTypes.join(', ')}` });

        // Wallet deduction
        if (paymentMethod === 'wallet') {
            const user = await getUserById(req.user.id);
            if (!user) return res.status(404).json({ success: false, message: 'User not found' });
            if (user.walletBalance < totalAmount)
                return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
            await updateUser(req.user.id, { walletBalance: user.walletBalance - totalAmount });
        }

        const prefix = { flight: 'FL', hotel: 'HT', train: 'TR', bus: 'BS', cab: 'CB', holiday: 'HL' }[type];
        const booking = {
            bookingId: uuid(),
            reference: `RS-${prefix}-${Date.now().toString(36).toUpperCase()}`,
            userId: req.user.id,
            type,
            itemId: itemId || null,
            details: details || {},
            passengers: passengers || [],
            totalAmount,
            discountAmount: discountAmount || 0,
            promoCode: promoCode || null,
            paymentMethod: paymentMethod || 'card',
            status: 'confirmed',
            bookedAt: new Date().toISOString(),
        };

        await putBooking(booking);
        res.status(201).json({ success: true, message: 'Booking confirmed', data: booking });
    } catch (err) {
        console.error('[BOOKINGS] POST error:', err);
        res.status(500).json({ success: false, message: 'Failed to create booking' });
    }
});

// GET /api/bookings
router.get('/', async (req, res) => {
    try {
        const userBookings = await getBookingsByUser(req.user.id);
        res.json({ success: true, count: userBookings.length, data: userBookings });
    } catch (err) {
        console.error('[BOOKINGS] GET all error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch bookings' });
    }
});

// GET /api/bookings/:id
router.get('/:id', async (req, res) => {
    try {
        const booking = await getBooking(req.params.id, req.user.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        res.json({ success: true, data: booking });
    } catch (err) {
        console.error('[BOOKINGS] GET one error:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch booking' });
    }
});

// DELETE /api/bookings/:id — cancel + refund to wallet
router.delete('/:id', async (req, res) => {
    try {
        const booking = await getBooking(req.params.id, req.user.id);
        if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
        if (booking.status === 'cancelled')
            return res.status(400).json({ success: false, message: 'Booking is already cancelled' });

        await updateBookingStatus(booking.bookingId, req.user.id, 'cancelled', {
            cancelledAt: new Date().toISOString(),
        });

        // Refund to wallet
        const user = await getUserById(req.user.id);
        if (user) {
            await updateUser(req.user.id, { walletBalance: (user.walletBalance || 0) + booking.totalAmount });
        }

        res.json({ success: true, message: 'Booking cancelled. Refund credited to wallet.', data: { ...booking, status: 'cancelled' } });
    } catch (err) {
        console.error('[BOOKINGS] DELETE error:', err);
        res.status(500).json({ success: false, message: 'Failed to cancel booking' });
    }
});

export default router;
