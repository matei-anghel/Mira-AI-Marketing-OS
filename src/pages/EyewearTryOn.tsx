import React, { useEffect, useMemo, useState } from 'react'
import { createEyewearTryOn } from '../lib/api'
import { Image as ImageIcon, Sparkles, Download } from 'lucide-react'
import { useTryOnHistory } from '../context/TryOnHistoryContext';

import { FileUploader } from '../components/FileUploader';

import { LoadingResult } from '../components/LoadingResult';

export default function EyewearTryOnPage() {
  const { images, setImages, loading, setLoading, error, setError, inputs, setInputs } = useTryOnHistory('eyewear-try-on');

  const [face, setFace] = useState<File | null>(inputs.face || null)
  const [eyewear, setEyewear] = useState<File[]>(inputs.eyewear || [])
  const [prompt, setPrompt] = useState(inputs.prompt || '')
  const [measurements, setMeasurements] = useState(inputs.measurements || '')

  // Sync back to context
  useEffect(() => {
    setInputs({ face, eyewear, prompt, measurements });
  }, [face, eyewear, prompt, measurements]);

  const [activeIdx, setActiveIdx] = useState(0)
  useEffect(() => { setActiveIdx(0) }, [images])
  const canSubmit = useMemo(() => !!face && eyewear.length > 0 && !loading, [face, eyewear, loading])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!face) return
    setLoading(true); setError(null); setImages([])
    try {
      const res = await createEyewearTryOn({ faceImage: face, eyewearImages: eyewear, prompt, measurements })
      setImages(res.images_base64)
    } catch (err: any) { setError(err?.message || 'Failed to generate eyewear try-on') } finally { setLoading(false) }
  }

  const handleDownload = () => {
    if (!images[activeIdx]) return;
    const link = document.createElement('a');
    link.href = `data:image/png;base64,${images[activeIdx]}`;
    link.download = `mira-eyewear-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
      <section className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100 flex flex-col h-full min-h-0 overflow-hidden">
        <h2 className="text-lg font-semibold mb-4">Inputs</h2>
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1 no-scrollbar">
          <FileUploader label="Your face photo" accept="image/*" onFile={setFace} />
          <FileUploader label="Eyewear images" accept="image/*" multiple onFiles={setEyewear} />
          <div>
            <label className="text-sm text-neutral-600">Additional instructions</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={3} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200" />
          </div>
          <div>
            <label className="text-sm text-neutral-600">Measurements (optional)</label>
            <textarea value={measurements} onChange={(e) => setMeasurements(e.target.value)} rows={2} placeholder="e.g., IPD: 63mm; Lens height: 40mm; Bridge: 18mm" className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200" />
          </div>
          <button disabled={!canSubmit} onClick={onSubmit as any} className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white ${canSubmit ? 'bg-brand-600 hover:bg-brand-700' : 'bg-neutral-300 cursor-not-allowed'}`}>
            <Sparkles className="w-4 h-4" /> Generate Eyewear Try-On
          </button>
          {error && (
            <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{error}</div>
          )}
        </div>
      </section>
      <section className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100 flex flex-col h-full min-h-0 overflow-hidden">
        <h2 className="text-lg font-semibold mb-4">Results</h2>
        {loading && <LoadingResult />}
        {!images.length && !loading && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-neutral-500">
            <ImageIcon className="w-10 h-10 mb-2" />
            <p className="text-sm">Your result(s) will appear here</p>
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
                {images.map((b64, idx) => (
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

