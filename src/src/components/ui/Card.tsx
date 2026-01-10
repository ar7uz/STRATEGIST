import React from 'react';
import { cn } from '../../lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'elevated' | 'outline';
    hoverable?: boolean;
    accent?: 'cyan' | 'purple' | 'orange' | 'red' | 'none';
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', hoverable, accent = 'none', children, ...props }, ref) => {

        const baseStyles = 'rounded-xl transition-all duration-300';

        const variants = {
            default: `
                bg-gray-900/80 backdrop-blur-xl 
                border border-gray-700/60
                shadow-[0_2px_8px_rgba(0,0,0,0.3),0_0_0_1px_rgba(255,255,255,0.03)]
            `,
            elevated: `
                bg-gray-800/90 backdrop-blur-xl
                border border-gray-600/50
                shadow-[0_4px_16px_rgba(0,0,0,0.4),0_0_0_1px_rgba(255,255,255,0.05)]
            `,
            outline: `
                bg-gray-900/40
                border border-gray-600/70
                shadow-[0_1px_4px_rgba(0,0,0,0.2)]
            `
        };

        const accents = {
            none: '',
            cyan: 'border-l-4 border-l-cyan-400',
            purple: 'border-l-4 border-l-purple-400',
            orange: 'border-l-4 border-l-orange-400',
            red: 'border-l-4 border-l-red-400',
        };

        const hoverStyles = hoverable ? `
      cursor-pointer
      hover:bg-gray-800/70 hover:border-gray-700/70
      hover:shadow-elevated hover:-translate-y-1
    ` : '';

        return (
            <div
                ref={ref}
                className={cn(
                    baseStyles,
                    variants[variant],
                    accents[accent],
                    hoverStyles,
                    'p-5',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        );
    }
);

Card.displayName = 'Card';

// Card Header
export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
    <div className={cn('flex flex-col gap-1.5 pb-4', className)} {...props} />
);

// Card Title
export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
    <h3 className={cn('text-lg font-semibold text-white', className)} {...props} />
);

// Card Description
export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
    <p className={cn('text-sm text-gray-400', className)} {...props} />
);

// Card Content
export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
    <div className={cn('', className)} {...props} />
);

// Card Footer
export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
    <div className={cn('flex items-center pt-4 border-t border-gray-800/50', className)} {...props} />
);
