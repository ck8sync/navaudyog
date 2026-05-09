import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function EmployersDataPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/auth/login')

  const { data: employers } = await supabase
    .from('profiles')
    .select('*, employer_profiles(*), jobs(count)')
    .eq('role', 'employer')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Employers</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Company</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Contact</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Jobs Posted</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {employers?.map((emp) => (
              <tr key={emp.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3">{emp.employer_profiles?.company_name || '-'}</td>
                <td className="px-6 py-3">{emp.employer_profiles?.contact_phone || emp.phone}</td>
                <td className="px-6 py-3">{emp.employer_profiles?.company_type || '-'}</td>
                <td className="px-6 py-3">{emp.jobs?.length || 0}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{new Date(emp.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}