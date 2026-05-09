import { createClient } from '@/lib/supabase/server'
import { BRAND } from '@/lib/constants'
import { Building2, Search, Phone, MapPin, Briefcase } from 'lucide-react'

export default async function AdminEmployersPage() {
  const supabase = await createClient()

  const { data: employers, error } = await supabase
    .from('profiles')
    .select('*, employer_profiles!id(*)')
    .eq('role', 'employer')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching employers:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
           <h1 className="text-4xl font-black text-gray-900 mb-2">Employer Directory</h1>
           <p className="text-lg text-gray-600">Monitor all registered companies and businesses.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by company name..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-navy/20" />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Company Name</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Type</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Contact</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Location</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employers?.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="font-black text-gray-900">{emp.employer_profiles?.company_name || emp.full_name}</div>
                      <div className="text-xs text-brand-amber font-bold uppercase tracking-tight">Verified Employer</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black uppercase bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
                         {emp.employer_profiles?.company_type || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-sm text-gray-600 font-bold">
                         <Phone className="w-3 h-3 mr-2 text-brand-navy" /> {emp.phone}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-sm text-gray-600">
                         <MapPin className="w-3 h-3 mr-2 text-gray-400" />
                         {emp.employer_profiles?.locations?.[0] || 'Not set'}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-green-600 font-black text-xs uppercase tracking-widest">
                         <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                         Active
                      </div>
                    </td>
                  </tr>
                ))}
                {(!employers || employers.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-gray-500 italic">
                      No employers found in the directory.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}