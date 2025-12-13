import React, { useMemo, useState, useEffect } from 'react'
import { createAIModelGeneration } from '../lib/api'
import { Image as ImageIcon, Sparkles } from 'lucide-react'

import { LoadingResult } from '../components/LoadingResult';

const POSES = ['Professional', 'Fashion Editorial', 'Casual', 'Athletic', 'Elegant']
const LIGHTS = ['Studio Soft', 'High Key', 'Dramatic', 'Natural', 'Rim Lighting']

export default function AIModelGenerationPage() {
  const [prompt, setPrompt] = useState('')
  const [pose, setPose] = useState('Professional')
  const [lighting, setLighting] = useState('Studio Soft')
  const [measurements, setMeasurements] = useState('')
  const [batchCount, setBatchCount] = useState(1)
  const [temperature, setTemperature] = useState(0.5)
  const [aspectRatio, setAspectRatio] = useState('1:1')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [images, setImages] = useState<string[]>([])
  const [activeIdx, setActiveIdx] = useState(0)
  useEffect(() => { setActiveIdx(0) }, [images])

  const canSubmit = useMemo(() => !!prompt.trim() && !loading, [prompt, loading])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!prompt.trim()) return
    setLoading(true); setError(null); setImages([])
    try {
      const res = await createAIModelGeneration({ prompt, poseStyle: pose, lightingStyle: lighting, measurements, batchCount, temperature, aspectRatio })
      setImages(res.images_base64)
    } catch (err: any) { setError(err?.message || 'Failed to generate model') } finally { setLoading(false) }
  }

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
      <section className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100 flex flex-col h-full min-h-0 overflow-hidden">
        <h2 className="text-lg font-semibold mb-4">Inputs</h2>
        <div className="flex-1 min-h-0 space-y-4 overflow-y-auto pr-1">
          <div>
            <label className="text-sm text-neutral-600">Base prompt</label>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={4} placeholder="Describe your AI model" className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-neutral-600">Pose</label>
              <select value={pose} onChange={(e) => setPose(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200">{POSES.map(p => <option key={p}>{p}</option>)}</select>
            </div>
            <div>
              <label className="text-sm text-neutral-600">Lighting</label>
              <select value={lighting} onChange={(e) => setLighting(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200">{LIGHTS.map(l => <option key={l}>{l}</option>)}</select>
            </div>
          </div>
          <div>
            <label className="text-sm text-neutral-600">Measurements (optional)</label>
            <input value={measurements} onChange={(e) => setMeasurements(e.target.value)} placeholder="e.g., Height: 178cm; Chest: 95cm" className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-neutral-600">Creativity: {temperature.toFixed(1)}</label>
              <input type="range" min={0} max={1} step={0.1} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full" />
            </div>
            <div>
              <label className="text-sm text-neutral-600">Batch count: {batchCount}</label>
              <input type="range" min={1} max={4} step={1} value={batchCount} onChange={(e) => setBatchCount(parseInt(e.target.value))} className="w-full" />
            </div>
          </div>
          <div>
            <label className="text-sm text-neutral-600">Aspect ratio</label>
            <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200">{['1:1', '16:9', '9:16', '4:3', '3:4'].map(r => <option key={r}>{r}</option>)}</select>
          </div>
          <button disabled={!canSubmit} onClick={onSubmit as any} className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white ${canSubmit ? 'bg-brand-600 hover:bg-brand-700' : 'bg-neutral-300 cursor-not-allowed'}`}>
            <Sparkles className="w-4 h-4" /> Generate AI Model
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
          {loading && <p className="text-sm text-neutral-600">Generating...</p>}
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
            <div className="flex-1 min-h-0 rounded-lg border bg-neutral-50/50 overflow-hidden flex items-center justify-center">
              <img className="w-full h-full object-contain" src={`data:image/png;base64,${images[activeIdx]}`} />
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

