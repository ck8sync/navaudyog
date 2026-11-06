import { createClient } from '@/lib/supabase/server'
import { Briefcase, MapPin, Search, Users } from 'lucide-react'
import { EXPERIENCE_OPTIONS } from '@/lib/constants'

interface Candidate {
  employee_id: string
  full_name: string
  city: string | null
  state: string | null
  years_experience: string | null
  job_categories: string[]
  technical_skills: string[]
}

export default async function EmployerCandidatesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; experience?: string }>
}) {
  const params = await searchParams
  const query = params.q?.trim() || ''
  const experience = EXPERIENCE_OPTIONS.find(option => option === params.experience) || ''
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase.rpc('search_job_seekers', {
    search_text: query || null,
    experience_level: experience || null,
  })
  const candidates = (data || []) as Candidate[]

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3 text-brand-navy">
            <Users className="h-7 w-7" />
            <span className="text-xs font-black uppercase tracking-[0.2em]">Employer Directory</span>
          </div>
          <h1 className="text-3xl font-black text-gray-900 sm:text-4xl">Find job seekers</h1>
          <p className="mt-2 max-w-2xl text-gray-600">Search by skill, trade, or location and filter by experience. Only candidates who opted in appear here.</p>
        </div>

        <form action="/dashboard/employer/candidates" method="get" className="mb-8 grid grid-cols-1 gap-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_auto] md:p-6">
          <label className="relative block">
            <span className="sr-only">Search skills, trade, or location</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="e.g. Welding, delivery, Bengaluru"
              className="w-full rounded-xl border border-gray-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10"
            />
          </label>
          <label>
            <span className="sr-only">Filter by experience</span>
            <select name="experience" defaultValue={experience} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-700 outline-none focus:border-brand-navy focus:ring-2 focus:ring-brand-navy/10">
              <option value="">Any experience</option>
              {EXPERIENCE_OPTIONS.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
          <button type="submit" className="rounded-xl bg-brand-navy px-6 py-3 text-sm font-black text-white transition hover:bg-brand-navy/90">Search candidates</button>
        </form>

        {error ? (
          <div role="alert" className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-sm font-semibold text-amber-900">
            The candidate directory needs its database migration before it can be used. Apply <code>008_employer_candidate_directory.sql</code> in Supabase, then reload this page.
          </div>
        ) : candidates.length ? (
          <>
            <p className="mb-4 text-sm font-bold text-gray-500">{candidates.length === 100 ? 'Showing the first 100 matches' : `${candidates.length} ${candidates.length === 1 ? 'candidate' : 'candidates'} found`}</p>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {candidates.map(candidate => (
                <article key={candidate.employee_id} className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-black text-gray-900">{candidate.full_name}</h2>
                  <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold text-gray-500">
                    <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-brand-amber" />{[candidate.city, candidate.state].filter(Boolean).join(', ') || 'Location not provided'}</span>
                    <span className="inline-flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-brand-amber" />{candidate.years_experience || 'Experience not provided'}</span>
                  </div>
                  {!!candidate.technical_skills?.length && (
                    <div className="mt-5">
                      <h3 className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Skills</h3>
                      <div className="flex flex-wrap gap-2">{candidate.technical_skills.map(skill => <span key={skill} className="rounded-lg bg-brand-navy/5 px-3 py-1.5 text-xs font-bold text-brand-navy">{skill}</span>)}</div>
                    </div>
                  )}
                  {!!candidate.job_categories?.length && (
                    <div className="mt-4">
                      <h3 className="mb-2 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Trades and categories</h3>
                      <div className="flex flex-wrap gap-2">{candidate.job_categories.map(category => <span key={category} className="rounded-lg bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-900">{category}</span>)}</div>
                    </div>
                  )}
                  <p className="mt-5 border-t border-gray-100 pt-4 text-xs text-gray-400">Contact details are kept private in the directory.</p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <Users className="mx-auto h-10 w-10 text-gray-300" />
            <h2 className="mt-4 text-lg font-black text-gray-800">No candidates found</h2>
            <p className="mx-auto mt-2 max-w-lg text-sm text-gray-500">Try another skill or experience filter. Job seekers must opt in from their profile before they appear in this directory.</p>
          </div>
        )}
      </div>
    </main>
  )
}
