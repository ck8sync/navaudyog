import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { BRAND } from '@/lib/constants'
import { MapPin, IndianRupee, Users, Calendar, Building2, ChevronLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import CategoryBadge from '@/components/CategoryBadge'
import StatusBadge from '@/components/StatusBadge'

export default async function JobDetailPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('*, employer_profiles!employer_id(*)')
    .eq('id', params.id)
    .single()

  if (!job) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  
  let application = null
  if (user) {
    const { data: appData } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', job.id)
      .eq('employee_id', user.id)
      .single()
    application = appData
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/jobs" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-brand-navy mb-8 transition-colors">
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to All Jobs
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="p-8 md:p-12 bg-gradient-to-br from-brand-navy to-[#0D1250] text-white">
            <div className="flex flex-wrap justify-between items-start gap-6 mb-8">
              <div className="space-y-4">
                <CategoryBadge category={job.category} className="bg-white/10 text-white border-white/20" />
                <h1 className="text-3xl md:text-5xl font-black tracking-tighter">{job.title}</h1>
                <div className="flex items-center text-brand-light font-bold text-lg">
                  <Building2 className="w-5 h-5 mr-2 opacity-70" />
                  {job.employer_profiles?.company_name}
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                 <div className="text-sm font-bold text-brand-light/70 uppercase tracking-widest mb-1">Monthly Salary</div>
                 <div className="text-3xl font-black">₹{job.pay_amount} <span className="text-sm font-bold">/ {job.pay_type}</span></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-6 text-sm font-bold">
               <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
                  <MapPin className="w-4 h-4 mr-2" /> {job.location}
               </div>
               <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
                  <Users className="w-4 h-4 mr-2" /> {job.openings} Openings Available
               </div>
               <div className="flex items-center bg-white/10 px-4 py-2 rounded-full">
                  <Calendar className="w-4 h-4 mr-2" /> Posted {new Date(job.created_at).toLocaleDateString()}
               </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-10">
                <section>
                  <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-1 bg-brand-amber mr-3 rounded-full" />
                    Job Description
                  </h2>
                  <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
                    {job.description}
                  </div>
                </section>

                <section>
                   <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center">
                    <span className="w-8 h-1 bg-brand-amber mr-3 rounded-full" />
                    About the Company
                  </h2>
                  <p className="text-gray-600 text-lg">
                    {job.employer_profiles?.description || "A leading company in the industry providing excellent opportunities for growth."}
                  </p>
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  {application ? (
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="font-black text-gray-900">Application Submitted</h3>
                      <StatusBadge status={application.status} />
                      <p className="text-sm text-gray-500">You applied for this job on {new Date(application.created_at).toLocaleDateString()}</p>
                    </div>
                  ) : (
                    <form action={async () => {
                      'use server'
                      if (!user) redirect('/auth/login')
                      
                      const supabase = await createClient()
                      await supabase.from('applications').insert({
                        job_id: job.id,
                        employee_id: user.id,
                        status: 'applied'
                      })
                      redirect(`/jobs/${job.id}?applied=true`)
                    }}>
                      <h3 className="font-black text-gray-900 mb-4">Quick Apply</h3>
                      <p className="text-sm text-gray-500 mb-6">No resume needed. Your Navaudyog profile will be shared with the employer.</p>
                      <button type="submit" className="btn-primary w-full py-4 text-lg">
                        Apply Now
                      </button>
                    </form>
                  )}
                </div>

                <div className="p-6 border border-gray-100 rounded-2xl">
                   <h4 className="font-black text-xs uppercase tracking-widest text-gray-400 mb-4">Hiring Location</h4>
                   <div className="flex items-center text-gray-700 font-bold">
                      <MapPin className="w-5 h-5 mr-2 text-brand-amber" />
                      {job.location}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}