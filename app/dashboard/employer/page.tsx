import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EmployerDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'employer') redirect('/auth/login')

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, applications(count)')
    .eq('employer_id', user.id)

  const activeJobs = jobs?.filter(j => j.status === 'active').length || 0
  const totalApplications = jobs?.reduce((sum, job) => sum + (job.applications?.length || 0), 0) || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Employer Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Active Jobs</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">{activeJobs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Total Applications</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">{totalApplications}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-700">Total Jobs Posted</h2>
          <p className="text-3xl font-bold text-purple-600 mt-2">{jobs?.length || 0}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Your Job Listings</h2>
          <Link 
            href="/dashboard/employer/jobs/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Post New Job
          </Link>
        </div>

        {jobs?.length === 0 ? (
          <p className="text-gray-600">No jobs posted yet. <Link href="/dashboard/employer/jobs/new" className="text-blue-600 hover:underline">Post a job</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Title</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Applications</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs?.map((job) => (
                  <tr key={job.id} className="border-t">
                    <td className="px-6 py-3">{job.title}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-sm ${
                        job.status === 'active' ? 'bg-green-100 text-green-800' :
                        job.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">{job.applications?.length || 0}</td>
                    <td className="px-6 py-3">
                      <Link href={`/dashboard/employer/jobs/${job.id}`} className="text-blue-600 hover:underline mr-4">
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}