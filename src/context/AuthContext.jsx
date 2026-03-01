import React, { createContext, useContext, useState } from 'react';
import { api, setToken, clearToken, getToken } from '../services/api.js';

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
            const data = await api.auth.login(email, password);
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('routesync_user', JSON.stringify(data.user));
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message || 'Invalid email or password' };
        }
    };

    const signup = async (name, email, password, phone) => {
        try {
            const data = await api.auth.register(name, email, password, phone);
            setToken(data.token);
            setUser(data.user);
            localStorage.setItem('routesync_user', JSON.stringify(data.user));
            return { success: true };
        } catch (e) {
            return { success: false, message: e.message || 'Registration failed.' };
        }
    };

    const logout = () => {
        setUser(null);
        clearToken();
        localStorage.removeItem('routesync_user');
    };

    const updateProfile = async (updatedFields) => {
        try {
            const data = await api.users.updateProfile(updatedFields);
            setUser(data.data);
            localStorage.setItem('routesync_user', JSON.stringify(data.data));
        } catch {
            // fallback: update locally only
            if (!user) return;
            const updated = { ...user, ...updatedFields };
            setUser(updated);
            localStorage.setItem('routesync_user', JSON.stringify(updated));
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
}
