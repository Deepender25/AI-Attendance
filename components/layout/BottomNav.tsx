import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Calendar, User } from 'lucide-react';
import { motion } from 'framer-motion';

export const BottomNav: React.FC = () => {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: 'Home', path: '/' },
        { icon: Calendar, label: 'Schedule', path: '/schedule' },
        { icon: User, label: 'Profile', path: '/settings' }, // Assuming settings/profile route
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 right-0 h-[64px] bg-surface border-t border-border z-50 flex items-center justify-around px-2 shadow-lg safe-area-bottom">
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link
                        key={item.path}
                        to={item.path}
                        className="relative flex flex-col items-center justify-center w-full h-full group"
                    >
                        {isActive && (
                            <motion.div
                                layoutId="bottomNavIndicator"
                                className="absolute top-0 w-12 h-1 bg-primary rounded-b-full"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            />
                        )}
                        <item.icon
                            className={`w-6 h-6 z-10 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-zinc-400'}`}
                        />
                        <span className={`text-[10px] font-medium mt-1 z-10 transition-colors duration-200 ${isActive ? 'text-text' : 'text-zinc-500'}`}>
                            {item.label}
                        </span>
                    </Link>
                );
            })}
        </div>
    );
};
