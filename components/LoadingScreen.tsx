'use client'

import { useEffect, useState } from 'react'
import Logo from './Logo'
import './loading-screen.css'

const stages = [
  { name: 'Job search', title: 'Find work that fits', description: 'Your skills are matched to jobs near you.', badge: 'Live' },
  { name: 'Hiring', title: 'Hire without the hassle', description: 'Meet skilled workers who fit your team.', badge: 'Live' },
  { name: 'Attendance', title: 'Know who is on site', description: 'Keep your whole team in view.', badge: 'Coming soon' },
  { name: 'Payroll', title: 'Pay on time, every time', description: 'Payroll and compliance, in one place.', badge: 'Coming soon' },
  { name: 'Leave', title: 'Leave without the back-and-forth', description: 'Request, approve and track leave easily.', badge: 'Coming soon' },
  { name: 'Training', title: 'Grow your team’s skills', description: 'Build skills that open up better work.', badge: 'Coming soon' },
]

function LoaderArt({ stage }: { stage: number }) {
  return <svg className={`loader-art loader-art-${stage}`} viewBox="0 0 240 200" role="img" aria-label={`${stages[stage].name} illustration`}>
    <circle cx="120" cy="100" r="88" fill="var(--loader-soft)" />
    {stage === 0 && <g className="loader-drawing"><circle cx="48" cy="75" r="14" fill="var(--loader-primary)"/><path d="M22 120a26 26 0 0 1 52 0z" fill="var(--loader-primary)"/><path d="M99 57h112M99 100h112M99 143h112" stroke="var(--loader-line)" strokeWidth="3" strokeDasharray="5 6"/><g fill="var(--loader-surface)" stroke="var(--loader-ink)" strokeWidth="2"><rect x="115" y="39" width="100" height="36" rx="8"/><rect x="115" y="82" width="100" height="36" rx="8"/><rect x="115" y="125" width="100" height="36" rx="8"/></g><g fill="var(--loader-primary)"><circle cx="132" cy="57" r="7"/><circle cx="132" cy="100" r="7"/><circle cx="132" cy="143" r="7"/></g><rect className="loader-highlight" x="112" y="79" width="106" height="42" rx="10" fill="none" stroke="var(--loader-coral)" strokeWidth="4"/><path d="m79 100 24 0 10-8" fill="none" stroke="var(--loader-coral)" strokeWidth="4" strokeLinecap="round"/><circle cx="193" cy="87" r="9" fill="var(--loader-coral)"/><path d="m188 87 4 4 7-8" fill="none" stroke="var(--loader-ink)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></g>}
    {stage === 1 && <g className="loader-drawing"><path d="M38 157h164" stroke="var(--loader-ink)" strokeWidth="5" strokeLinecap="round"/><g fill="var(--loader-primary)"><circle cx="65" cy="112" r="15"/><path d="M39 157a26 26 0 0 1 52 0z"/><circle cx="175" cy="112" r="15" opacity=".65"/><path d="M149 157a26 26 0 0 1 52 0z" opacity=".65"/></g><circle className="loader-person" cx="120" cy="112" r="15" fill="var(--loader-coral)"/><path className="loader-person" d="M94 157a26 26 0 0 1 52 0z" fill="var(--loader-coral)"/><circle cx="144" cy="97" r="12" fill="var(--loader-primary)"/><path d="m138 97 4 4 8-9" fill="none" stroke="var(--loader-on)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></g>}
    {stage === 2 && <g className="loader-drawing"><circle cx="120" cy="97" r="53" fill="var(--loader-surface)" stroke="var(--loader-primary)" strokeWidth="8"/><path d="M120 61v37l28-15" fill="none" stroke="var(--loader-ink)" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/><circle cx="120" cy="98" r="6" fill="var(--loader-coral)"/><circle cx="178" cy="151" r="17" fill="var(--loader-primary)"/><path d="m170 151 5 5 10-11" fill="none" stroke="var(--loader-on)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></g>}
    {stage === 3 && <g className="loader-drawing"><rect x="49" y="48" width="142" height="112" rx="12" fill="var(--loader-surface)" stroke="var(--loader-ink)" strokeWidth="3"/><path d="M50 73h140" stroke="var(--loader-line)" strokeWidth="3"/><circle cx="85" cy="117" r="21" fill="var(--loader-coral)"/><text x="85" y="125" textAnchor="middle" fontFamily="Manrope,sans-serif" fontWeight="800" fontSize="25" fill="var(--loader-ink)">₹</text><path d="M122 106h45M122 122h34M122 138h41" stroke="var(--loader-primary)" strokeWidth="6" strokeLinecap="round"/><path d="m158 41 9-12 9 12" fill="none" stroke="var(--loader-primary)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/></g>}
    {stage === 4 && <g className="loader-drawing"><rect x="54" y="43" width="132" height="122" rx="11" fill="var(--loader-surface)" stroke="var(--loader-ink)" strokeWidth="3"/><path d="M55 54a11 11 0 0 1 11-11h108a11 11 0 0 1 11 11v21H55z" fill="var(--loader-primary)"/><g fill="var(--loader-line)"><circle cx="78" cy="99" r="6"/><circle cx="103" cy="99" r="6"/><circle cx="128" cy="99" r="6"/><circle cx="153" cy="99" r="6"/><circle cx="78" cy="124" r="6"/><circle cx="103" cy="124" r="6"/><circle cx="128" cy="124" r="6"/></g><rect x="145" y="113" width="30" height="30" rx="7" fill="var(--loader-coral)"/><path d="m152 128 5 5 10-11" fill="none" stroke="var(--loader-ink)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></g>}
    {stage === 5 && <g className="loader-drawing"><path d="M57 157h132" stroke="var(--loader-ink)" strokeWidth="4" strokeLinecap="round"/><rect x="66" y="123" width="25" height="34" rx="4" fill="var(--loader-primary)" opacity=".55"/><rect x="105" y="99" width="25" height="58" rx="4" fill="var(--loader-primary)" opacity=".75"/><rect x="144" y="72" width="25" height="85" rx="4" fill="var(--loader-primary)"/><path d="m70 104 39-20 26 1 32-37" fill="none" stroke="var(--loader-coral)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><path d="m156 48 12-3-2 12" fill="none" stroke="var(--loader-coral)" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/><circle cx="168" cy="45" r="8" fill="var(--loader-coral)"/></g>}
  </svg>
}

export default function LoadingScreen() {
  const [visible, setVisible] = useState(false)
  const [stage, setStage] = useState(0)

  useEffect(() => {
    const showTimer = window.setTimeout(() => setVisible(true), 450)
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const stageTimer = reducedMotion ? undefined : window.setInterval(() => setStage((current) => (current + 1) % stages.length), 3600)
    return () => {
      window.clearTimeout(showTimer)
      if (stageTimer) window.clearInterval(stageTimer)
    }
  }, [])

  return <>
    <div className="loader-progress" aria-hidden="true"><span /></div>
    <div className={`nava-loading ${visible ? 'visible' : ''}`} role="status" aria-live="polite" aria-label="Loading Nava Udyog">
      <div className="loader-top"><Logo className="loader-brand" /><span className="loader-top-note">New job. New start.</span></div>
      <div className="loader-stage">
        <LoaderArt stage={stage} />
        <div key={stage} className="loader-copy"><span className={`loader-badge ${stage > 1 ? 'coming' : ''}`}>{stages[stage].badge}</span><h1>{stages[stage].title}</h1><p>{stages[stage].description}</p></div>
      </div>
      <div className="loader-bottom"><ol className="loader-rail" aria-label="Nava Udyog services">{stages.map((item, index) => <li key={item.name} className={index === stage ? 'current' : index < stage ? 'complete' : ''}><span className="rail-track"><i /></span><span className="rail-label">{item.name}</span></li>)}</ol><p className="loader-status"><span className="loader-shape" aria-hidden="true"/>Loading your page</p></div>
    </div>
  </>
}
