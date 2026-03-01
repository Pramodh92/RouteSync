import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRouter from './routes/auth.js';
import flightsRouter from './routes/flights.js';
import hotelsRouter from './routes/hotels.js';
import trainsRouter from './routes/trains.js';
import busesRouter from './routes/buses.js';
import cabsRouter from './routes/cabs.js';
import holidaysRouter from './routes/holidays.js';
import bookingsRouter from './routes/bookings.js';
import offersRouter from './routes/offers.js';
import usersRouter from './routes/users.js';
import aiRouter from './routes/ai.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));
app.use(express.json());

// ─── Request Logger (dev only) ─────────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
        next();
    });
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        service: 'RouteSync API',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
    });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/flights', flightsRouter);
app.use('/api/hotels', hotelsRouter);
app.use('/api/trains', trainsRouter);
app.use('/api/buses', busesRouter);
app.use('/api/cabs', cabsRouter);
app.use('/api/holidays', holidaysRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/offers', offersRouter);
app.use('/api/users', usersRouter);
app.use('/api/ai', aiRouter);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
    console.error('[ERROR]', err.message);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 RouteSync API running at http://localhost:${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health\n`);
});
