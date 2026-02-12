import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, Settings, User } from 'lucide-react';
import { motion } from 'framer-motion';

interface BottomNavProps {
    onProfileClick: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onProfileClick }) => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Home', path: '/' },
        { icon: Calendar, label: 'Schedule', path: '/schedule' },
        { icon: Settings, label: 'Settings', path: '/settings' },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
            <div className="mx-3 mb-3 rounded-2xl bg-surface/90 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/20">
                <div className="flex items-center justify-around px-1 py-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center min-w-[60px] min-h-[56px] rounded-xl transition-colors active:scale-95"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="mobileNavBg"
                                        className="absolute inset-1 bg-primary/10 dark:bg-primary/15 rounded-xl"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                    />
                                )}
                                <item.icon
                                    className={`w-5 h-5 z-10 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-400'}`}
                                    strokeWidth={isActive ? 2.5 : 2}
                                />
                                <span className={`text-[10px] font-semibold mt-0.5 z-10 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-500'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Profile Button */}
                    <button
                        onClick={onProfileClick}
                        className="relative flex flex-col items-center justify-center min-w-[60px] min-h-[56px] rounded-xl active:scale-95 transition-transform"
                    >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center z-10">
                            <User className="w-3.5 h-3.5 text-background" />
                        </div>
                        <span className="text-[10px] font-semibold mt-0.5 z-10 text-zinc-500">
                            Profile
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
