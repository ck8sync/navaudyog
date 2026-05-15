import { createClient } from '@/lib/supabase/server'
import { BRAND } from '@/lib/constants'
import { Briefcase, Bookmark, User, Clock, CheckCircle2, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import CategoryBadge from '@/components/CategoryBadge'

export default async function EmployeeDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch applications
  const { data: applications } = await supabase
    .from('applications')
    .select('*, jobs(*, employer_profiles!employer_id(company_name, logo_url))')
    .eq('employee_id', user.id)
    .order('created_at', { ascending: false })

  // Fetch saved jobs
  const { data: savedJobs } = await supabase
    .from('saved_jobs')
    .select('*, jobs(*, employer_profiles!employer_id(company_name, logo_url))')
    .eq('employee_id', user.id)

  // Fetch profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  // Fetch recommended jobs (recent active jobs)
  const { data: recommendedJobs } = await supabase
    .from('jobs')
    .select('*, employer_profiles(company_name, logo_url)')
    .eq('status', 'active')
    .limit(3)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">Namaste, {profile?.full_name}!</h1>
            <p className="text-lg text-gray-600">Track your applications and find new opportunities.</p>
          </div>
          <Link href="/profile/employee" className="btn-primary flex items-center py-3 px-6">
            <User className="w-5 h-5 mr-2" /> Edit Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Applications Column */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-black text-gray-900 flex items-center">
                   <Briefcase className="w-6 h-6 mr-3 text-brand-navy" />
                   My Applications
                 </h2>
                 <span className="bg-brand-light text-brand-navy px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                    {applications?.length || 0} TOTAL
                 </span>
              </div>

              {applications && applications.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((app: any) => (
                    <div key={app.id} className="card-premium flex items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        {app.jobs?.employer_profiles?.logo_url ? (
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-gray-100 p-1 flex-shrink-0 shadow-sm">
                            <img 
                              src={app.jobs.employer_profiles.logo_url} 
                              alt={app.jobs.employer_profiles.company_name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-brand-navy">
                             <Briefcase className="w-6 h-6" />
                          </div>
                        )}
                        <div>
                           <h3 className="font-black text-gray-900">{app.jobs?.title}</h3>
                           <p className="text-sm text-brand-amber font-bold">{app.jobs?.employer_profiles?.company_name}</p>
                           <div className="flex items-center text-xs text-gray-400 mt-1">
                              <Clock className="w-3 h-3 mr-1" /> Applied {new Date(app.created_at).toLocaleDateString()}
                           </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                         <StatusBadge status={app.status} />
                         <Link href={`/jobs/${app.job_id}`} className="text-xs font-bold text-gray-400 hover:text-brand-navy flex items-center">
                            View Job <ChevronRight className="w-3 h-3 ml-1" />
                         </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                   <p className="text-gray-500 mb-6">You haven't applied to any jobs yet.</p>
                   <Link href="/jobs" className="btn-primary inline-block">Browse Jobs Now</Link>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar: Saved Jobs & Stats */}
          <div className="space-y-8">
            <section className="bg-brand-navy rounded-3xl p-8 text-white">
               <h3 className="text-xl font-black mb-6">Job Search Stats</h3>
               <div className="space-y-6">
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                     <span className="text-brand-light/70 font-bold">Applied</span>
                     <span className="text-2xl font-black">{applications?.length || 0}</span>
                  </div>
                  <div className="flex justify-between items-center pb-4 border-b border-white/10">
                     <span className="text-brand-light/70 font-bold">Interviews</span>
                     <span className="text-2xl font-black text-brand-amber">
                        {applications?.filter((a: any) => a.status === 'interview').length || 0}
                     </span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-brand-light/70 font-bold">Saved Jobs</span>
                     <span className="text-2xl font-black">{savedJobs?.length || 0}</span>
                  </div>
               </div>
            </section>

            <section>
               <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center">
                  <Bookmark className="w-5 h-5 mr-3 text-brand-amber" />
                  Saved Jobs
               </h3>
               {savedJobs && savedJobs.length > 0 ? (
                 <div className="space-y-4">
                    {savedJobs.map((saved: any) => (
                      <Link key={saved.id} href={`/jobs/${saved.job_id}`} className="block group">
                        <div className="bg-white p-4 rounded-2xl border border-gray-100 group-hover:border-brand-navy transition-all shadow-sm group-hover:shadow-md">
                           <h4 className="font-black text-gray-900 group-hover:text-brand-navy transition-colors">{saved.jobs?.title}</h4>
                           <p className="text-xs text-gray-500 font-bold uppercase tracking-tight">{saved.jobs?.employer_profiles?.company_name}</p>
                        </div>
                      </Link>
                    ))}
                 </div>
               ) : (
                 <p className="text-sm text-gray-500 italic bg-white p-6 rounded-2xl border border-gray-100">No saved jobs yet.</p>
               )}
            </section>

            <section className="bg-white p-8 rounded-3xl border border-gray-100">
               <h3 className="text-lg font-black text-gray-900 mb-6">Explore Jobs</h3>
               <div className="space-y-4">
                  {recommendedJobs?.map((job: any) => (
                    <Link key={job.id} href={`/jobs/${job.id}`} className="block group">
                      <div className="flex items-center gap-3">
                        {job.employer_profiles?.logo_url ? (
                          <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-100 p-1 shrink-0">
                            <img 
                              src={job.employer_profiles.logo_url} 
                              alt={job.employer_profiles.company_name}
                              className="w-full h-full object-contain"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                             <Briefcase className="w-5 h-5 text-brand-navy" />
                          </div>
                        )}
                        <div className="min-w-0">
                           <h4 className="font-black text-sm text-gray-900 truncate group-hover:text-brand-navy transition-colors">{job.title}</h4>
                           <p className="text-[10px] text-gray-500 font-bold uppercase truncate">{job.employer_profiles?.company_name}</p>
                        </div>
                      </div>
                    </Link>
                  ))}
                  <Link href="/jobs" className="block text-center text-xs font-black text-brand-navy mt-6 hover:underline">
                     View All Jobs →
                  </Link>
               </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}