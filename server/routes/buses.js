import { Router } from 'express';
import { buses } from '../data/store.js';

const router = Router();

// GET /api/buses  — query: from, to, type, minPrice, maxPrice
router.get('/', (req, res) => {
    let results = [...buses];
    const { from, to, type, minPrice, maxPrice } = req.query;
    if (from) results = results.filter(b => b.from.toLowerCase().includes(from.toLowerCase()));
    if (to) results = results.filter(b => b.to.toLowerCase().includes(to.toLowerCase()));
    if (type) results = results.filter(b => b.type.toLowerCase().includes(type.toLowerCase()));
    if (minPrice) results = results.filter(b => b.price >= Number(minPrice));
    if (maxPrice) results = results.filter(b => b.price <= Number(maxPrice));
    res.json({ success: true, count: results.length, data: results });
});

// GET /api/buses/:id
router.get('/:id', (req, res) => {
    const bus = buses.find(b => b.id === req.params.id);
    if (!bus) return res.status(404).json({ success: false, message: 'Bus not found' });
    res.json({ success: true, data: bus });
});

export default router;
