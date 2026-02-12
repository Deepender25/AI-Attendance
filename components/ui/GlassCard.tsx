import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
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
    const variants = {
        default: "bg-surface border-border",
        hover: "bg-surface border-border hover:border-zinc-400 dark:hover:border-zinc-700 transition-colors duration-200",
        interactive: "bg-surface border-border hover:bg-black/5 dark:hover:bg-white/5 active:scale-[0.99] transition-all duration-200 cursor-pointer"
    };

    return (
        <div
            className={cn(
                "border rounded-xl overflow-hidden",
                variants[variant],
                noPadding ? "" : "p-6",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
