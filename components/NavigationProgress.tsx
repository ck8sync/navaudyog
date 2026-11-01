'use client'

import { useEffect, useState } from 'react'
import './navigation-progress.css'

export default function NavigationProgress() {
  const [active, setActive] = useState(false)

  useEffect(() => {
    let finishTimer: number | undefined
    let watchTimer: number | undefined

    function finish() {
      if (watchTimer) window.clearInterval(watchTimer)
      if (finishTimer) window.clearTimeout(finishTimer)
      finishTimer = window.setTimeout(() => setActive(false), 220)
    }

    function start(targetUrl: string) {
      setActive(true)
      if (watchTimer) window.clearInterval(watchTimer)
      const expected = new URL(targetUrl)
      watchTimer = window.setInterval(() => {
        const current = new URL(window.location.href)
        if (current.pathname === expected.pathname && current.search === expected.search) finish()
      }, 100)
      if (finishTimer) window.clearTimeout(finishTimer)
      finishTimer = window.setTimeout(() => setActive(false), 15000)
    }

    function handleClick(event: MouseEvent) {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (!(event.target instanceof Element)) return
      const anchor = event.target.closest('a[href]')
      if (!(anchor instanceof HTMLAnchorElement) || anchor.target === '_blank' || anchor.hasAttribute('download')) return
      const target = new URL(anchor.href, window.location.href)
      const current = new URL(window.location.href)
      if (target.origin !== current.origin || (target.pathname === current.pathname && target.search === current.search)) return
      start(target.href)
    }

    function handlePopState() { start(window.location.href) }
    document.addEventListener('click', handleClick, true)
    window.addEventListener('popstate', handlePopState)
    return () => {
      document.removeEventListener('click', handleClick, true)
      window.removeEventListener('popstate', handlePopState)
      if (watchTimer) window.clearInterval(watchTimer)
      if (finishTimer) window.clearTimeout(finishTimer)
    }
  }, [])

  return <div className={`route-progress ${active ? 'active' : ''}`} aria-hidden="true"><span /></div>
}
