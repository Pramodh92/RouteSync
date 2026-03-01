/**
 * src/context/AIContext.jsx
 * Shared AI state: wishlist, price alerts, chat history, DNA profile, mood.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const AIContext = createContext(null);
export const useAI = () => useContext(AIContext);

export function AIProvider({ children }) {
    const { user } = useAuth();

    // Wishlist — { id, type, price, name }
    const [wishlist, setWishlist] = useState(() => {
        try { return JSON.parse(localStorage.getItem('rs_wishlist') || '[]'); } catch { return []; }
    });

    // Price alerts — { id, type, name, targetPrice, currentPrice }
    const [priceAlerts, setPriceAlerts] = useState(() => {
        try { return JSON.parse(localStorage.getItem('rs_alerts') || '[]'); } catch { return []; }
    });

    // Chat history persisted across navigation
    const [chatHistory, setChatHistory] = useState([]);

    // Traveler DNA profile
    const [dnaProfile, setDnaProfile] = useState(null);

    // Active mood filter
    const [activeMood, setActiveMood] = useState(null);

    // Chatbot open state — global so any page can open it
    const [chatOpen, setChatOpen] = useState(false);

    // Rebook modal state
    const [rebookData, setRebookData] = useState(null);

    // Fetch DNA on login
    useEffect(() => {
        if (user?.id) {
            api.ai.dna(user.id).then(res => {
                if (res.data) setDnaProfile(res.data);
            }).catch(() => { });
        } else {
            setDnaProfile(null);
        }
    }, [user?.id]);

    // Wishlist helpers
    const addToWishlist = (item) => {
        setWishlist(prev => {
            const exists = prev.find(w => w.id === item.id && w.type === item.type);
            if (exists) return prev;
            const updated = [...prev, item];
            localStorage.setItem('rs_wishlist', JSON.stringify(updated));
            return updated;
        });
    };
    const removeFromWishlist = (id, type) => {
        setWishlist(prev => {
            const updated = prev.filter(w => !(w.id === id && w.type === type));
            localStorage.setItem('rs_wishlist', JSON.stringify(updated));
            return updated;
        });
    };
    const isWishlisted = (id, type) => wishlist.some(w => w.id === id && w.type === type);

    // Alert helpers
    const addPriceAlert = (item) => {
        setPriceAlerts(prev => {
            const exists = prev.find(a => a.id === item.id);
            if (exists) return prev;
            const updated = [...prev, { ...item, createdAt: new Date().toISOString() }];
            localStorage.setItem('rs_alerts', JSON.stringify(updated));
            return updated;
        });
    };
    const removePriceAlert = (id) => {
        setPriceAlerts(prev => {
            const updated = prev.filter(a => a.id !== id);
            localStorage.setItem('rs_alerts', JSON.stringify(updated));
            return updated;
        });
    };

    // Open chatbot and optionally inject a message
    const openChat = (prefilledMessage = null) => {
        if (prefilledMessage) {
            setChatHistory(prev => [...prev, { role: 'user', content: prefilledMessage }]);
        }
        setChatOpen(true);
    };

    return (
        <AIContext.Provider value={{
            wishlist, addToWishlist, removeFromWishlist, isWishlisted,
            priceAlerts, addPriceAlert, removePriceAlert,
            chatHistory, setChatHistory,
            chatOpen, setChatOpen, openChat,
            dnaProfile, setDnaProfile,
            activeMood, setActiveMood,
            rebookData, setRebookData,
        }}>
            {children}
        </AIContext.Provider>
    );
}
