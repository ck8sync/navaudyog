import { createClient } from '@/lib/supabase/server'
import { BRAND } from '@/lib/constants'
import { Users, Building2, Briefcase, TrendingUp, CheckCircle2 } from 'lucide-react'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Fetch metrics
  const { count: employeesCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employee')
  const { count: employersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'employer')
  const { count: jobsCount } = await supabase.from('jobs').select('*', { count: 'exact', head: true }).eq('status', 'active')
  const { count: appsCount } = await supabase.from('applications').select('*', { count: 'exact', head: true })

  const metrics = [
    { label: 'Job Seekers', value: employeesCount || 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Employers', value: employersCount || 0, icon: Building2, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Active Jobs', value: jobsCount || 0, icon: Briefcase, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Applications', value: appsCount || 0, icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-black text-gray-900 mb-12">Platform Overview</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {metrics.map((m, i) => (
            <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
               <div className={`w-14 h-14 rounded-2xl ${m.bg} ${m.color} flex items-center justify-center mb-6`}>
                  <m.icon className="w-7 h-7" />
               </div>
               <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{m.label}</p>
               <p className="text-3xl font-black text-gray-900">{m.value}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <Link href="/dashboard/admin/employees" className="card-premium group">
              <h3 className="text-xl font-black mb-4">Employee Directory</h3>
              <p className="text-gray-500 mb-6 text-sm">Manage all job seekers, view profiles, and handle moderation.</p>
              <div className="flex justify-between items-center">
                 <span className="text-brand-navy font-bold">Go to Employees</span>
                 <Users className="w-5 h-5 text-brand-navy" />
              </div>
           </Link>
           <Link href="/dashboard/admin/employers" className="card-premium group">
              <h3 className="text-xl font-black mb-4">Employer Directory</h3>
              <p className="text-gray-500 mb-6 text-sm">Monitor company activities and manage business accounts.</p>
              <div className="flex justify-between items-center">
                 <span className="text-brand-navy font-bold">Go to Employers</span>
                 <Building2 className="w-5 h-5 text-brand-navy" />
              </div>
           </Link>
           <Link href="/dashboard/admin/jobs" className="card-premium group">
              <h3 className="text-xl font-black mb-4">Job Moderation</h3>
              <p className="text-gray-500 mb-6 text-sm">Review, approve, or close job listings across the platform.</p>
              <div className="flex justify-between items-center">
                 <span className="text-brand-navy font-bold">Go to Jobs</span>
                 <Briefcase className="w-5 h-5 text-brand-navy" />
              </div>
           </Link>
        </div>
      </div>
    </div>
  )
}