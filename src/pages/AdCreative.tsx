import React, { useEffect, useMemo, useState } from 'react'
import { createAdCreative } from '../lib/api'
import { Sparkles, Image as ImageIcon, ChevronDown, Download } from 'lucide-react'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-white rounded-xl shadow-soft p-6 border border-neutral-100 flex flex-col h-full min-h-0 overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">{title}</h2>
      </div>
      {children}
    </section>
  )
}

import { FileUploader } from '../components/FileUploader';
import { LoadingResult } from '../components/LoadingResult';

export default function AdCreativePage() {
  const [productFile, setProductFile] = useState<File | null>(null)
  const [modelFile, setModelFile] = useState<File | null>(null)

  const [brand, setBrand] = useState('')
  const [product, setProduct] = useState('')
  const [tone, setTone] = useState('Minimal')
  const [platform, setPlatform] = useState('Instagram')
  const [aspectRatio, setAspectRatio] = useState('1:1')
  const [userText, setUserText] = useState('')
  const [temperature, setTemperature] = useState(0.5)
  const [batchCount, setBatchCount] = useState(1)
  const [overlayPosition, setOverlayPosition] = useState('Bottom Left')

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [palette, setPalette] = useState<string[]>([])
  const [copy, setCopy] = useState<{ headline: string; subheadline: string; cta: string; hashtags: string[] } | null>(null)
  const [prompt, setPrompt] = useState('')
  const [log, setLog] = useState('')

  const canSubmit = useMemo(() => !!productFile && !loading, [productFile, loading])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!productFile) return
    setLoading(true)
    setError(null)
    setImageBase64(null)

    try {
      const res = await createAdCreative({
        productImage: productFile,
        modelImage: modelFile,
        brand,
        product,
        tone,
        platform,
        userText,
        aspectRatio,
        batchCount,
        temperature,
        overlayPosition,
      })
      setImageBase64(res.image_base64)
      setPalette(res.palette_hexes)
      setCopy(res.copy)
      setPrompt(res.prompt)
      setLog(res.log)
    } catch (err: any) {
      setError(err?.message || 'Failed to generate creative')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full min-h-0 grid grid-cols-1 lg:grid-cols-2 gap-6 overflow-hidden">
      <Section title="Inputs">
        <div className="flex-1 min-h-0 space-y-5 overflow-y-auto pr-1">
          <FileUploader label="Product image (PNG/JPG/WebP)" onFile={setProductFile} accept="image/png,image/jpeg,image/webp" />
          <FileUploader label="Optional model image (PNG/JPG/WebP)" onFile={setModelFile} accept="image/png,image/jpeg,image/webp" />

          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-neutral-600">Brand</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="text-sm text-neutral-600">Product</label>
                <input value={product} onChange={(e) => setProduct(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-neutral-600">Tone</label>
                <select value={tone} onChange={(e) => setTone(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200 focus:outline-none">
                  {['Minimal', 'Luxury', 'Bold', 'Playful', 'Sporty'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-neutral-600">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200 focus:outline-none">
                  {['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Pinterest', 'X'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-neutral-600">Aspect ratio</label>
                <select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200 focus:outline-none">
                  {['1:1', '16:9', '9:16', '4:3', '3:4'].map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm text-neutral-600">Overlay position</label>
                <select value={overlayPosition} onChange={(e) => setOverlayPosition(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200 focus:outline-none">
                  {['Top Left', 'Top Right', 'Bottom Left', 'Bottom Right', 'Center'].map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm text-neutral-600">Additional instructions</label>
              <textarea value={userText} onChange={(e) => setUserText(e.target.value)} rows={3} placeholder="e.g., dreamy studio lighting, soft gradients, leave negative space top-right"
                className="w-full mt-1 px-3 py-2 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-brand-500" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-neutral-600">Creativity (temperature): {temperature.toFixed(1)}</label>
                <input type="range" min={0} max={1} step={0.1} value={temperature} onChange={(e) => setTemperature(parseFloat(e.target.value))} className="w-full" />
              </div>
              <div>
                <label className="text-sm text-neutral-600">Batch count: {batchCount}</label>
                <input type="range" min={1} max={4} step={1} value={batchCount} onChange={(e) => setBatchCount(parseInt(e.target.value))} className="w-full" />
              </div>
            </div>

            <button disabled={!canSubmit} className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-white ${canSubmit ? 'bg-brand-600 hover:bg-brand-700' : 'bg-neutral-300 cursor-not-allowed'}`}>
              <Sparkles className="w-4 h-4" />
              Generate Ad Creative
            </button>

            {error && <p className="text-sm text-red-600">{error}</p>}
            {loading && <p className="text-sm text-neutral-600">Generating... this can take a moment.</p>}
          </form>
        </div>
      </Section>

      <Section title="Result">
        {loading && <LoadingResult />}
        {!imageBase64 && !loading && (
          <div className="flex-1 min-h-0 flex flex-col items-center justify-center text-neutral-500">
            <ImageIcon className="w-10 h-10 mb-2" />
            <p className="text-sm">Your generated ad will appear here</p>
          </div>
        )}
        {!!imageBase64 && (
          <div className="flex flex-col h-full min-h-0 space-y-4">
            <div className="flex-1 min-h-0 rounded-lg border border-neutral-200 bg-neutral-50/50 overflow-hidden flex items-center justify-center">
              <img src={`data:image/png;base64,${imageBase64}`} alt="Ad Creative" className="w-full h-full object-contain" />
            </div>
            {copy && (
              <div className="bg-neutral-50 rounded-lg p-4 border border-neutral-200">
                <div className="flex flex-wrap gap-2 mb-2">
                  {palette.map((hex) => (
                    <span key={hex} className="inline-flex items-center gap-2 px-2 py-1 rounded border border-neutral-200 text-sm">
                      <span className="w-3 h-3 rounded" style={{ background: hex }} />
                      {hex}
                    </span>
                  ))}
                </div>
                <h3 className="text-lg font-semibold">{copy.headline}</h3>
                <p className="text-sm text-neutral-700">{copy.subheadline}</p>
                <div className="flex items-center justify-between mt-3">
                  <span className="text-sm font-medium">{copy.cta}</span>
                  <div className="text-xs text-neutral-500">{copy.hashtags?.join(' ')}</div>
                </div>
                <details className="mt-3">
                  <summary className="text-sm text-neutral-600 inline-flex items-center gap-1 cursor-pointer"><ChevronDown className="w-4 h-4" /> Prompt & Logs</summary>
                  <pre className="text-xs whitespace-pre-wrap mt-2">{prompt}\n\n{log}</pre>
                </details>
              </div>
            )}
            <a download="ad-creative.png" href={`data:image/png;base64,${imageBase64}`} className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-neutral-900 text-white text-sm">
              <Download className="w-4 h-4" /> Download PNG
            </a>
          </div>
        )}
      </Section>
    </div>
  )
}

