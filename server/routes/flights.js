import { Router } from 'express';
import { flights } from '../data/store.js';

const router = Router();

// GET /api/flights  — query: from, to, date, class, stops, minPrice, maxPrice
router.get('/', (req, res) => {
    let results = [...flights];
    const { from, to, date, class: cls, stops, minPrice, maxPrice } = req.query;
    if (from) results = results.filter(f => f.from.toLowerCase().includes(from.toLowerCase()) || f.fromCode.toLowerCase() === from.toLowerCase());
    if (to) results = results.filter(f => f.to.toLowerCase().includes(to.toLowerCase()) || f.toCode.toLowerCase() === to.toLowerCase());
    if (date) results = results.filter(f => f.date === date);
    if (cls) results = results.filter(f => f.class.toLowerCase() === cls.toLowerCase());
    if (stops !== undefined) results = results.filter(f => f.stops === Number(stops));
    if (minPrice) results = results.filter(f => f.price >= Number(minPrice));
    if (maxPrice) results = results.filter(f => f.price <= Number(maxPrice));
    res.json({ success: true, count: results.length, data: results });
});

// GET /api/flights/:id
router.get('/:id', (req, res) => {
    const flight = flights.find(f => f.id === req.params.id);
    if (!flight) return res.status(404).json({ success: false, message: 'Flight not found' });
    res.json({ success: true, data: flight });
});

export default router;
