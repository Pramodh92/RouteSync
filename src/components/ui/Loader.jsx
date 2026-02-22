import React from 'react';

export default function Loader({ size = 'md', className = '' }) {
    const sizes = {
        sm: 'w-6 h-6 border-2',
        md: 'w-10 h-10 border-3',
        lg: 'w-16 h-16 border-4',
    };

    return (
        <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
            <div
                className={`${sizes[size]} border-sand border-t-orange rounded-full animate-spin`}
                style={{ borderWidth: size === 'lg' ? 4 : 3 }}
            />
            {size !== 'sm' && (
                <p className="text-sm text-warmgray font-medium animate-pulse">Loading...</p>
            )}
        </div>
    );
}
