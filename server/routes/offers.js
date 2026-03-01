import { Router } from 'express';
import { offers } from '../data/store.js';

const router = Router();

// GET /api/offers  — query: category
router.get('/', (req, res) => {
    const now = new Date().toISOString().split('T')[0];
    let results = offers.filter(o => o.validUntil >= now);
    const { category } = req.query;
    if (category) results = results.filter(o => o.category === category || o.category === 'all');
    res.json({ success: true, count: results.length, data: results });
});

// POST /api/offers/validate
router.post('/validate', (req, res) => {
    const { code, amount, category } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Promo code required' });

    const now = new Date().toISOString().split('T')[0];
    const offer = offers.find(o => o.code.toUpperCase() === code.toUpperCase() && o.validUntil >= now);
    if (!offer) return res.status(404).json({ success: false, message: 'Invalid or expired promo code' });

    if (category && offer.category !== 'all' && offer.category !== category)
        return res.status(400).json({ success: false, message: `This code is valid for ${offer.category} only` });

    if (amount && amount < offer.minAmount)
        return res.status(400).json({ success: false, message: `Minimum booking amount of ₹${offer.minAmount} required` });

    const discountAmount = offer.type === 'flat'
        ? offer.discount
        : Math.min((amount * offer.discount) / 100, offer.maxDiscount);

    res.json({ success: true, offer, discountAmount, finalAmount: amount ? amount - discountAmount : null });
});

// GET /api/offers/:id
router.get('/:id', (req, res) => {
    const offer = offers.find(o => o.id === req.params.id);
    if (!offer) return res.status(404).json({ success: false, message: 'Offer not found' });
    res.json({ success: true, data: offer });
});

export default router;
