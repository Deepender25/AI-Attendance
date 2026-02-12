import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './ui/GlassCard';
import {
    User,
    Moon,
    Sun,
    LogOut,
    Mail,
    Shield,
    X,
    Settings as SettingsIcon,
    ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';
    const navigate = useNavigate();

    const handleClose = () => {
        onClose();
    };

    const navigateToSettings = () => {
        onClose();
        navigate('/settings');
    };

    const navigateToLogin = () => {
        logout();
        navigate('/login');
    }

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="fixed inset-0 bg-transparent z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="fixed bottom-20 left-4 z-[101] w-72"
                    >
                        <GlassCard className="overflow-hidden shadow-2xl ring-1 ring-white/10 backdrop-blur-3xl" noPadding>
                            {/* Compact Header */}
                            <div className="p-4 flex items-center gap-3 border-b border-white/5 bg-gradient-to-r from-primary/10 to-transparent">
                                <div className="w-12 h-12 rounded-full bg-surface border-2 border-surface shadow-md flex items-center justify-center text-primary shrink-0">
                                    <User className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-text truncate text-sm">{user?.name}</h3>
                                    <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
                                </div>
                            </div>

                            {/* Menu */}
                            <div className="p-2 space-y-1">
                                <button
                                    onClick={navigateToSettings}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-zinc-400 hover:text-text hover:bg-white/5 transition-colors group"
                                >
                                    <div className="p-1.5 rounded-md bg-white/5 group-hover:bg-primary/20 group-hover:text-primary transition-colors">
                                        <SettingsIcon className="w-4 h-4" />
                                    </div>
                                    <span>Settings</span>
                                    <ChevronRight className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>

                                <div className="h-px bg-white/5 my-1 mx-2" />

                                <div className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors">
                                    <div className="flex items-center gap-3 text-sm text-zinc-400">
                                        <div className="p-1.5 rounded-md bg-white/5">
                                            {isDark ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
                                        </div>
                                        <span>Dark Mode</span>
                                    </div>
                                    <button
                                        onClick={toggleTheme}
                                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${isDark ? 'bg-primary' : 'bg-zinc-600'}`}
                                    >
                                        <span className={`inline-block h-4 w-4 transform rounded-full shadow-sm transition-transform ${isDark ? 'translate-x-6 bg-black' : 'translate-x-1 bg-white'}`} />
                                    </button>
                                </div>

                                <div className="h-px bg-white/5 my-1 mx-2" />

                                <button
                                    onClick={navigateToLogin}
                                    className="w-full flex items-center gap-3 p-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                                >
                                    <div className="p-1.5 rounded-md bg-red-500/10">
                                        <LogOut className="w-4 h-4" />
                                    </div>
                                    <span>Sign Out</span>
                                </button>
                            </div>
                        </GlassCard>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
