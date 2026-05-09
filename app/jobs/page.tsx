import { createClient } from '@/lib/supabase/server'

export default async function JobsPage() {
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, employer_profiles(company_name)')
    .eq('status', 'active')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Available Jobs</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {jobs?.map((job) => (
          <div key={job.id} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-2">{job.title}</h2>
            <p className="text-gray-600 mb-2">{job.employer_profiles?.company_name}</p>
            <p className="text-gray-600 mb-2">{job.location}</p>
            <p className="text-gray-600 mb-2">{job.pay_amount} {job.pay_type}</p>
            <p className="text-gray-600 mb-2">{job.category}</p>
            <p className="text-gray-600 mb-2">{job.openings} openings</p>
            <a href={`/jobs/${job.id}`} className="text-blue-600 hover:underline">View Details</a>
          </div>
        ))}
      </div>
    </div>
  )
}