import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { ScheduleItem, AttendanceRecord } from '../types';

interface User {
    id: string;
    email: string;
    name: string;
    role?: string;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (name: string, email: string, password: string, otp: string) => Promise<void>;
    sendOTP: (email: string) => Promise<void>;
    isAuthenticated: boolean;
    loading: boolean;
    // Data Management
    schedule: ScheduleItem[];
    records: AttendanceRecord[];
    updateSchedule: (newSchedule: ScheduleItem[]) => Promise<void>;
    updateRecords: (newRecords: AttendanceRecord[]) => Promise<void>;
    refreshData: () => Promise<void>;
    isDataLoading: boolean;
    updatePassword: (oldPw: string, newPw: string) => Promise<void>;
    updateProfile: (name: string) => Promise<void>;
    requestEmailUpdate: (newEmail: string) => Promise<void>;
    verifyEmailUpdate: (otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Data State
    const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [isDataLoading, setIsDataLoading] = useState(false);

    // Initial Session Load
    useEffect(() => {
        const stored = localStorage.getItem('attendai_user');
        if (stored) {
            try {
                setUser(JSON.parse(stored));
            } catch (e) {
                console.error('Failed to parse user from storage');
                localStorage.removeItem('attendai_user');
            }
        }
        setLoading(false);
    }, []);

    // Fetch Data when User changes
    const fetchData = useCallback(async () => {
        if (!user) {
            setSchedule([]);
            setRecords([]);
            return;
        }

        setIsDataLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL}/api/data/${user.id}`);
            const data = await res.json();
            setSchedule(data.schedule || []);
            setRecords(data.records || []);
        } catch (err) {
            console.error("Failed to load data", err);
        } finally {
            setIsDataLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const saveData = async (newSchedule: ScheduleItem[], newRecords: AttendanceRecord[]) => {
        if (!user) return;
        try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/data/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ schedule: newSchedule, records: newRecords }),
            });
        } catch (err) {
            console.error("Failed to save data", err);
            // Optionally revert state here if strict consistency is needed
        }
    };

    const updateSchedule = async (newSchedule: ScheduleItem[]) => {
        setSchedule(newSchedule);
        await saveData(newSchedule, records);
    };

    const updateRecords = async (newRecords: AttendanceRecord[]) => {
        setRecords(newRecords);
        await saveData(schedule, newRecords);
    };

    const login = async (email: string, password: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Login failed');
            }

            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('attendai_user', JSON.stringify(data.user));
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const sendOTP = async (email: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/send-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send OTP');
            }
        } catch (error) {
            console.error('Send OTP error:', error);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string, otp: string) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password, otp }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Registration failed');
            }

            const data = await response.json();
            setUser(data.user);
            localStorage.setItem('attendai_user', JSON.stringify(data.user));
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    };

    const logout = () => {
        setUser(null);
        setSchedule([]);
        setRecords([]);
        localStorage.removeItem('attendai_user');
    };

    const updatePassword = async (oldPassword: string, newPassword: string) => {
        if (!user) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/update-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, oldPassword, newPassword }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update password');
            }
        } catch (error) {
            console.error('Update password error:', error);
            throw error;
        }
    };

    const updateProfile = async (name: string) => {
        if (!user) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/update-profile`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, name }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to update profile');
            }

            const data = await response.json();
            const updatedUser = { ...user, ...data.user };
            setUser(updatedUser);
            localStorage.setItem('attendai_user', JSON.stringify(updatedUser));
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    };

    const requestEmailUpdate = async (newEmail: string) => {
        if (!user) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/request-email-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, newEmail }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to request email update');
            }
        } catch (error) {
            console.error('Request email update error:', error);
            throw error;
        }
    };

    const verifyEmailUpdate = async (otp: string) => {
        if (!user) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email-update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, otp }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to verify email update');
            }

            const data = await response.json();
            const updatedUser = { ...user, ...data.user };
            setUser(updatedUser);
            localStorage.setItem('attendai_user', JSON.stringify(updatedUser)); // Update local storage!
        } catch (error) {
            console.error('Verify email update error:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            logout,
            register,
            sendOTP,
            isAuthenticated: !!user,
            loading,
            // Data Exports
            schedule,
            records,
            updateSchedule,
            updateRecords,
            refreshData: fetchData,
            isDataLoading,
            updatePassword,
            updateProfile,
            requestEmailUpdate,
            verifyEmailUpdate
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
