'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, ArrowRight, Sparkles } from 'lucide-react'

const TRENDING_TAGS = [
  { label: 'Delivery Rider', category: 'Delivery & Logistics' },
  { label: 'Security Guard', category: 'Security & Housekeeping' },
  { label: 'Warehouse Helper', category: 'Delivery & Logistics' },
  { label: 'Commercial Driver', category: 'Driver & Transport' },
  { label: 'Machine Operator', category: 'Manufacturing & Factory' },
]

export default function HeroSearch() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (query.trim()) params.set('query', query.trim())
    if (location.trim()) params.set('location', location.trim())
    router.push(`/jobs?${params.toString()}`)
  }

  const handleQuickTag = (tag: { label: string; category: string }) => {
    router.push(`/jobs?category=${encodeURIComponent(tag.category)}`)
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search Bar Container */}
      <form 
        onSubmit={handleSearch}
        className="bg-white/95 backdrop-blur-xl p-2.5 sm:p-3.5 rounded-3xl shadow-2xl border border-gray-200/80 hover:border-brand-navy/30 transition-all duration-300 flex flex-col md:flex-row gap-2.5 items-stretch md:items-center"
      >
        {/* Job Title / Role Input */}
        <div className="flex-1 relative flex items-center min-w-0 px-3.5 py-2.5 md:py-1.5">
          <Search className="w-5 h-5 text-brand-navy shrink-0 mr-3" />
          <div className="flex-1 text-left">
            <label htmlFor="hero-job-input" className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
              Role or Keyword
            </label>
            <input
              id="hero-job-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Driver, Security, Delivery, Electrician..."
              className="w-full bg-transparent text-gray-900 font-bold placeholder-gray-400 text-sm sm:text-base outline-none truncate"
            />
          </div>
        </div>

        {/* Divider for desktop */}
        <div className="hidden md:block w-px h-10 bg-gray-200 shrink-0" />

        {/* Location Input */}
        <div className="flex-1 relative flex items-center min-w-0 px-3.5 py-2.5 md:py-1.5">
          <MapPin className="w-5 h-5 text-brand-amber shrink-0 mr-3" />
          <div className="flex-1 text-left">
            <label htmlFor="hero-loc-input" className="block text-[10px] font-black uppercase tracking-wider text-gray-400">
              City / Location
            </label>
            <input
              id="hero-loc-input"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Bangalore, Mumbai, Delhi NCR, Pune..."
              className="w-full bg-transparent text-gray-900 font-bold placeholder-gray-400 text-sm sm:text-base outline-none truncate"
            />
          </div>
        </div>

        {/* Search CTA Button */}
        <button
          type="submit"
          className="btn-primary py-4 px-8 text-base shrink-0 group flex items-center justify-center gap-2 rounded-2xl"
        >
          <span>Find Jobs</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </form>

      {/* Trending Quick Search Tags */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="font-black text-gray-400 uppercase tracking-widest text-[11px] flex items-center mr-1">
          <Sparkles className="w-3.5 h-3.5 mr-1 text-brand-amber" /> Popular:
        </span>
        {TRENDING_TAGS.map((tag) => (
          <button
            key={tag.label}
            type="button"
            onClick={() => handleQuickTag(tag)}
            className="px-3 py-1.5 rounded-full bg-white/80 hover:bg-white text-gray-700 hover:text-brand-navy border border-gray-200/90 hover:border-brand-navy/30 font-bold text-xs shadow-xs transition-all hover:scale-105 cursor-pointer"
          >
            {tag.label}
          </button>
        ))}
      </div>
    </div>
  )
}
