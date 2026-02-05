import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Button({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) {
    const baseStyles = 'inline-flex items-center justify-center font-display font-bold tracking-wide uppercase transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-none disabled:bg-gray-400';

    const variants = {
        primary: 'bg-brand-dark text-white hover:bg-brand-gray shadow-lg hover:shadow-xl border-2 border-transparent',
        secondary: 'bg-transparent text-brand-dark border-2 border-brand-dark hover:bg-brand-dark hover:text-white',
        outline: 'bg-transparent text-white border-2 border-white hover:bg-white hover:text-brand-dark',
        ghost: 'bg-transparent text-brand-dark hover:bg-brand-light',
    };

    const sizes = {
        sm: 'text-sm px-4 py-2',
        md: 'text-base px-6 py-3',
        lg: 'text-lg px-8 py-4',
    };

    return (
        <button
            className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
            {...props}
        >
            {children}
        </button>
    );
}
