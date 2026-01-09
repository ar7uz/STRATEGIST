import React from 'react';
import { cn } from '../../lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, error, hint, type = 'text', ...props }, ref) => {
        return (
            <div className="flex flex-col gap-2 w-full">
                {label && (
                    <label className="text-sm font-medium text-gray-300">
                        {label}
                    </label>
                )}
                <input
                    ref={ref}
                    type={type}
                    className={cn(
                        `
            flex h-11 w-full rounded-lg 
            bg-gray-800/50 backdrop-blur-sm
            border border-gray-700/50 
            px-4 py-2 
            text-base text-white
            placeholder:text-gray-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50
            hover:border-gray-600
            disabled:cursor-not-allowed disabled:opacity-50
            `,
                        error && 'border-red-400/50 focus:ring-red-400/50 focus:border-red-400/50',
                        className
                    )}
                    {...props}
                />
                {hint && !error && (
                    <span className="text-xs text-gray-500">{hint}</span>
                )}
                {error && (
                    <span className="text-xs text-red-400">{error}</span>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';

// Textarea variant
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
    error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, label, error, ...props }, ref) => {
        return (
            <div className="flex flex-col gap-2 w-full">
                {label && (
                    <label className="text-sm font-medium text-gray-300">
                        {label}
                    </label>
                )}
                <textarea
                    ref={ref}
                    className={cn(
                        `
            flex min-h-[100px] w-full rounded-lg 
            bg-gray-800/50 backdrop-blur-sm
            border border-gray-700/50 
            px-4 py-3 
            text-base text-white
            placeholder:text-gray-500
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50
            hover:border-gray-600
            disabled:cursor-not-allowed disabled:opacity-50
            resize-none
            `,
                        error && 'border-red-400/50 focus:ring-red-400/50',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <span className="text-xs text-red-400">{error}</span>
                )}
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
