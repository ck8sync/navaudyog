'use client'

import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'

export default function ShareJobButton({ title }: { title: string }) {
  const [message, setMessage] = useState('')

  async function handleShare() {
    const url = window.location.href

    if (navigator.share) {
      try {
        await navigator.share({ title: `${title} | Nava Udyog`, text: `Job opportunity: ${title}`, url })
        return
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
      }
    }

    try {
      await navigator.clipboard.writeText(url)
      setMessage('Job link copied')
    } catch {
      setMessage('Could not copy automatically. Copy the URL from your browser address bar.')
    }
  }

  const copied = message === 'Job link copied'

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleShare}
        aria-label={copied ? 'Job link copied' : `Share ${title}`}
        className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
      >
        {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : message ? <Copy className="h-4 w-4" aria-hidden="true" /> : <Share2 className="h-4 w-4" aria-hidden="true" />}
        <span>{copied ? 'Link copied' : 'Share job'}</span>
      </button>
      <span className={`text-xs text-white/80 ${message ? '' : 'sr-only'}`} role="status" aria-live="polite">{message}</span>
    </div>
  )
}
