import React from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

export function LoadingResult() {
    return (
        <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-neutral-500 animate-in fade-in duration-300">
            <div className="relative">
                <div className="absolute inset-0 bg-brand-500/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="w-10 h-10 mb-4 animate-spin text-brand-600 relative z-10" />
            </div>
            <p className="text-sm font-medium text-neutral-900">Generating your design...</p>
            <p className="text-xs text-neutral-500 mt-1">This may take a few seconds</p>
        </div>
    );
}
