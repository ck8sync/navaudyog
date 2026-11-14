import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { MapPin, Users, Calendar, Building2, ChevronLeft, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'
import CategoryBadge from '@/components/CategoryBadge'
import StatusBadge from '@/components/StatusBadge'
import ShareJobButton from '@/components/ShareJobButton'
import SubmitButton from '@/components/SubmitButton'
import { sendApplicationStatusEmail } from '@/lib/email/mailer'

export default async function JobDetailPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ applied?: string; apply_error?: string }>
}) {
  const params = await props.params
  const searchParams = await props.searchParams
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('*, employer_profiles!employer_id(*)')
    .eq('id', params.id)
    .maybeSingle()

  if (!job) notFound()

  const { data: { user } } = await supabase.auth.getUser()
  
  let application: { status: string; created_at: string } | null = null
  let role: string | null = null
  if (user) {
    const [{ data: appData }, { data: profileData }] = await Promise.all([
      supabase
        .from('applications')
        .select('status, created_at')
        .eq('job_id', job.id)
        .eq('employee_id', user.id)
        .maybeSingle(),
      supabase.from('profiles').select('role').eq('id', user.id).maybeSingle(),
    ])
    application = appData
    role = profileData?.role ?? null
  }

  async function applyToJob() {
    'use server'
    const supa = await createClient()
    const { data: { user: currentUser } } = await supa.auth.getUser()
    if (!currentUser) redirect('/auth/login')

    const { error } = await supa.from('applications').insert({
      job_id: params.id,
      employee_id: currentUser.id,
      status: 'applied',
    })

    if (error) {
      const message = error.code === '23505'
        ? 'You have already applied for this job.'
        : error.code === '42501'
          ? 'Only job seeker accounts can apply for active jobs.'
          : error.message
      redirect(`/jobs/${params.id}?apply_error=${encodeURIComponent(message)}`)
    }

    // Confirmation e-mail to the candidate (failure never blocks the application).
    if (currentUser.email) {
      const { data: me } = await supa.from('profiles').select('full_name').eq('id', currentUser.id).maybeSingle()
      await sendApplicationStatusEmail({
        to: currentUser.email,
        candidateName: me?.full_name || 'there',
        jobTitle: job.title,
        companyName: job.employer_profiles?.company_name,
        status: 'applied',
      })
    }

    revalidatePath('/dashboard/employee')
    revalidatePath(`/jobs/${params.id}`)
    redirect(`/jobs/${params.id}?applied=true`)
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
                <div className="flex items-center gap-4">
                  {job.employer_profiles?.logo_url ? (
                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 p-1 flex-shrink-0">
                      <img 
                        src={job.employer_profiles.logo_url} 
                        alt={job.employer_profiles.company_name}
                        className="w-full h-full object-contain rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-8 h-8 opacity-50" />
                    </div>
                  )}
                  <div className="flex items-center text-brand-light font-bold text-lg">
                    {job.employer_profiles?.company_name}
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
                 <div className="text-sm font-bold text-brand-light/70 uppercase tracking-widest mb-1">Monthly Salary</div>
                 <div className="text-3xl font-black">₹{job.pay_amount} <span className="text-sm font-bold">/ {job.pay_type}</span></div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm font-bold">
              <ShareJobButton title={job.title} />
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
                  <div className="flex gap-6 items-start">
                    {job.employer_profiles?.logo_url && (
                      <div className="w-20 h-20 rounded-2xl border border-gray-100 p-2 flex-shrink-0">
                        <img 
                          src={job.employer_profiles.logo_url} 
                          alt={job.employer_profiles.company_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}
                    <p className="text-gray-600 text-lg leading-relaxed">
                      {job.employer_profiles?.description || "A leading company in the industry providing excellent opportunities for growth."}
                    </p>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  {application ? (
                    <div className="text-center space-y-4">
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-2">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <h3 className="font-black text-gray-900">
                        {searchParams.applied ? 'Application submitted!' : 'Application Submitted'}
                      </h3>
                      <StatusBadge status={application.status} />
                      <p className="text-sm text-gray-500">You applied for this job on {new Date(application.created_at).toLocaleDateString()}</p>
                      <Link href="/dashboard/employee" className="inline-block text-sm font-bold text-brand-navy hover:underline">
                        Track status in your dashboard →
                      </Link>
                    </div>
                  ) : !user ? (
                    <div>
                      <h3 className="font-black text-gray-900 mb-4">Quick Apply</h3>
                      <p className="text-sm text-gray-500 mb-6">Sign in with your job seeker account to apply.</p>
                      <Link href="/auth/login" className="btn-primary block text-center w-full py-4 text-lg">
                        Sign in to Apply
                      </Link>
                    </div>
                  ) : role !== 'employee' ? (
                    <div>
                      <h3 className="font-black text-gray-900 mb-2">Quick Apply</h3>
                      <p className="text-sm text-gray-500">Only job seeker accounts can apply for jobs.</p>
                    </div>
                  ) : job.status !== 'active' ? (
                    <div>
                      <h3 className="font-black text-gray-900 mb-2">Applications closed</h3>
                      <p className="text-sm text-gray-500">This job is no longer accepting applications.</p>
                    </div>
                  ) : (
                    <form action={applyToJob}>
                      <h3 className="font-black text-gray-900 mb-4">Quick Apply</h3>
                      <p className="text-sm text-gray-500 mb-6">No resume needed. Your Nava Udyog profile will be shared with the employer.</p>
                      {searchParams.apply_error && (
                        <p role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-red-700">
                          {searchParams.apply_error}
                        </p>
                      )}
                      <SubmitButton className="btn-primary w-full py-4 text-lg" pendingLabel="Submitting…">
                        Apply Now
                      </SubmitButton>
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
