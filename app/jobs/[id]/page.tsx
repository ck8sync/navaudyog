import { createClient } from '@/lib/supabase/server'
import ApplyButton from './ApplyButton'

export default async function JobDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient()

  const { data: job } = await supabase
    .from('jobs')
    .select('*, employer_profiles(company_name)')
    .eq('id', params.id)
    .single()

  if (!job) {
    return <div>Job not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-4">{job.title}</h1>
        <p className="text-xl text-gray-600 mb-2">{job.employer_profiles?.company_name}</p>
        <p className="text-gray-600 mb-2">{job.location}</p>
        <p className="text-gray-600 mb-2">{job.pay_amount} {job.pay_type}</p>
        <p className="text-gray-600 mb-2">{job.category}</p>
        <p className="text-gray-600 mb-2">{job.openings} openings</p>
        <p className="text-gray-600 mb-4">{job.description}</p>
        <p className="text-sm text-gray-500">Posted on {new Date(job.created_at).toLocaleDateString()}</p>
        <ApplyButton jobId={job.id} />
      </div>
    </div>
  )
}