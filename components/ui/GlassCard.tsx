import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion, HTMLMotionProps } from 'framer-motion';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    variant?: 'default' | 'hover' | 'interactive';
    noPadding?: boolean;
}

export const GlassCard: React.FC<CardProps> = ({
    children,
    className,
    variant = 'default',
    noPadding = false,
    ...props
}) => {
    // Bold Black Minimalist Styles
    const variants = {
        default: "bg-surface border-border",
        hover: "bg-surface border-border hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors duration-200",
        interactive: "bg-surface border-border hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all duration-200 cursor-pointer"
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
                "border rounded-xl overflow-hidden", // Removed backdrop-blur and shadow-xl for minimalist look
                variants[variant],
                noPadding ? "" : "p-6",
                className
            )}
            {...props}
        >
            {children}
        </motion.div>
    );
};
