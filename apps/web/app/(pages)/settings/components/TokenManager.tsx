'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, Copy, Check, Key } from 'lucide-react'

interface ApiToken {
  id: string
  name: string
  lastUsedAt: string | null
  createdAt: string
}

interface NewToken extends ApiToken {
  rawToken: string
}

export default function TokenManager() {
  const [tokens, setTokens] = useState<ApiToken[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [revealedToken, setRevealedToken] = useState<NewToken | null>(null)
  const [copied, setCopied] = useState(false)

  const fetchTokens = useCallback(async () => {
    const res = await fetch('/api/tokens')
    if (res.ok) {
      const data = await res.json()
      setTokens(data.tokens)
    }
    setLoading(false)
  }, [])

  useEffect(() => { fetchTokens() }, [fetchTokens])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const res = await fetch('/api/tokens', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    })
    if (res.ok) {
      const data = await res.json()
      setRevealedToken(data.token)
      setNewName('')
      setShowForm(false)
      fetchTokens()
    }
    setCreating(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this token? Any extension using it will stop working.')) return
    await fetch(`/api/tokens/${id}`, { method: 'DELETE' })
    setTokens(prev => prev.filter(t => t.id !== id))
  }

  async function handleCopy(text: string) {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-900">API Tokens</h2>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            New Token
          </button>
        )}
      </div>

      <p className="text-sm text-gray-500 mb-6">
        Use API tokens to authenticate the browser extension. Each token is shown only once — copy it immediately after creation.
      </p>

      {/* Revealed token (shown once after creation) */}
      {revealedToken && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm font-semibold text-green-800 mb-1">
            Token &ldquo;{revealedToken.name}&rdquo; created — copy it now, it won&apos;t be shown again.
          </p>
          <div className="flex items-center gap-2 mt-2">
            <code className="flex-1 text-xs bg-white border border-green-200 rounded px-3 py-2 break-all font-mono">
              {revealedToken.rawToken}
            </code>
            <button
              onClick={() => handleCopy(revealedToken.rawToken)}
              className="flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 shrink-0"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <button
            onClick={() => setRevealedToken(null)}
            className="mt-3 text-xs text-green-700 underline"
          >
            I&apos;ve saved the token, dismiss
          </button>
        </div>
      )}

      {/* Create form */}
      {showForm && (
        <form onSubmit={handleCreate} className="mb-6 flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            placeholder="Token name, e.g. Chrome Extension"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={creating || !newName.trim()}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? 'Creating...' : 'Create'}
          </button>
          <button
            type="button"
            onClick={() => { setShowForm(false); setNewName('') }}
            className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            Cancel
          </button>
        </form>
      )}

      {/* Token list */}
      {loading ? (
        <p className="text-sm text-gray-400">Loading...</p>
      ) : tokens.length === 0 ? (
        <p className="text-sm text-gray-400">No tokens yet. Create one to use the browser extension.</p>
      ) : (
        <ul className="space-y-2">
          {tokens.map(token => (
            <li key={token.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-white">
              <div>
                <p className="text-sm font-medium text-gray-900">{token.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Created {new Date(token.createdAt).toLocaleDateString()}
                  {token.lastUsedAt && ` · Last used ${new Date(token.lastUsedAt).toLocaleDateString()}`}
                </p>
              </div>
              <button
                onClick={() => handleDelete(token.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                title="Delete token"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
