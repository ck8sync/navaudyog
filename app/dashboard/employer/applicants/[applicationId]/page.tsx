import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BRAND } from '@/lib/constants'
import { Phone, MessageSquare, MapPin, Briefcase, ChevronLeft, User, Languages, Calendar } from 'lucide-react'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'

export default async function ApplicantDetailPage(props: { params: Promise<{ applicationId: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  const { data: app } = await supabase
    .from('applications')
    .select(`
      *,
      profiles(
        *,
        employee_profiles(*)
      ),
      jobs(title)
    `)
    .eq('id', params.applicationId)
    .single()

  if (!app) notFound()

  const phone = app.profiles?.phone?.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${app.profiles?.full_name}, I saw your application on Navaudyog...`)}`

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/employer/applicants" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-brand-navy mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Kanban Board
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-8 md:p-12 bg-gradient-to-br from-brand-navy to-[#0D1250] text-white">
                    <div className="flex justify-between items-start gap-6 mb-8">
                       <div>
                          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">{app.profiles?.full_name}</h1>
                          <div className="flex items-center text-brand-light font-bold mt-2">
                             <MapPin className="w-4 h-4 mr-2 opacity-70" />
                             {app.profiles?.employee_profiles?.city}
                          </div>
                       </div>
                       <StatusBadge status={app.status} className="bg-white/10 text-white border-white/20" />
                    </div>

                    <div className="flex flex-wrap gap-4">
                       <a href={`tel:+91${phone}`} className="btn-accent flex items-center gap-2 py-3 px-8 text-sm">
                          <Phone className="w-4 h-4" /> Call Candidate
                       </a>
                       <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 flex items-center gap-2 py-3 px-8 rounded-xl font-bold text-sm transition-all">
                          <MessageSquare className="w-4 h-4" /> WhatsApp
                       </a>
                    </div>
                 </div>

                 <div className="p-8 md:p-12 space-y-12">
                    <section>
                       <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                          <User className="w-5 h-5 mr-3 text-brand-amber" />
                          Candidate Background
                       </h2>
                       <div className="grid grid-cols-2 gap-8">
                          <div>
                             <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Experience</div>
                             <div className="text-lg font-bold text-gray-700">{app.profiles?.employee_profiles?.years_experience}</div>
                          </div>
                          <div>
                             <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Availability</div>
                             <div className="text-lg font-bold text-gray-700">{app.profiles?.employee_profiles?.availability}</div>
                          </div>
                          <div>
                             <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Pay Preference</div>
                             <div className="text-lg font-bold text-gray-700">{app.profiles?.employee_profiles?.pay_preference}</div>
                          </div>
                          <div>
                             <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Applied For</div>
                             <div className="text-lg font-bold text-brand-navy">{app.jobs?.title}</div>
                          </div>
                       </div>
                    </section>

                    <section>
                       <h2 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                          <Languages className="w-5 h-5 mr-3 text-brand-amber" />
                          Skills & Languages
                       </h2>
                       <div className="space-y-6">
                          <div>
                             <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Job Categories</div>
                             <div className="flex flex-wrap gap-2">
                                {app.profiles?.employee_profiles?.job_categories?.map((cat: string) => (
                                   <span key={cat} className="bg-brand-light text-brand-navy px-3 py-1 rounded-full text-xs font-black uppercase tracking-tight">
                                      {cat}
                                   </span>
                                ))}
                             </div>
                          </div>
                          <div>
                             <div className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Languages Spoken</div>
                             <div className="flex flex-wrap gap-2">
                                {app.profiles?.employee_profiles?.languages?.map((lang: string) => (
                                   <span key={lang} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold">
                                      {lang}
                                   </span>
                                ))}
                             </div>
                          </div>
                       </div>
                    </section>
                 </div>
              </div>
           </div>

           <div className="space-y-8">
              <section className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
                 <h3 className="font-black text-gray-900 mb-4">Application Note</h3>
                 <p className="text-gray-500 italic text-sm leading-relaxed">
                    {app.note ? `"${app.note}"` : "The candidate did not leave a specific note with this application."}
                 </p>
                 <div className="mt-6 pt-6 border-t border-gray-50 flex items-center text-xs text-gray-400 font-bold">
                    <Calendar className="w-3.5 h-3.5 mr-2" />
                    APPLIED ON {new Date(app.created_at).toLocaleDateString()}
                 </div>
              </section>

              <section className="bg-brand-navy rounded-3xl p-8 text-white">
                 <h3 className="font-black mb-4">Recruiter Checklist</h3>
                 <ul className="space-y-4 text-sm font-bold">
                    <li className="flex items-start gap-3">
                       <CheckCircle className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                       Verify candidate identity
                    </li>
                    <li className="flex items-start gap-3">
                       <CheckCircle className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                       Check experience validity
                    </li>
                    <li className="flex items-start gap-3">
                       <CheckCircle className="w-4 h-4 text-brand-amber shrink-0 mt-0.5" />
                       Schedule phone interview
                    </li>
                 </ul>
              </section>
           </div>
        </div>
      </div>
    </div>
  )
}

function CheckCircle({ className }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
