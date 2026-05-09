import { createClient } from '@/lib/supabase/server'
import { BRAND } from '@/lib/constants'
import { Briefcase, Users, PlusCircle, LayoutDashboard, ChevronRight, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default async function EmployerDashboard() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch stats
  const { data: jobs } = await supabase
    .from('jobs')
    .select('id, status')
    .eq('employer_id', user.id)

  const activeJobsCount = jobs?.filter(j => j.status === 'active').length || 0
  const totalJobsCount = jobs?.length || 0

  const { count: totalApplicants } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })
    .in('job_id', jobs?.map(j => j.id) || [])

  const { data: profile } = await supabase
    .from('employer_profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const stats = [
    { title: 'Active Jobs', value: activeJobsCount, icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Applicants', value: totalApplicants || 0, icon: Users, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Jobs Posted', value: totalJobsCount, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">{profile?.company_name || 'Employer Dashboard'}</h1>
            <p className="text-lg text-gray-600">Welcome to your hiring command center.</p>
          </div>
          <div className="flex gap-4">
             <Link href="/dashboard/employer/jobs/new" className="btn-accent flex items-center py-3 px-6">
                <PlusCircle className="w-5 h-5 mr-2" /> Post New Job
             </Link>
             <Link href="/profile/employer" className="btn-primary flex items-center py-3 px-6">
                Edit Profile
             </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {stats.map((stat, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm flex items-center gap-6">
               <div className={`w-16 h-16 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
               </div>
               <div>
                  <p className="text-sm font-black text-gray-400 uppercase tracking-widest">{stat.title}</p>
                  <p className="text-3xl font-black text-gray-900">{stat.value}</p>
               </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Quick Actions */}
           <section className="space-y-6">
              <h2 className="text-2xl font-black text-gray-900">Manage Hiring</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 <Link href="/dashboard/employer/applicants" className="card-premium group p-8">
                    <Users className="w-10 h-10 text-brand-navy mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black mb-1">View Applicants</h3>
                    <p className="text-sm text-gray-500 mb-4">Review candidates on the Kanban board.</p>
                    <span className="text-brand-navy font-bold flex items-center text-sm">
                       Go to Applicants <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                 </Link>
                 <Link href="/dashboard/employer/jobs" className="card-premium group p-8">
                    <Briefcase className="w-10 h-10 text-brand-amber mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-black mb-1">My Job Listings</h3>
                    <p className="text-sm text-gray-500 mb-4">Edit or close your active job postings.</p>
                    <span className="text-brand-amber font-bold flex items-center text-sm">
                       Manage Jobs <ChevronRight className="w-4 h-4 ml-1" />
                    </span>
                 </Link>
              </div>
           </section>

           {/* Hiring Tips or Support */}
           <section className="bg-brand-navy rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
              <h2 className="text-2xl font-black mb-6">Need Help Hiring?</h2>
              <ul className="space-y-4 mb-8">
                 <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-amber flex items-center justify-center shrink-0 mt-1">
                       <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-bold">Post jobs with clear salary info for 3x more applicants.</p>
                 </li>
                 <li className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-brand-amber flex items-center justify-center shrink-0 mt-1">
                       <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <p className="font-bold">Mention daily or weekly wage options to attract local talent.</p>
                 </li>
              </ul>
              <button className="bg-white text-brand-navy px-6 py-3 rounded-xl font-black">
                 Contact Hiring Support
              </button>
           </section>
        </div>
      </div>
    </div>
  )
}

function CheckCircle2({ className }: { className?: string }) {
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