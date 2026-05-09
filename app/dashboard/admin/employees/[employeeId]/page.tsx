import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { BRAND } from '@/lib/constants'
import { Phone, MapPin, Briefcase, ChevronLeft, User, Languages, GraduationCap, Sparkles, CircleDollarSign, Calendar } from 'lucide-react'
import Link from 'next/link'

export default async function AdminEmployeeDetailPage(props: { params: Promise<{ employeeId: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select(`
      *,
      employee_profiles(*)
    `)
    .eq('id', params.employeeId)
    .single()

  if (!profile) notFound()

  // Fetch detailed info
  const { data: education } = await supabase
    .from('education_qualifications')
    .select('*')
    .eq('employee_id', profile.id)
    .order('year_of_passing', { ascending: false })

  const { data: experiences } = await supabase
    .from('work_experiences')
    .select('*')
    .eq('employee_id', profile.id)
    .order('created_at', { ascending: false })

  const emp = profile.employee_profiles

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/dashboard/admin/employees" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-brand-navy mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Employee Directory
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           <div className="lg:col-span-2 space-y-8">
              {/* Header Card */}
              <div className="bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden">
                 <div className="p-8 md:p-12 bg-gradient-to-br from-brand-navy to-[#0D1250] text-white">
                    <div className="flex justify-between items-start gap-6 mb-8">
                       <div>
                          <h1 className="text-3xl md:text-5xl font-black tracking-tighter">{profile.full_name}</h1>
                          <div className="flex items-center text-brand-light font-bold mt-2">
                             <MapPin className="w-4 h-4 mr-2 opacity-70" />
                             {emp?.city || 'City not set'}
                          </div>
                       </div>
                    </div>

                    <div className="flex flex-wrap gap-4">
                       <div className="bg-white/10 text-white border border-white/20 px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
                          <Phone className="w-4 h-4" /> {profile.phone}
                       </div>
                       {emp?.alternate_number && (
                           <div className="bg-white/5 text-white/80 border border-white/10 px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2">
                                Alt: {emp.alternate_number}
                           </div>
                       )}
                    </div>
                 </div>

                 <div className="p-8 md:p-12 space-y-16">
                    {/* Personal & Background */}
                    <section>
                       <SectionTitle title="Personal Details" icon={<User className="w-5 h-5 text-brand-amber" />} />
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-10">
                          <InfoItem label="Father/Mother Name" value={emp?.father_mother_name} />
                          <InfoItem label="Date of Birth" value={emp?.dob} />
                          <InfoItem label="Gender" value={emp?.gender} />
                          <InfoItem label="Current Address" value={emp?.current_address} fullWidth />
                          <InfoItem label="Permanent Address" value={emp?.permanent_address} fullWidth />
                          <InfoItem label="Total Experience" value={`${emp?.years_experience} (${emp?.fresher_experienced})`} />
                          <InfoItem label="Expected Salary" value={emp?.expected_salary} />
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
                 </div>
              </div>
           </div>

           {/* Sidebar */}
           <div className="space-y-8">
              <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                 <h3 className="font-black text-gray-900 mb-6 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-brand-amber" />
                    Skills & Preferences
                 </h3>
                 <div className="space-y-8">
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Preferred Location</div>
                        <div className="text-sm font-bold text-gray-700">{emp?.preferred_location || 'Not specified'}</div>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Technical Skills</div>
                        <div className="flex flex-wrap gap-2">
                            {emp?.technical_skills?.map((s: string) => (
                                <span key={s} className="bg-brand-navy/5 text-brand-navy px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight">
                                    {s}
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Languages</div>
                        <div className="flex flex-wrap gap-2">
                            {emp?.languages?.map((l: string) => (
                                <span key={l} className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-bold">
                                    {l}
                                </span>
                            ))}
                        </div>
                    </div>
                 </div>
              </section>

              <section className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                 <h3 className="font-black text-gray-900 mb-4 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-brand-amber" />
                    Platform Info
                 </h3>
                 <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-bold">Registered On</span>
                        <span className="text-gray-700 font-black">{new Date(profile.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-bold">Profile Status</span>
                        <span className="text-brand-navy font-black">{emp?.declaration_accepted ? 'VERIFIED' : 'PENDING'}</span>
                    </div>
                 </div>
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
