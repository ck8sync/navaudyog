import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/auth/login')

  // Fetch metrics
  const { count: employeeCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'employee')

  const { count: employerCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'employer')

  const { count: activeJobsCount } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active')

  const { count: applicationsCount } = await supabase
    .from('applications')
    .select('*', { count: 'exact', head: true })

  const { data: applications } = await supabase
    .from('applications')
    .select('status')

  const hiredCount = applications?.filter(a => a.status === 'hired').length || 0
  const successRate = applicationsCount && hiredCount ? ((hiredCount / applicationsCount) * 100).toFixed(1) : '0'

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-700">Total Employees</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">{employeeCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-700">Total Employers</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">{employerCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-700">Active Jobs</h2>
          <p className="text-3xl font-bold text-purple-600 mt-2">{activeJobsCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-700">Total Applications</h2>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{applicationsCount || 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-sm font-medium text-gray-700">Success Rate</h2>
          <p className="text-3xl font-bold text-red-600 mt-2">{successRate}%</p>
        </div>
      </div>

      {/* Admin Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/admin/employees" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-2">Employees</h2>
          <p className="text-gray-600">View all employee data and manage users</p>
        </Link>
        <Link href="/dashboard/admin/employers" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-2">Employers</h2>
          <p className="text-gray-600">View all employer data and manage accounts</p>
        </Link>
        <Link href="/dashboard/admin/jobs" className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
          <h2 className="text-lg font-semibold mb-2">Jobs</h2>
          <p className="text-gray-600">Moderate and manage job postings</p>
        </Link>
      </div>
    </div>
  )
}