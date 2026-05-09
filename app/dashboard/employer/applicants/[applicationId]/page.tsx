import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BRAND } from '@/lib/constants'
import { Phone, MessageSquare, MapPin, Briefcase, ChevronLeft, User, Languages, Calendar, GraduationCap, Sparkles, Clock, CircleDollarSign } from 'lucide-react'
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

  // Fetch detailed info
  const { data: education } = await supabase
    .from('education_qualifications')
    .select('*')
    .eq('employee_id', app.employee_id)
    .order('year_of_passing', { ascending: false })

  const { data: experiences } = await supabase
    .from('work_experiences')
    .select('*')
    .eq('employee_id', app.employee_id)
    .order('created_at', { ascending: false })

  const phone = app.profiles?.phone?.replace(/\D/g, '')
  const whatsappUrl = `https://wa.me/91${phone}?text=${encodeURIComponent(`Hi ${app.profiles?.full_name}, I saw your application on Nava Udyog...`)}`
  const emp = app.profiles?.employee_profiles

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/employer/applicants" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-brand-navy mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Kanban Board
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              {/* Header Card */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-8 md:p-12 bg-gradient-to-br from-brand-navy to-[#0D1250] text-white">
                    <div className="flex justify-between items-start gap-6 mb-8">
                       <div>
                          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">{app.profiles?.full_name}</h1>
                          <div className="flex items-center text-brand-light font-bold mt-2">
                             <MapPin className="w-4 h-4 mr-2 opacity-70" />
                             {emp?.city}
                          </div>
                       </div>
                       <StatusBadge status={app.status} className="bg-white/10 text-white border-white/20" />
                    </div>

                    <div className="flex flex-wrap gap-4">
                       <a href={`tel:+91${phone}`} className="bg-brand-amber hover:bg-brand-amber/90 text-brand-navy px-8 py-3 rounded-xl font-black text-sm transition-all flex items-center gap-2">
                          <Phone className="w-4 h-4" /> Call Candidate
                       </a>
                       <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" /> WhatsApp
                       </a>
                    </div>
                 </div>

                 <div className="p-8 md:p-12 space-y-16">
                    {/* Personal & Background */}
                    <section>
                       <SectionTitle title="Candidate Background" icon={<User className="w-5 h-5 text-brand-amber" />} />
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                          <InfoItem label="Father/Mother Name" value={emp?.father_mother_name} />
                          <InfoItem label="Date of Birth" value={emp?.dob} />
                          <InfoItem label="Gender" value={emp?.gender} />
                          <InfoItem label="Current Address" value={emp?.current_address} fullWidth />
                          <InfoItem label="Experience" value={`${emp?.years_experience} (${emp?.fresher_experienced})`} />
                          <InfoItem label="Availability" value={emp?.notice_period || emp?.availability} />
                          <InfoItem label="Expected Salary" value={emp?.expected_salary} />
                          <InfoItem label="Applied For" value={app.jobs?.title} />
                       </div>
                    </section>

                    {/* Education */}
                    <section>
                       <SectionTitle title="Education" icon={<GraduationCap className="w-5 h-5 text-brand-amber" />} />
                       <div className="space-y-6">
                          {education && education.length > 0 ? (
                            education.map((edu: any) => (
                                <div key={edu.id} className="flex gap-6 items-start p-6 rounded-2xl bg-gray-50/50 border border-gray-50">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                        <GraduationCap className="w-6 h-6 text-brand-navy" />
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900">{edu.qualification}</div>
                                        <div className="text-sm font-bold text-gray-600">{edu.institution_name}</div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            {edu.board_university} • PASSING YEAR {edu.year_of_passing} • {edu.percentage_cgpa}
                                        </div>
                                    </div>
                                </div>
                            ))
                          ) : (
                            <p className="text-gray-400 italic">No education details provided.</p>
                          )}
                       </div>
                    </section>

                    {/* Experience */}
                    <section>
                       <SectionTitle title="Work History" icon={<Briefcase className="w-5 h-5 text-brand-amber" />} />
                       <div className="space-y-6">
                          {experiences && experiences.length > 0 ? (
                            experiences.map((work: any) => (
                                <div key={work.id} className="flex gap-6 items-start p-6 rounded-2xl bg-gray-50/50 border border-gray-50">
                                    <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0">
                                        <Briefcase className="w-6 h-6 text-brand-navy" />
                                    </div>
                                    <div>
                                        <div className="font-black text-gray-900">{work.designation}</div>
                                        <div className="text-sm font-bold text-gray-600">{work.company_name}</div>
                                        <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                                            {work.duration} • SALARY: {work.salary_drawn}
                                        </div>
                                        {work.reason_for_leaving && (
                                            <div className="mt-2 text-xs text-gray-500 italic">
                                                Reason for leaving: {work.reason_for_leaving}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))
                          ) : (
                            <p className="text-gray-400 italic">
                                {emp?.fresher_experienced === 'Fresher' ? 'Candidate is a Fresher.' : 'No detailed work history provided.'}
                            </p>
                          )}
                       </div>
                    </section>

                    {/* Skills */}
                    <section>
                       <SectionTitle title="Skills & Languages" icon={<Sparkles className="w-5 h-5 text-brand-amber" />} />
                       <div className="space-y-10">
                          <div>
                             <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Technical Skills</div>
                             <div className="flex flex-wrap gap-2">
                                {emp?.technical_skills?.length > 0 ? emp.technical_skills.map((skill: string) => (
                                   <span key={skill} className="bg-brand-navy/5 text-brand-navy px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight border border-brand-navy/10">
                                      {skill}
                                   </span>
                                )) : <span className="text-gray-400 italic text-sm">No specific skills listed.</span>}
                             </div>
                          </div>
                          <div>
                             <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Certifications</div>
                             <div className="flex flex-wrap gap-2">
                                {emp?.certifications?.length > 0 ? emp.certifications.map((cert: string) => (
                                   <span key={cert} className="bg-brand-amber/10 text-brand-amber-dark px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight border border-brand-amber/20">
                                      {cert}
                                   </span>
                                )) : <span className="text-gray-400 italic text-sm">No certifications listed.</span>}
                             </div>
                          </div>
                          <div>
                             <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Languages Spoken</div>
                             <div className="flex flex-wrap gap-3">
                                {emp?.languages?.map((lang: string) => (
                                   <div key={lang} className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-xl text-xs font-bold text-gray-600">
                                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300" />
                                      {lang}
                                   </div>
                                ))}
                             </div>
                          </div>
                       </div>
                    </section>
                 </div>
              </div>
           </div>

           {/* Sidebar */}
           <div className="space-y-8">
              <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                 <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                    <CircleDollarSign className="w-4 h-4 text-brand-amber" />
                    Job Preferences
                 </h3>
                 <div className="space-y-6">
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Preferred Location</div>
                        <div className="text-sm font-bold text-gray-700">{emp?.preferred_location || 'Not specified'}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Shift Preference</div>
                        <div className="text-sm font-bold text-gray-700">{emp?.shift_preference || 'Any'}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Expected Salary</div>
                        <div className="text-sm font-black text-brand-navy">{emp?.expected_salary || 'Negotiable'}</div>
                    </div>
                 </div>
              </section>

              <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                 <h3 className="font-black text-gray-900 mb-4">Application Note</h3>
                 <p className="text-gray-500 italic text-sm leading-relaxed">
                    {app.note ? `"${app.note}"` : "The candidate did not leave a specific note."}
                 </p>
                 <div className="mt-6 pt-6 border-t border-gray-50 flex items-center text-xs text-gray-400 font-bold">
                    <Calendar className="w-3.5 h-3.5 mr-2" />
                    APPLIED ON {new Date(app.created_at).toLocaleDateString()}
                 </div>
              </section>

              <section className="bg-brand-navy rounded-[2rem] p-10 text-white relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16" />
                 <h3 className="font-black mb-6 relative z-10">Recruiter Checklist</h3>
                 <ul className="space-y-5 text-sm font-bold relative z-10">
                    <li className="flex items-start gap-4">
                       <div className="w-5 h-5 rounded-full bg-brand-amber/20 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-brand-amber" />
                       </div>
                       Verify identity documents
                    </li>
                    <li className="flex items-start gap-4">
                       <div className="w-5 h-5 rounded-full bg-brand-amber/20 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-brand-amber" />
                       </div>
                       Check previous references
                    </li>
                    <li className="flex items-start gap-4">
                       <div className="w-5 h-5 rounded-full bg-brand-amber/20 flex items-center justify-center shrink-0 mt-0.5">
                          <div className="w-2 h-2 rounded-full bg-brand-amber" />
                       </div>
                       Schedule direct interview
                    </li>
                 </ul>
              </section>
           </div>
        </div>
      </div>
    </div>
  )
}

function SectionTitle({ title, icon }: { title: string, icon: React.ReactNode }) {
    return (
        <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center">
            <span className="mr-4">{icon}</span>
            {title}
        </h2>
    )
}

function InfoItem({ label, value, fullWidth = false }: { label: string, value: string | undefined | null, fullWidth?: boolean }) {
    return (
        <div className={fullWidth ? 'sm:col-span-2' : ''}>
            <div className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</div>
            <div className="text-lg font-bold text-gray-700">{value || '---'}</div>
        </div>
    )
}
