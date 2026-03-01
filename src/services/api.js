/**
 * src/services/api.js
 * Central API service — all backend calls go through here.
 * Base URL: http://localhost:3001 (dev) — set VITE_API_URL in .env to override.
 */

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─── Token helpers ─────────────────────────────────────────────────────────────
export const getToken = () => localStorage.getItem('routesync_token');
export const setToken = (t) => localStorage.setItem('routesync_token', t);
export const clearToken = () => localStorage.removeItem('routesync_token');

// ─── Core fetch wrapper ────────────────────────────────────────────────────────
async function request(path, options = {}) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json', ...options.headers };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE}${path}`, { ...options, headers });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json;
}

// ─── Auth ──────────────────────────────────────────────────────────────────────
export const api = {
    auth: {
        login: (email, password) => request('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
        register: (name, email, password, phone) => request('/api/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password, phone }) }),
        me: () => request('/api/auth/me'),
    },

    // ─── Users ─────────────────────────────────────────────────────────────────
    users: {
        profile: () => request('/api/users/profile'),
        updateProfile: (data) => request('/api/users/profile', { method: 'PATCH', body: JSON.stringify(data) }),
        wallet: () => request('/api/users/wallet'),
        addToWallet: (amount) => request('/api/users/wallet/add', { method: 'POST', body: JSON.stringify({ amount }) }),
        passengers: () => request('/api/users/passengers'),
        addPassenger: (p) => request('/api/users/passengers', { method: 'POST', body: JSON.stringify(p) }),
        stats: () => request('/api/users/stats'),
    },

    // ─── Travel data ───────────────────────────────────────────────────────────
    flights: {
        list: (params = {}) => request(`/api/flights?${new URLSearchParams(params)}`),
        get: (id) => request(`/api/flights/${id}`),
    },
    hotels: {
        list: (params = {}) => request(`/api/hotels?${new URLSearchParams(params)}`),
        get: (id) => request(`/api/hotels/${id}`),
    },
    trains: {
        list: (params = {}) => request(`/api/trains?${new URLSearchParams(params)}`),
        get: (id) => request(`/api/trains/${id}`),
    },
    buses: {
        list: (params = {}) => request(`/api/buses?${new URLSearchParams(params)}`),
        get: (id) => request(`/api/buses/${id}`),
    },
    cabs: {
        list: (params = {}) => request(`/api/cabs?${new URLSearchParams(params)}`),
        get: (id) => request(`/api/cabs/${id}`),
    },
    holidays: {
        list: (params = {}) => request(`/api/holidays?${new URLSearchParams(params)}`),
        get: (id) => request(`/api/holidays/${id}`),
    },
    offers: {
        list: (params = {}) => request(`/api/offers?${new URLSearchParams(params)}`),
        validate: (code, amount, category) => request('/api/offers/validate', { method: 'POST', body: JSON.stringify({ code, amount, category }) }),
    },

    // ─── Bookings ──────────────────────────────────────────────────────────────
    bookings: {
        list: () => request('/api/bookings'),
        get: (id) => request(`/api/bookings/${id}`),
        create: (data) => request('/api/bookings', { method: 'POST', body: JSON.stringify(data) }),
        cancel: (id) => request(`/api/bookings/${id}`, { method: 'DELETE' }),
    },

    // ─── AI ────────────────────────────────────────────────────────────────────
    ai: {
        tripPlan: (data) => request('/api/ai/trip-plan', { method: 'POST', body: JSON.stringify(data) }),
        parseSearch: (query) => request('/api/ai/parse-search', { method: 'POST', body: JSON.stringify({ query }) }),
        farePredict: (data) => request('/api/ai/fare-predict', { method: 'POST', body: JSON.stringify(data) }),
        weather: (city) => request(`/api/ai/weather/${encodeURIComponent(city)}`),
        budget: (data) => request('/api/ai/budget', { method: 'POST', body: JSON.stringify(data) }),
        healthCheck: (data) => request('/api/ai/health-check', { method: 'POST', body: JSON.stringify(data) }),
        rebook: (data) => request('/api/ai/rebook', { method: 'POST', body: JSON.stringify(data) }),
        itinerary: (data) => request('/api/ai/itinerary', { method: 'POST', body: JSON.stringify(data) }),
        review: (data) => request('/api/ai/review', { method: 'POST', body: JSON.stringify(data) }),
        culture: (dest) => request(`/api/ai/culture/${encodeURIComponent(dest)}`),
        neighborhood: (hotelId) => request(`/api/ai/neighborhood/${hotelId}`),
        phrasebook: (dest) => request(`/api/ai/phrasebook/${encodeURIComponent(dest)}`),
        pulse: (dest) => request(`/api/ai/pulse/${encodeURIComponent(dest)}`),
        dna: (userId) => request('/api/ai/dna', { method: 'POST', body: JSON.stringify({ userId }) }),
        buddyRegister: (data) => request('/api/ai/buddies/register', { method: 'POST', body: JSON.stringify(data) }),
        buddyMatch: (data) => request('/api/ai/buddies/match', { method: 'POST', body: JSON.stringify(data) }),
        bestTime: (from, to) => request(`/api/ai/best-time/${encodeURIComponent(from)}/${encodeURIComponent(to)}`),
        mood: (mood) => request(`/api/ai/mood/${mood}`),
        groupPlan: (data) => request('/api/ai/group-plan', { method: 'POST', body: JSON.stringify(data) }),
    },
};

// ─── Chatbot SSE streaming helper ─────────────────────────────────────────────
export function chatStream({ messages, page, userBookings = [] }, onToken, onDone, onError) {
    const token = getToken();
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    fetch(`${BASE}/api/ai/chat`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ messages, page, userBookings }),
    }).then(async res => {
        if (!res.ok) { onError?.('Chat unavailable'); return; }
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(l => l.startsWith('data: '));
            for (const line of lines) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') { onDone?.(); return; }
                try {
                    const json = JSON.parse(data);
                    if (json.token) onToken(json.token);
                    if (json.error) onError?.(json.error);
                } catch { }
            }
        }
        onDone?.();
    }).catch(e => onError?.(e.message));
}
