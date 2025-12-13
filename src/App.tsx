import React, { useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes, Navigate } from 'react-router-dom'
import { Sparkles, Settings } from 'lucide-react'

import { ToastProvider } from './components/Toast'
import { TryOnHistoryProvider } from './context/TryOnHistoryContext'

import AdCreativePage from './pages/AdCreative'
import VirtualTryOnPage from './pages/VirtualTryOn'
import BackgroundSwapPage from './pages/BackgroundSwap'
import EyewearTryOnPage from './pages/EyewearTryOn'
import AIModelsServicePage from './pages/AIModelsService'
import AIModelGenerationPage from './pages/AIModelGeneration'
import CatalogPage from './pages/Catalog'

import { SettingsDialog } from './components/SettingsDialog'

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} className={({ isActive }) => `px-3 py-1.5 rounded-md text-sm ${isActive ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-200/60'}`}>
      {label}
    </NavLink>
  )
}

export default function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <ToastProvider>
      <TryOnHistoryProvider>
        <BrowserRouter>
          {showSettings && <SettingsDialog onClose={() => setShowSettings(false)} />}

          <div className="h-screen grid grid-rows-[auto_auto_1fr] max-w-6xl mx-auto px-4 md:px-6 py-3 md:py-4 overflow-hidden">
            <header className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-brand-600" />
                <div>
                  <h1 className="text-2xl font-semibold">Mira</h1>
                  <p className="text-sm text-neutral-600">The AI Marketing OS</p>
                </div>
              </div>
              <button
                onClick={() => setShowSettings(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition text-sm font-medium"
                title="Configure API Key"
              >
                <Settings className="w-4 h-4" />
                Add your own API key
              </button>
            </header>

            <nav className="flex flex-wrap gap-2 mb-3">
              <NavItem to="/virtual-try-on" label="Virtual Try-On" />
              <NavItem to="/catalog" label="Product Catalog" />
              <NavItem to="/models-service" label="Models Service" />
              <NavItem to="/ai-model-generation" label="AI Model Generation" />
              <NavItem to="/background-swap" label="Background Swap" />
              <NavItem to="/eyewear-try-on" label="Eyewear Try-On" />
              <NavItem to="/ad-creative" label="Ad Creative" />
            </nav>

            <main className="min-h-0 overflow-hidden">
              <Routes>
                <Route path="/" element={<Navigate to="/virtual-try-on" replace />} />
                <Route path="/virtual-try-on" element={<VirtualTryOnPage />} />
                <Route path="/catalog" element={<CatalogPage />} />
                <Route path="/models-service" element={<AIModelsServicePage />} />
                <Route path="/ai-model-generation" element={<AIModelGenerationPage />} />
                <Route path="/background-swap" element={<BackgroundSwapPage />} />
                <Route path="/eyewear-try-on" element={<EyewearTryOnPage />} />
                <Route path="/ad-creative" element={<AdCreativePage />} />
                <Route path="*" element={<Navigate to="/virtual-try-on" replace />} />
              </Routes>
            </main>

          </div>
        </BrowserRouter>
      </TryOnHistoryProvider>
    </ToastProvider>
  )
}
