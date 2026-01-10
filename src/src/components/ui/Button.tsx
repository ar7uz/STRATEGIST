import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
    size?: 'sm' | 'md' | 'lg' | 'icon';
    isLoading?: boolean;
    leftIcon?: React.ReactNode;
    rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', isLoading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {

        const baseStyles = `
      inline-flex items-center justify-center gap-2 
      font-medium rounded-lg
      transition-all duration-200 ease-out
      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
      disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none
      active:scale-[0.98]
    `;

        const variants = {
            primary: `
        bg-gradient-to-r from-cyan-400 to-cyan-500 
        text-gray-900 font-semibold
        hover:from-cyan-300 hover:to-cyan-400
        focus:ring-cyan-400
        shadow-lg shadow-cyan-400/20
        hover:shadow-xl hover:shadow-cyan-400/30
      `,
            secondary: `
        bg-gray-800 text-gray-100
        border border-gray-700
        hover:bg-gray-700 hover:border-gray-600
        focus:ring-gray-500
      `,
            ghost: `
        bg-transparent text-gray-400
        hover:bg-gray-800/50 hover:text-gray-100
        focus:ring-gray-600
      `,
            danger: `
        bg-gradient-to-r from-red-500 to-red-600
        text-white font-semibold
        hover:from-red-400 hover:to-red-500
        focus:ring-red-400
        shadow-lg shadow-red-500/20
      `,
            outline: `
        bg-transparent 
        border border-cyan-400/50 text-cyan-400
        hover:bg-cyan-400/10 hover:border-cyan-400
        focus:ring-cyan-400
      `
        };

        const sizes = {
            sm: 'h-8 px-3 text-sm',
            md: 'h-10 px-4 text-sm',
            lg: 'h-12 px-6 text-base',
            icon: 'h-10 w-10 p-0'
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                disabled={isLoading || disabled}
                {...props}
            >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {!isLoading && leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
                {children}
                {!isLoading && rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
            </button>
        );
    }
);

Button.displayName = 'Button';
