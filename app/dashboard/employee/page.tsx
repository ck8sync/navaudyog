import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function EmployeeDashboard() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'employee') redirect('/auth/login')

  const { data: applications } = await supabase
    .from('applications')
    .select('*, jobs(*)')
    .eq('employee_id', user.id)

  const { data: savedJobs } = await supabase
    .from('saved_jobs')
    .select('*, jobs(*)')
    .eq('employee_id', user.id)

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Your Applications</h1>

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Application History</h2>
        {applications?.length === 0 ? (
          <p className="text-gray-600">No applications yet.</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">Job Title</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Applied Date</th>
                </tr>
              </thead>
              <tbody>
                {applications?.map((app) => (
                  <tr key={app.id} className="border-t">
                    <td className="px-6 py-3">{app.jobs?.title}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded text-sm font-semibold ${
                        app.status === 'applied' ? 'bg-blue-100 text-blue-800' :
                        app.status === 'reviewing' ? 'bg-yellow-100 text-yellow-800' :
                        app.status === 'interview' ? 'bg-purple-100 text-purple-800' :
                        app.status === 'hired' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {app.status}
                      </span>
                    </td>
                    <td className="px-6 py-3">{new Date(app.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-semibold mb-4">Saved Jobs</h2>
        {savedJobs?.length === 0 ? (
          <p className="text-gray-600">No saved jobs yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedJobs?.map((saved) => (
              <div key={saved.id} className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2">{saved.jobs?.title}</h3>
                <p className="text-gray-600 mb-2">{saved.jobs?.location}</p>
                <Link href={`/jobs/${saved.job_id}`} className="text-blue-600 hover:underline">
                  View & Apply
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}