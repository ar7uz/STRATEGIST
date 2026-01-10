import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    description?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    description,
    children,
    size = 'md'
}) => {
    // Handle escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div
                    className={cn(
                        `
            relative w-full 
            bg-gray-900/95 backdrop-blur-xl
            border border-gray-800/80
            rounded-2xl shadow-elevated
            flex flex-col max-h-[85vh]
            transform transition-all duration-300 ease-out
            animate-in fade-in zoom-in-95
            `,
                        sizes[size]
                    )}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-start justify-between p-6 border-b border-gray-800/50">
                        <div className="flex-1 pr-4">
                            <h2 className="text-xl font-bold text-white">{title}</h2>
                            {description && (
                                <p className="mt-1 text-sm text-gray-400">{description}</p>
                            )}
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="flex-shrink-0 -mt-1 -mr-2 text-gray-400 hover:text-white"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Modal Footer helper
export const ModalFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => (
    <div
        className={cn('flex items-center justify-end gap-3 pt-6 mt-6 border-t border-gray-800/50', className)}
        {...props}
    >
        {children}
    </div>
);
