import { Router } from 'express';

const trains = [
    { id: 'TR001', name: 'Rajdhani Express', number: '12951', from: 'Mumbai Central', fromCode: 'MMCT', to: 'New Delhi', toCode: 'NDLS', departure: '17:00', arrival: '08:35+1', duration: '15h 35m', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], classes: [{ type: '1A', name: 'AC First Class', price: 4850, available: 8 }, { type: '2A', name: 'AC 2 Tier', price: 2850, available: 24 }, { type: '3A', name: 'AC 3 Tier', price: 1950, available: 48 }] },
    { id: 'TR002', name: 'Shatabdi Express', number: '12001', from: 'New Delhi', fromCode: 'NDLS', to: 'Bhopal', toCode: 'BPL', departure: '06:00', arrival: '13:45', duration: '7h 45m', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], classes: [{ type: 'CC', name: 'AC Chair Car', price: 1155, available: 120 }, { type: 'EC', name: 'Executive Chair Car', price: 2200, available: 56 }] },
    { id: 'TR003', name: 'Duronto Express', number: '12213', from: 'Mumbai LTT', fromCode: 'LTT', to: 'Patna', toCode: 'PNBE', departure: '23:00', arrival: '20:50+1', duration: '21h 50m', runningDays: ['Mon', 'Wed', 'Fri'], classes: [{ type: '1A', name: 'AC First Class', price: 5650, available: 4 }, { type: '2A', name: 'AC 2 Tier', price: 3200, available: 12 }, { type: '3A', name: 'AC 3 Tier', price: 2100, available: 36 }, { type: 'SL', name: 'Sleeper Class', price: 650, available: 180 }] },
    { id: 'TR004', name: 'Vande Bharat Express', number: '22436', from: 'New Delhi', fromCode: 'NDLS', to: 'Varanasi', toCode: 'BSB', departure: '06:00', arrival: '14:00', duration: '8h 00m', runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], classes: [{ type: 'CC', name: 'AC Chair Car', price: 1155, available: 200 }, { type: 'EC', name: 'Executive Class', price: 2150, available: 52 }] },
    { id: 'TR005', name: 'Kerala Express', number: '16345', from: 'Thiruvananthapuram', fromCode: 'TVC', to: 'New Delhi', toCode: 'NDLS', departure: '11:30', arrival: '06:30+2', duration: '43h 00m', runningDays: ['Mon', 'Thu'], classes: [{ type: '2A', name: 'AC 2 Tier', price: 3450, available: 18 }, { type: '3A', name: 'AC 3 Tier', price: 2250, available: 72 }, { type: 'SL', name: 'Sleeper', price: 780, available: 240 }] },
    { id: 'TR006', name: 'Garib Rath Express', number: '12203', from: 'Saharsa', fromCode: 'SHC', to: 'Amritsar', toCode: 'ASR', departure: '18:30', arrival: '22:00+1', duration: '27h 30m', runningDays: ['Tue', 'Fri'], classes: [{ type: '3A', name: 'AC 3 Tier (Budget)', price: 980, available: 100 }] },
];

const router = Router();

// GET /api/trains  — query: from, to, cls
router.get('/', (req, res) => {
    let results = [...trains];
    const { from, to, cls } = req.query;
    if (from) results = results.filter(t => t.from.toLowerCase().includes(from.toLowerCase()) || t.fromCode.toLowerCase() === from.toLowerCase());
    if (to) results = results.filter(t => t.to.toLowerCase().includes(to.toLowerCase()) || t.toCode.toLowerCase() === to.toLowerCase());
    if (cls) results = results.filter(t => t.classes.some(c => c.type === cls.toUpperCase()));
    res.json({ success: true, count: results.length, data: results });
});

// GET /api/trains/:id
router.get('/:id', (req, res) => {
    const train = trains.find(t => t.id === req.params.id);
    if (!train) return res.status(404).json({ success: false, message: 'Train not found' });
    res.json({ success: true, data: train });
});

export default router;
