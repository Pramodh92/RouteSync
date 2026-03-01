import { Router } from 'express';
import { cabs } from '../data/store.js';

const router = Router();

// GET /api/cabs  — query: type, maxPrice
router.get('/', (req, res) => {
    let results = [...cabs];
    const { type, maxPrice } = req.query;
    if (type) results = results.filter(c => c.type.toLowerCase() === type.toLowerCase());
    if (maxPrice) results = results.filter(c => c.basePrice <= Number(maxPrice));
    res.json({ success: true, count: results.length, data: results });
});

// GET /api/cabs/:id
router.get('/:id', (req, res) => {
    const cab = cabs.find(c => c.id === req.params.id);
    if (!cab) return res.status(404).json({ success: false, message: 'Cab not found' });
    res.json({ success: true, data: cab });
});

export default router;
