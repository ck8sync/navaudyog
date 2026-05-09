import { createClient } from '@/lib/supabase/server'
import { BRAND } from '@/lib/constants'
import { User, Search, Phone, MapPin, Briefcase, GraduationCap } from 'lucide-react'
import Link from 'next/link'

export default async function AdminEmployeesPage() {
  const supabase = await createClient()

  const { data: employees, error } = await supabase
    .from('profiles')
    .select('*, employee_profiles!id(*)')
    .eq('role', 'employee')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching employees:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
           <h1 className="text-4xl font-black text-gray-900 mb-2">Employee Directory</h1>
           <p className="text-lg text-gray-600">View and manage all registered job seekers on the platform.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-50 flex items-center justify-between">
             <div className="relative w-full md:w-96">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search by name or skill..." className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-brand-navy/20" />
             </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Candidate</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Experience</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Contact</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Location</th>
                  <th className="px-8 py-5 text-xs font-black uppercase tracking-widest text-gray-400">Verified</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {employees?.map((emp: any) => (
                  <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand-navy font-black">
                            {emp.full_name[0]}
                         </div>
                         <div>
                            <div className="font-black text-gray-900">{emp.full_name}</div>
                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                               {emp.employee_profiles?.job_categories?.[0] || 'Uncategorized'}
                            </div>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-sm text-gray-600 font-bold">
                         <Briefcase className="w-3 h-3 mr-2 text-brand-amber" /> {emp.employee_profiles?.years_experience || '0'} Years
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center text-sm text-gray-600 font-bold">
                         <Phone className="w-3 h-3 mr-2 text-brand-navy" /> {emp.phone}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-3 h-3 mr-2 text-gray-400" />
                          {emp.employee_profiles?.city || 'Not set'}
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <Link 
                          href={`/dashboard/admin/employees/${emp.id}`}
                          className="flex items-center text-brand-navy font-black text-xs uppercase tracking-widest hover:underline"
                       >
                          <div className="w-2 h-2 bg-brand-navy rounded-full mr-2" />
                          View Full Details
                       </Link>
                    </td>
                  </tr>
                ))}
                {(!employees || employees.length === 0) && (
                  <tr>
                    <td colSpan={5} className="px-8 py-12 text-center text-gray-500 italic">
                      No employees found in the directory.
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