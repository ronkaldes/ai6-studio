'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Link2, Loader2, X } from 'lucide-react'

interface ImportUrlDialogProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function ImportUrlDialog({ open, onClose, onSuccess }: ImportUrlDialogProps) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  const handleImport = async () => {
    if (!url) return
    setLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/signals/import-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to import URL')
      
      onSuccess()
      onClose()
      setUrl('')
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <Card className="w-full max-w-md bg-white overflow-hidden shadow-2xl relative">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-zinc-50">
          <div className="flex items-center gap-2 text-zinc-800">
            <Link2 className="w-5 h-5 text-indigo-500" />
            <h2 className="font-semibold text-sm">Import Idea from URL</h2>
          </div>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-zinc-500 mb-4">
            Paste a link to an article, repository, or Reddit thread. Claude will read the contents and generate a structured signal for your Inbox.
          </p>

          <input
            autoFocus
            type="url"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="https://news.ycombinator.com/item?id=..."
            className="w-full text-[13px] px-3 py-2 rounded-md border border-zinc-200 bg-white placeholder:text-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            onKeyDown={e => {
              if (e.key === 'Enter') handleImport()
              if (e.key === 'Escape') onClose()
            }}
          />

          {error && (
            <div className="mt-3 p-2 bg-red-50 text-red-600 text-xs rounded border border-red-100">
              {error}
            </div>
          )}

          <div className="mt-5 flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-zinc-600 hover:text-zinc-900 border border-zinc-200 rounded-md hover:bg-zinc-50"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={!url || loading}
              className="px-3 py-1.5 text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-md flex items-center gap-1.5 disabled:opacity-50"
            >
              {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {loading ? 'Importing...' : 'Import URL'}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
