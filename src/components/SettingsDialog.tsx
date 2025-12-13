import React, { useState, useEffect } from 'react';
import { Settings, X, Save } from 'lucide-react';
import { useToast } from './Toast';

interface SettingsDialogProps {
    onClose: () => void;
}

export function SettingsDialog({ onClose }: SettingsDialogProps) {
    const [provider, setProvider] = useState('gemini');
    const [apiKey, setApiKey] = useState('');
    const { addToast } = useToast();

    useEffect(() => {
        setProvider(localStorage.getItem('mira_provider') || 'gemini');
        setApiKey(localStorage.getItem('mira_api_key') || '');
    }, []);

    const handleSave = () => {
        localStorage.setItem('mira_provider', provider);
        localStorage.setItem('mira_api_key', apiKey);
        onClose();
        addToast("API key saved!", "success");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Settings className="w-5 h-5 text-neutral-500" />
                        Settings
                    </h2>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-600 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">AI Provider</label>
                        <select
                            value={provider}
                            onChange={(e) => setProvider(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                        >
                            <option value="gemini">Google Gemini (Recommended)</option>
                            <option value="openrouter">OpenRouter</option>
                        </select>
                        <p className="text-xs text-neutral-500 mt-1">
                            Select the backend AI provider for generation.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">API Key</label>
                        <input
                            type="password"
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            placeholder="sk-..."
                            className="w-full px-3 py-2 rounded-lg border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <p className="text-xs text-neutral-500 mt-1">
                            Your key is stored locally in your browser.
                        </p>
                    </div>
                </div>

                <div className="px-6 py-4 bg-neutral-50 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-neutral-900 text-white hover:bg-neutral-800 transition text-sm font-medium"
                    >
                        <Save className="w-4 h-4" />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
