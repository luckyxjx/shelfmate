import { useState, useRef, FormEvent } from 'react'
import { X, Upload, FileText } from 'lucide-react'
import { useUploadBook } from '../../hooks/useBooks'

interface Props {
  userId: string
  onClose: () => void
}

export default function UploadModal({ userId, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [kind, setKind] = useState<'book' | 'manga'>('book')
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const uploadBook = useUploadBook()

  const handleFile = (f: File) => {
    const ext = f.name.toLowerCase()
    if (!ext.endsWith('.pdf') && !ext.endsWith('.cbz')) {
      setError('Only PDF and CBZ files are supported.')
      return
    }
    setFile(f)
    setError('')
    if (!title) setTitle(f.name.replace(/\.(pdf|cbz)$/i, ''))
    if (ext.endsWith('.cbz')) setKind('manga')
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!file || !title) return
    setError('')
    try {
      await uploadBook.mutateAsync({ userId, file, title, author: author || undefined, kind })
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    }
  }

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal animate-scale-in" style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>Add a book</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}><X size={16} /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInput.current?.click()}
            style={{
              border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--ink-300)' : 'var(--ink-100)'}`,
              borderRadius: 'var(--radius-lg)',
              padding: '28px',
              textAlign: 'center',
              cursor: 'pointer',
              background: dragging ? 'var(--accent-light)' : file ? 'var(--cream-200)' : 'var(--cream-100)',
              transition: 'all 0.15s',
            }}
          >
            {file ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <FileText size={28} style={{ color: 'var(--accent)' }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--ink-700)' }}>{file.name}</span>
                <span style={{ fontSize: '12px', color: 'var(--ink-400)' }}>
                  {(file.size / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <Upload size={28} style={{ color: 'var(--ink-300)' }} />
                <span style={{ fontSize: '14px', color: 'var(--ink-500)' }}>
                  Drop a <strong>PDF</strong> or <strong>CBZ</strong> here
                </span>
                <span style={{ fontSize: '12px', color: 'var(--ink-300)' }}>or click to browse</span>
              </div>
            )}
            <input ref={fileInput} type="file" accept=".pdf,.cbz" hidden onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
          </div>

          {/* Title */}
          <div>
            <label className="label" htmlFor="book-title">Title</label>
            <input id="book-title" className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book title" required />
          </div>

          {/* Author */}
          <div>
            <label className="label" htmlFor="book-author">Author (optional)</label>
            <input id="book-author" className="input" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Author name" />
          </div>

          {/* Kind toggle */}
          <div>
            <label className="label">Type</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'var(--cream-200)', borderRadius: 'var(--radius-md)', padding: '3px', gap: '2px' }}>
              {(['book', 'manga'] as const).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKind(k)}
                  style={{
                    padding: '8px',
                    borderRadius: 'calc(var(--radius-md) - 2px)',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '13px',
                    fontWeight: 500,
                    transition: 'all 0.15s',
                    background: kind === k ? 'var(--cream-50)' : 'transparent',
                    color: kind === k ? 'var(--ink-900)' : 'var(--ink-500)',
                    boxShadow: kind === k ? 'var(--shadow-xs)' : 'none',
                  }}
                >
                  {k === 'book' ? '📖 Book' : '📚 Manga'}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 'var(--radius-md)', fontSize: '13px', color: '#DC2626' }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
            <button type="button" className="btn btn-secondary btn-full" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary btn-full" disabled={uploadBook.isPending || !file}>
              {uploadBook.isPending ? 'Uploading…' : 'Add to shelf'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
