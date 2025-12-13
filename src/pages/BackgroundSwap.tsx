import React, { useEffect, useMemo, useState } from 'react'
import { createBackgroundSwap } from '../lib/api'
import { Image as ImageIcon, Sparkles } from 'lucide-react'

import { FileUploader } from '../components/FileUploader';

import { LoadingResult } from '../components/LoadingResult';

export default function BackgroundSwapPage() {
  const [subject, setSubject] = useState<File | null>(null)
  const [background, setBackground] = useState<File | null>(null)
  const [backgroundDesc, setBackgroundDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  useEffect(() => { setActiveIdx(0) }, [images])
  const canSubmit = useMemo(() => !!subject && !loading, [subject, loading])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!subject) return
    setLoading(true); setError(null); setImages([])
    try {
      const res = await createBackgroundSwap({ subjectImage: subject, backgroundImage: background || undefined, backgroundDesc })
      setImages(res.images_base64)
    } catch (err: any) { setError(err?.message || 'Failed to swap background') } finally { setLoading(false) }
  }

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
      <section className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100 flex flex-col h-full min-h-0 overflow-hidden">
        <h2 className="text-lg font-semibold mb-4">Inputs</h2>
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1 no-scrollbar">
          <FileUploader label="Subject image" accept="image/*" onFile={setSubject} />
          <FileUploader label="Optional background image" accept="image/*" onFile={setBackground} />
          <div>
            <label className="text-sm text-neutral-600">Background description (optional if bg image uploaded)</label>
            <input value={backgroundDesc} onChange={(e) => setBackgroundDesc(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200" />
          </div>
          <button disabled={!canSubmit} onClick={onSubmit as any} className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white ${canSubmit ? 'bg-brand-600 hover:bg-brand-700' : 'bg-neutral-300 cursor-not-allowed'}`}>
            <Sparkles className="w-4 h-4" /> Swap Background
          </button>
          {error && (
            <div className="text-sm bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded">{error}</div>
          )}
        </div>
      </section>
      <section className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100 flex flex-col h-full min-h-0 overflow-hidden">
        <h2 className="text-lg font-semibold mb-4">Result</h2>
        {loading && <LoadingResult />}
        {!images.length && !loading && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-neutral-500">
            <ImageIcon className="w-10 h-10 mb-2" />
            <p className="text-sm">Your result will appear here</p>
          </div>
        )}
        {!!images.length && (
          <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 min-h-0 rounded-lg border bg-neutral-50/50 overflow-hidden flex items-center justify-center">
              <img className="w-full h-full object-contain" src={`data:image/png;base64,${images[activeIdx]}`} />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex items-center justify-center gap-2">
                {images.map((b64, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveIdx(idx)}
                    className={`h-16 w-16 rounded border overflow-hidden ${activeIdx === idx ? 'ring-2 ring-brand-500' : ''}`}
                    title={`Result ${idx + 1}`}
                  >
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

