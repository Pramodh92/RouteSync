import React, { createContext, useContext, useState } from 'react';

const BookingContext = createContext(null);

export function useBooking() {
    return useContext(BookingContext);
}

function generateId(prefix = 'BK') {
    return `${prefix}${Date.now().toString(36).toUpperCase()}`;
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

    const [bookings, setBookings] = useState(() => {
        try {
            const stored = localStorage.getItem('routesync_bookings');
            return stored ? JSON.parse(stored) : [];
        } catch { return []; }
    });

    const saveBookings = (updated) => {
        setBookings(updated);
        try { localStorage.setItem('routesync_bookings', JSON.stringify(updated)); } catch { }
    };

    const updateSearch = (data) => {
        setSearchData(prev => ({ ...prev, ...data }));
    };

    const startBooking = (item, type) => {
        setCart({ item, type, addOns: [], totalPrice: item.price || 0 });
    };

    const updateCart = (updates) => {
        setCart(prev => prev ? { ...prev, ...updates } : prev);
    };

    const confirmBooking = (passengers, paymentInfo) => {
        const booking = {
            id: generateId('BK'),
            pnr: generatePNR(),
            type: cart?.type || 'flights',
            item: cart?.item,
            passengers,
            paymentInfo,
            totalAmount: cart?.totalPrice || cart?.item?.price || 0,
            addOns: cart?.addOns || [],
            status: 'confirmed',
            createdAt: new Date().toISOString(),
        };
        const updated = [...bookings, booking];
        saveBookings(updated);
        setCart(null);
        return booking;
    };

    const cancelBooking = (bookingId) => {
        const updated = bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled' } : b);
        saveBookings(updated);
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
