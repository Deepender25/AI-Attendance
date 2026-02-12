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
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50">
            <div className="bg-surface/95 backdrop-blur-xl border-t border-border/60 safe-area-bottom">
                <div className="flex items-center justify-around h-16">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className="relative flex flex-col items-center justify-center flex-1 h-full active:opacity-70 transition-opacity"
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="mobileNavIndicator"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-primary rounded-b-full"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 500, damping: 35 }}
                                    />
                                )}
                                <item.icon
                                    className={`w-[22px] h-[22px] transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-400'}`}
                                    strokeWidth={isActive ? 2.5 : 1.8}
                                />
                                <span className={`text-[10px] font-medium mt-1 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-500'}`}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {/* Profile Button */}
                    <button
                        onClick={onProfileClick}
                        className="relative flex flex-col items-center justify-center flex-1 h-full active:opacity-70 transition-opacity"
                    >
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
                            <User className="w-3.5 h-3.5 text-background" />
                        </div>
                        <span className="text-[10px] font-medium mt-1 text-zinc-500">
                            Profile
                        </span>
                    </button>
                </div>
            </div>
        </nav>
    );
};
