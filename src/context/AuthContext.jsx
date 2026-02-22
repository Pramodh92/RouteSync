import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            const stored = localStorage.getItem('routesync_user');
            return stored ? JSON.parse(stored) : null;
        } catch { return null; }
    });

    const login = async (email, password) => {
        try {
            // 1. Check static data
            const res = await fetch('/data/users.json');
            const staticUsers = await res.json();

            // 2. Check local registered users
            const localUsers = JSON.parse(localStorage.getItem('routesync_local_users') || '[]');

            const allUsers = [...staticUsers, ...localUsers];
            const found = allUsers.find(u => u.email === email && u.password === password);

            if (found) {
                const { password: _, ...safe } = found;
                setUser(safe);
                localStorage.setItem('routesync_user', JSON.stringify(safe));
                return { success: true };
            }
            return { success: false, message: 'Invalid email or password. Demo: alice@routesync.com / alice123' };
        } catch (e) {
            return { success: false, message: 'Auth error. Please try again.' };
        }
    };

    const signup = async (name, email, password, phone) => {
        try {
            const newUser = {
                id: `u${Date.now()}`,
                name,
                email,
                password, // Store for login simulation
                phone: phone || '',
                avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=FF7A00&color=fff`,
                joinDate: new Date().toISOString().split('T')[0],
                walletBalance: 500,
                savedPassengers: [],
            };

            // Save to local registry
            const localUsers = JSON.parse(localStorage.getItem('routesync_local_users') || '[]');
            localUsers.push(newUser);
            localStorage.setItem('routesync_local_users', JSON.stringify(localUsers));

            // Set current session
            const { password: _, ...safe } = newUser;
            setUser(safe);
            localStorage.setItem('routesync_user', JSON.stringify(safe));
            return { success: true };
        } catch (e) {
            return { success: false, message: 'Registration failed.' };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('routesync_user');
    };

    const updateProfile = (updatedFields) => {
        if (!user) return;
        const updated = { ...user, ...updatedFields };
        setUser(updated);
        localStorage.setItem('routesync_user', JSON.stringify(updated));
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
