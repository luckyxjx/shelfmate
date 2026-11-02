import { useEffect, useRef, useState } from 'react'
import * as pdfjs from 'pdfjs-dist'
import type { PDFDocumentProxy, PDFPageProxy } from 'pdfjs-dist'
import { getBookSignedUrl } from '../../hooks/useBooks'
import type { Book } from '../../types/database'

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

interface ReaderProps {
  book: Book
  page: number
  onPageChange: (page: number) => void
}

// ── Shared PDF loading hook ──────────────────────────────────────────────────
export function usePDF(book: Book) {
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

    const load = async () => {
      try {
        const url = await getBookSignedUrl(book.storage_path)
        const doc = await pdfjs.getDocument(url).promise
        if (!cancelled) {
          setPdf(doc)
          setLoading(false)
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF.')
          setLoading(false)
        }
      }
    }

    load()
    return () => { cancelled = true }
  }, [book.storage_path])

  return { pdf, loading, error }
}

// ── Page canvas renderer ─────────────────────────────────────────────────────
interface PageCanvasProps {
  pdf: PDFDocumentProxy
  pageNum: number
  scale?: number
  onRender?: (page: PDFPageProxy) => void
}

export function PageCanvas({ pdf, pageNum, scale = 1.2, onRender }: PageCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const renderTaskRef = useRef<ReturnType<PDFPageProxy['render']> | null>(null)

  useEffect(() => {
    if (!canvasRef.current || !pdf) return
    let cancelled = false

    const render = async () => {
      try {
        const page = await pdf.getPage(pageNum)
        if (cancelled) return

        const viewport = page.getViewport({ scale })
        const canvas = canvasRef.current!
        const ctx = canvas.getContext('2d')!
        canvas.width = viewport.width
        canvas.height = viewport.height

        // Cancel any in-progress render
        renderTaskRef.current?.cancel()

        const task = page.render({ canvasContext: ctx, viewport })
        renderTaskRef.current = task

        await task.promise
        if (!cancelled) onRender?.(page)
      } catch (err) {
        // Ignore cancelled render errors
        if ((err as Error)?.message !== 'Rendering cancelled') {
          console.error('PDF render error:', err)
        }
      }
    }

    render()
    return () => {
      cancelled = true
      renderTaskRef.current?.cancel()
    }
  }, [pdf, pageNum, scale, onRender])

  return (
    <canvas
      ref={canvasRef}
      style={{ display: 'block', maxWidth: '100%', height: 'auto', borderRadius: 'var(--radius-sm)' }}
    />
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Two-page reader
// ────────────────────────────────────────────────────────────────────────────
export default function TwoPageReader({ book, page, onPageChange: _onPageChange }: ReaderProps) {
  const { pdf, loading, error } = usePDF(book)

  if (loading) return <ReaderLoading />
  if (error) return <ReaderError message={error} />
  if (!pdf) return null

  const leftPage = page % 2 === 0 ? page : page - 1
  const rightPage = leftPage + 1
  const totalPages = pdf.numPages

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      padding: '24px',
      overflow: 'hidden',
    }}>
      {/* Left page */}
      {leftPage >= 1 && (
        <div className="reader-page" style={{ flex: 1, maxWidth: '45%' }}>
          <PageCanvas pdf={pdf} pageNum={leftPage} />
          <div style={{ textAlign: 'center', padding: '6px', fontSize: '11px', color: 'var(--ink-400)' }}>
            {leftPage}
          </div>
        </div>
      )}

      {/* Right page */}
      {rightPage <= totalPages && (
        <div className="reader-page" style={{ flex: 1, maxWidth: '45%' }}>
          <PageCanvas pdf={pdf} pageNum={rightPage} />
          <div style={{ textAlign: 'center', padding: '6px', fontSize: '11px', color: 'var(--ink-400)' }}>
            {rightPage}
          </div>
        </div>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Scroll reader
// ────────────────────────────────────────────────────────────────────────────
export function ScrollReader({ book, page, onPageChange }: ReaderProps) {
  const { pdf, loading, error } = usePDF(book)
  const containerRef = useRef<HTMLDivElement>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const pageRefs = useRef<Map<number, HTMLDivElement>>(new Map())

  // Scroll to page when controlled externally
  useEffect(() => {
    const el = pageRefs.current.get(page)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [page])

  // Observe which page is in view
  useEffect(() => {
    if (!pdf) return
    observerRef.current?.disconnect()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const p = Number(entry.target.getAttribute('data-page'))
            if (p && p !== page) onPageChange(p)
          }
        })
      },
      { root: containerRef.current, threshold: 0.5 }
    )

    pageRefs.current.forEach((el) => observer.observe(el))
    observerRef.current = observer

    return () => observer.disconnect()
  }, [pdf, page, onPageChange])

  if (loading) return <ReaderLoading />
  if (error) return <ReaderError message={error} />
  if (!pdf) return null

  const totalPages = pdf.numPages

  return (
    <div ref={containerRef} style={{ height: '100%', overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <div
          key={p}
          ref={(el) => { if (el) pageRefs.current.set(p, el) }}
          data-page={p}
          className="reader-page"
          style={{ maxWidth: '620px', margin: '0 auto', width: '100%' }}
        >
          <PageCanvas pdf={pdf} pageNum={p} scale={1.4} />
        </div>
      ))}
    </div>
  )
}

// ────────────────────────────────────────────────────────────────────────────
// Manga reader (two single portrait pages, RTL)
// ────────────────────────────────────────────────────────────────────────────
export function MangaReader({ book, page, onPageChange: _onPageChange }: ReaderProps) {
  const { pdf, loading, error } = usePDF(book)

  if (loading) return <ReaderLoading />
  if (error) return <ReaderError message={error} />
  if (!pdf) return null

  const totalPages = pdf.numPages

  return (
    <div style={{
      display: 'flex',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '4px',
      padding: '24px',
      direction: 'rtl', // RTL for manga reading order
    }}>
      {/* Right page (shown first in RTL) */}
      {page <= totalPages && (
        <div className="reader-page" style={{ flex: 1, maxWidth: '45%', direction: 'ltr' }}>
          <PageCanvas pdf={pdf} pageNum={page} />
          <div style={{ textAlign: 'center', padding: '6px', fontSize: '11px', color: 'var(--ink-400)' }}>
            {page}
          </div>
        </div>
      )}

      {/* Left page (next) */}
      {page + 1 <= totalPages && (
        <div className="reader-page" style={{ flex: 1, maxWidth: '45%', direction: 'ltr' }}>
          <PageCanvas pdf={pdf} pageNum={page + 1} />
          <div style={{ textAlign: 'center', padding: '6px', fontSize: '11px', color: 'var(--ink-400)' }}>
            {page + 1}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Shared states ────────────────────────────────────────────────────────────
function ReaderLoading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <p style={{ color: 'var(--ink-400)', fontSize: '14px' }}>Loading pages…</p>
    </div>
  )
}

function ReaderError({ message }: { message: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '24px' }}>
      <p style={{ color: '#DC2626', fontSize: '14px', textAlign: 'center' }}>
        Failed to load: {message}
      </p>
    </div>
  )
}
