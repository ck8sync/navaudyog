import { createClient } from '@/lib/supabase/server'
import { BRAND } from '@/lib/constants'
import { Briefcase, Search, IndianRupee, MapPin, Building2, CheckCircle, XCircle } from 'lucide-react'
import StatusBadge from '@/components/StatusBadge'
import CategoryBadge from '@/components/CategoryBadge'

export default async function AdminJobsPage() {
  const supabase = await createClient()

  const { data: jobs } = await supabase
    .from('jobs')
    .select('*, employer_profiles(company_name)')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex justify-between items-end">
           <div>
              <h1 className="text-4xl font-black text-gray-900 mb-2">Job Moderation</h1>
              <p className="text-lg text-gray-600">Review and manage all job listings across India.</p>
           </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by job title or company..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-navy/20" />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Job Details</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Company</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Pay</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs?.map((job: any) => (
                  <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-black text-gray-900">{job.title}</div>
                      <div className="flex items-center text-xs text-gray-400 font-bold mt-1">
                         <CategoryBadge category={job.category} className="mr-2 scale-75 origin-left" />
                         <MapPin className="w-3 h-3 mr-1" /> {job.location}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center text-sm font-bold text-brand-navy">
                          <Building2 className="w-4 h-4 mr-2 opacity-50" />
                          {job.employer_profiles?.company_name}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <StatusBadge status={job.status} />
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center text-sm font-black text-gray-700">
                          <IndianRupee className="w-3 h-3 mr-1 text-gray-400" />
                          {job.pay_amount} <span className="text-[10px] text-gray-400 ml-1 font-bold uppercase tracking-tight">/ {job.pay_type}</span>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-3">
                          <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                             <CheckCircle className="w-5 h-5" />
                          </button>
                          <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject/Close">
                             <XCircle className="w-5 h-5" />
                          </button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}