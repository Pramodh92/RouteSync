import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, getToken } from '../services/api.js';

const BookingContext = createContext(null);

export function useBooking() {
    return useContext(BookingContext);
}

function generatePNR() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export function BookingProvider({ children }) {
    const [searchData, setSearchData] = useState({
        from: '', to: '', departureDate: '', returnDate: '',
        passengers: { adults: 1, children: 0, infants: 0 },
        class: 'Economy', tripType: 'one-way',
    });

    const [cart, setCart] = useState(null);

    // Bookings: load from API if logged in, else from localStorage
    const [bookings, setBookings] = useState(() => {
        try {
            const stored = localStorage.getItem('routesync_bookings');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });

    // Sync bookings from API whenever a token is available
    useEffect(() => {
        if (getToken()) {
            api.bookings.list()
                .then(res => {
                    // Map API response fields to match existing UI shape
                    const mapped = res.data.map(b => ({
                        id: b.reference || b.id,
                        pnr: b.reference || b.id,
                        type: b.type,
                        item: b.details || {},
                        passengers: b.passengers || [],
                        totalAmount: b.totalAmount,
                        status: b.status,
                        createdAt: b.bookedAt,
                    }));
                    setBookings(mapped);
                    localStorage.setItem('routesync_bookings', JSON.stringify(mapped));
                })
                .catch(() => { /* keep localStorage fallback */ });
        }
    }, []);

    const updateSearch = (data) => setSearchData(prev => ({ ...prev, ...data }));
    const startBooking = (item, type) => setCart({ item, type, addOns: [], totalPrice: item.price || 0 });
    const updateCart = (updates) => setCart(prev => prev ? { ...prev, ...updates } : prev);

    const confirmBooking = async (passengers, paymentInfo) => {
        const totalAmount = cart?.totalPrice || cart?.item?.price || 0;
        const type = cart?.type?.replace(/s$/, '') || 'flight'; // 'flights' → 'flight'

        // ─── Call API if logged in ───────────────────────────────────────────
        let apiBooking = null;
        if (getToken()) {
            try {
                const res = await api.bookings.create({
                    type,
                    itemId: cart?.item?.id || null,
                    details: cart?.item || {},
                    passengers,
                    totalAmount,
                    paymentMethod: paymentInfo?.method || 'card',
                });
                apiBooking = res.data;
            } catch { /* fall through to local */ }
        }

        // ─── Local booking (UI state) ─────────────────────────────────────────
        const booking = {
            id: apiBooking?.reference || `BK${Date.now().toString(36).toUpperCase()}`,
            pnr: apiBooking?.reference || generatePNR(),
            type: cart?.type || 'flights',
            item: cart?.item,
            passengers,
            paymentInfo,
            totalAmount,
            addOns: cart?.addOns || [],
            status: 'confirmed',
            createdAt: apiBooking?.bookedAt || new Date().toISOString(),
        };

        const updated = [...bookings, booking];
        setBookings(updated);
        try { localStorage.setItem('routesync_bookings', JSON.stringify(updated)); } catch { }
        setCart(null);
        return booking;
    };

    const cancelBooking = async (bookingId) => {
        // Optimistic update
        const updated = bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b);
        setBookings(updated);
        try { localStorage.setItem('routesync_bookings', JSON.stringify(updated)); } catch { }

        // API cancel (best-effort)
        if (getToken()) {
            try { await api.bookings.cancel(bookingId); } catch { }
        }
    };

    return (
        <BookingContext.Provider value={{
            searchData, updateSearch,
            cart, startBooking, updateCart,
            bookings, confirmBooking, cancelBooking,
        }}>
            {children}
        </BookingContext.Provider>
    );
}
