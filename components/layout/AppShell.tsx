import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    User,
    PanelLeftOpen,
    MoreHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { TrafficLights } from '../ui/TrafficLights';
import { ProfileModal } from '../ProfileModal';
import { BottomNav } from './BottomNav';

interface AppShellProps {
    children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
    const [isSidebarVisible, setIsSidebarVisible] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

    const location = useLocation();
    const { user } = useAuth();

    const handleWindowAction = (action: 'close' | 'minimize' | 'maximize') => {
        if (action === 'close') setIsSidebarVisible(false);
        if (action === 'minimize') setIsSidebarCollapsed(!isSidebarCollapsed);
    };

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
        { icon: Calendar, label: 'Schedule', path: '/schedule' },
    ];

    return (
        <div className="h-screen w-screen bg-background text-text font-sans flex overflow-hidden transition-colors duration-300 relative">
            {/* Desktop Restore Button (Visible when Sidebar is Hidden) */}
            <AnimatePresence>
                {!isSidebarVisible && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={() => setIsSidebarVisible(true)}
                        className="hidden md:flex absolute top-4 left-4 z-50 p-2 bg-surface border border-border rounded-lg shadow-lg hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 hover:text-text transition-colors"
                        title="Show Sidebar"
                    >
                        <PanelLeftOpen size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Sidebar (Desktop Only) */}
            <AnimatePresence mode="wait">
                {isSidebarVisible && (
                    <motion.aside
                        layout
                        initial={{ x: -100, opacity: 0, width: 0, margin: 0 }}
                        animate={{
                            x: 0,
                            opacity: 1,
                            width: isSidebarCollapsed ? '5rem' : '16rem',
                            margin: '1rem 1rem 1rem 0'
                        }}
                        exit={{ x: -100, opacity: 0, width: 0, margin: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="hidden md:flex flex-col rounded-2xl bg-surface border border-border shadow-2xl z-20 shrink-0 overflow-hidden relative"
                    >
                        {/* Header with Traffic Lights */}
                        <div className={`p-6 flex items-center gap-4 ${isSidebarCollapsed ? 'justify-center px-4' : ''}`}>
                            <TrafficLights onAction={handleWindowAction} />
                        </div>

                        {/* Navigation */}
                        <nav className="flex-1 px-4 space-y-1 mt-2">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <Link
                                        key={item.path}
                                        to={item.path}
                                        className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-sm ${isActive
                                            ? 'bg-primary text-background font-medium shadow-md shadow-primary/10'
                                            : 'text-zinc-500 hover:text-text hover:bg-black/5 dark:hover:bg-white/5'
                                            } ${isSidebarCollapsed ? 'justify-center px-2' : ''}`}
                                        title={isSidebarCollapsed ? item.label : ''}
                                    >
                                        <item.icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'} shrink-0`} />
                                        {!isSidebarCollapsed && <span>{item.label}</span>}
                                    </Link>
                                );
                            })}
                        </nav>

                        {/* User Profile (Bottom) */}
                        <div className="p-4 mt-auto border-t border-border/50">
                            <button
                                onClick={() => setIsProfileModalOpen(true)}
                                className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-all group ${isSidebarCollapsed ? 'justify-center' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-white shadow-lg shrink-0 group-hover:scale-105 transition-transform">
                                    <User className="w-5 h-5" />
                                </div>
                                {!isSidebarCollapsed && (
                                    <div className="flex-1 text-left overflow-hidden">
                                        <h3 className="font-semibold text-sm text-text truncate leading-tight">{user?.name || 'User'}</h3>
                                        <p className="text-xs text-zinc-500 truncate mt-0.5">{user?.email}</p>
                                    </div>
                                )}
                                {!isSidebarCollapsed && (
                                    <MoreHorizontal className="w-4 h-4 text-zinc-400 group-hover:text-text" />
                                )}
                            </button>
                        </div>
                    </motion.aside>
                )}
            </AnimatePresence>

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            {/* Main Content Area */}
            <main className={`flex-1 h-full w-full relative pt-2 px-3 pb-24 md:p-6 md:pb-6 bg-background overflow-hidden flex flex-col transition-[padding] duration-300 ${!isSidebarVisible ? 'md:pl-20' : ''}`}>
                <div className="h-full w-full rounded-2xl overflow-hidden flex flex-col relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, scale: 0.98, filter: 'blur(10px)' }}
                            animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                            exit={{ opacity: 0, scale: 1.02, filter: 'blur(10px)' }}
                            transition={{ type: "spring", stiffness: 200, damping: 20 }}
                            className="h-full w-full flex flex-col"
                        >
                            {children}
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <BottomNav onProfileClick={() => setIsProfileModalOpen(true)} />
        </div>
    );
};
