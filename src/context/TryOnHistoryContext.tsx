import React, { createContext, useContext, useState, ReactNode } from 'react';

type PageKey = 'virtual-try-on' | 'catalog' | 'eyewear-try-on' | 'background-swap' | 'ad-creative' | 'models-service' | 'ai-model-generation';

interface PageState {
    images: string[];
    loading: boolean;
    error: string | null;
    inputs: any;
}

interface TryOnHistoryContextType {
    getPageState: (pageKey: PageKey) => PageState;
    setPageState: (pageKey: PageKey, state: Partial<PageState>) => void;
}

const TryOnHistoryContext = createContext<TryOnHistoryContextType | undefined>(undefined);

export function TryOnHistoryProvider({ children }: { children: ReactNode }) {
    const [pageStates, setPageStates] = useState<Record<PageKey, PageState>>({
        'virtual-try-on': { images: [], loading: false, error: null, inputs: {} },
        'catalog': { images: [], loading: false, error: null, inputs: {} },
        'eyewear-try-on': { images: [], loading: false, error: null, inputs: {} },
        'background-swap': { images: [], loading: false, error: null, inputs: {} },
        'ad-creative': { images: [], loading: false, error: null, inputs: {} },
        'models-service': { images: [], loading: false, error: null, inputs: {} },
        'ai-model-generation': { images: [], loading: false, error: null, inputs: {} },
    });

    const getPageState = (pageKey: PageKey): PageState => {
        return pageStates[pageKey];
    };

    const setPageState = (pageKey: PageKey, state: Partial<PageState>) => {
        setPageStates(prev => ({
            ...prev,
            [pageKey]: { ...prev[pageKey], ...state }
        }));
    };

    return (
        <TryOnHistoryContext.Provider value={{ getPageState, setPageState }}>
            {children}
        </TryOnHistoryContext.Provider>
    );
}

export function useTryOnHistory(pageKey: PageKey) {
    const context = useContext(TryOnHistoryContext);
    if (!context) {
        throw new Error('useTryOnHistory must be used within TryOnHistoryProvider');
    }

    const { getPageState, setPageState } = context;
    const state = getPageState(pageKey);

    return {
        images: state.images,
        setImages: (images: string[]) => setPageState(pageKey, { images }),
        loading: state.loading,
        setLoading: (loading: boolean) => setPageState(pageKey, { loading }),
        error: state.error,
        setError: (error: string | null) => setPageState(pageKey, { error }),
        inputs: state.inputs,
        setInputs: (inputs: any) => setPageState(pageKey, { inputs }),
    };
}
