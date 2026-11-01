'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type PlatformStatsData = {
  active_jobs: number
  worker_accounts: number
  employer_accounts: number
  applications: number
}

const metrics: { key: keyof PlatformStatsData; label: string }[] = [
  { key: 'active_jobs', label: 'Active jobs' },
  { key: 'worker_accounts', label: 'Worker accounts' },
  { key: 'employer_accounts', label: 'Employer accounts' },
  { key: 'applications', label: 'Applications' },
]

export default function PlatformStats() {
  const [stats, setStats] = useState<PlatformStatsData | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>('loading')

  useEffect(() => {
    let active = true

    async function loadStats() {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.rpc('get_public_platform_stats')
        if (error) throw error

        const result = Array.isArray(data) ? data[0] : data
        if (!result) throw new Error('Platform stats returned no result')

        if (active) {
          setStats(result as PlatformStatsData)
          setStatus('ready')
        }
      } catch (error) {
        console.error('Could not load public platform totals:', error)
        if (active) setStatus('unavailable')
      }
    }

    void loadStats()
    return () => { active = false }
  }, [])

  return <>
    <div className="stats" aria-label="Live Nava Udyog platform totals">
      {metrics.map(({ key, label }) => {
        const value = stats?.[key]
        return <div key={key}>
          <strong aria-label={value === undefined ? `${label} count unavailable` : `${value.toLocaleString('en-IN')} ${label}`}>
            {value === undefined ? '—' : value.toLocaleString('en-IN')}
          </strong>
          <span>{label}</span>
        </div>
      })}
    </div>
    <p className="stats-caption" role="status" aria-live="polite">
      {status === 'loading' ? 'Loading live platform totals…' : status === 'ready' ? 'Live totals from Nava Udyog' : 'Live totals are temporarily unavailable'}
    </p>
  </>
}
