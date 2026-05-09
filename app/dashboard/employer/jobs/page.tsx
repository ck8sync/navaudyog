import { createClient } from '@/lib/supabase/server'
import { BRAND } from '@/lib/constants'
import { PlusCircle, Briefcase, IndianRupee, MapPin, Users, Edit, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import CategoryBadge from '@/components/CategoryBadge'

export default async function EmployerJobsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, applications(count)')
    .eq('employer_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-2">My Job Listings</h1>
            <p className="text-lg text-gray-600">Manage your active and past job postings.</p>
          </div>
          <Link href="/dashboard/employer/jobs/new" className="btn-accent flex items-center py-3 px-6">
            <PlusCircle className="w-5 h-5 mr-2" /> Post New Job
          </Link>
        </div>

        {jobs && jobs.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Job Title</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Category</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Applications</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Pay</th>
                    <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {jobs.map((job: any) => (
                    <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-black text-gray-900">{job.title}</div>
                        <div className="flex items-center text-xs text-gray-400 mt-1 font-bold">
                           <MapPin className="w-3 h-3 mr-1" /> {job.location}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-8 py-6">
                         <CategoryBadge category={job.category} />
                      </td>
                      <td className="px-8 py-6 text-center">
                         <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-brand-light text-brand-navy font-black text-sm">
                            {job.applications?.[0]?.count || 0}
                         </div>
                      </td>
                      <td className="px-8 py-6 font-bold text-gray-700">
                         ₹{job.pay_amount} <span className="text-xs text-gray-400 font-medium">/{job.pay_type}</span>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center gap-4">
                            <Link href={`/jobs/${job.id}`} className="p-2 text-gray-400 hover:text-brand-navy hover:bg-brand-light rounded-lg transition-all" title="View Public Page">
                               <ExternalLink className="w-5 h-5" />
                            </Link>
                            <Link href={`/dashboard/employer/jobs/${job.id}/edit`} className="p-2 text-gray-400 hover:text-brand-amber hover:bg-amber-50 rounded-lg transition-all" title="Edit Job">
                               <Edit className="w-5 h-5" />
                            </Link>
                         </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-20 text-center border-2 border-dashed border-gray-100">
             <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
             <h3 className="text-2xl font-black text-gray-900 mb-2">No jobs posted yet</h3>
             <p className="text-gray-500 mb-8 max-w-sm mx-auto">Start hiring India's best talent by posting your first job listing today.</p>
             <Link href="/dashboard/employer/jobs/new" className="btn-accent inline-block">Post Your First Job</Link>
          </div>
        )}
      </div>
    </div>
  )
}
