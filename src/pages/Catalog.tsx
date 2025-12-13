import React, { useEffect, useMemo, useState } from 'react'
import { createCatalogViews } from '../lib/api'
import { Image as ImageIcon, Sparkles, Download } from 'lucide-react'
import { useTryOnHistory } from '../context/TryOnHistoryContext';

import { FileUploader } from '../components/FileUploader';

import { LoadingResult } from '../components/LoadingResult';

export default function CatalogPage() {
  const { images, setImages, loading, setLoading, error, setError, inputs, setInputs } = useTryOnHistory('catalog');

  const [product, setProduct] = useState<File | null>(inputs.product || null)
  const [bgText, setBgText] = useState(inputs.bgText || '')
  const [temperature, setTemperature] = useState(inputs.temperature === undefined ? 0.4 : inputs.temperature)
  const [batchCount, setBatchCount] = useState(inputs.batchCount || 1)

  // Sync back to context
  useEffect(() => {
    setInputs({ product, bgText, temperature, batchCount });
  }, [product, bgText, temperature, batchCount]);

  const [activeIdx, setActiveIdx] = useState(0)
  useEffect(() => { setActiveIdx(0) }, [images])
  const canSubmit = useMemo(() => !!product && !loading, [product, loading])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!product) return
    setLoading(true); setError(null); setImages([])
    try {
      const res = await createCatalogViews({ productImage: product, backgroundText: bgText, temperature, batchCount })
      setImages(res.images_base64)
    } catch (err: any) { setError(err?.message || 'Failed to generate catalog views') } finally { setLoading(false) }
  }

  const handleDownload = () => {
    if (!images[activeIdx]) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${images[activeIdx]}`;
    link.download = `mira-catalog-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
      <section className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100 flex flex-col h-full min-h-0 overflow-hidden">
        <h2 className="text-lg font-semibold mb-4">Inputs</h2>
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1 no-scrollbar">
          <FileUploader label="Product image" accept="image/*" onFile={setProduct} />
          <div>
            <label className="text-sm text-neutral-600">Background style (optional)</label>
            <input value={bgText} onChange={(e) => setBgText(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200" />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Creativity: {temperature.toFixed(1)}</label>
            <input type="range" min={0} max={1} step={0.1} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Output Count: {batchCount}</label>
            <div className="flex gap-2 mt-1">
              {[1, 2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setBatchCount(n)}
                  className={`px-3 py-1 rounded text-sm border ${batchCount === n ? 'bg-neutral-800 text-white border-neutral-800' : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'}`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <button disabled={!canSubmit} onClick={onSubmit as any} className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white ${canSubmit ? 'bg-brand-600 hover:bg-brand-700' : 'bg-neutral-300 cursor-not-allowed'}`}>
            <Sparkles className="w-4 h-4" /> Generate Catalog View
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      </section>
      <section className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100 flex flex-col h-full min-h-0 overflow-hidden">
        <h2 className="text-lg font-semibold mb-4">Results</h2>
        {loading && <LoadingResult />}
        {!images.length && !loading && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-neutral-500">
            <ImageIcon className="w-10 h-10 mb-2" />
            <p className="text-sm">Your results will appear here</p>
          </div>
        )}
        {!!images.length && (
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 min-h-0 rounded-lg border bg-neutral-50/50 overflow-hidden flex items-center justify-center relative group">
              <img className="w-full h-full object-contain" src={`data:image/png;base64,${images[activeIdx]}`} />
              <button
                onClick={handleDownload}
                className="absolute top-4 right-4 p-2 bg-white/90 hover:bg-white text-neutral-700 rounded-full shadow-md transition opacity-0 group-hover:opacity-100"
                title="Download Image"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {images.map((b64: string, idx: number) => (
                  <button key={idx} type="button" onClick={() => setActiveIdx(idx)} className={`h-16 w-16 rounded border overflow-hidden ${activeIdx === idx ? 'ring-2 ring-brand-500' : ''}`}>
                    <img className="w-full h-full object-cover" src={`data:image/png;base64,${b64}`} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  )
}

