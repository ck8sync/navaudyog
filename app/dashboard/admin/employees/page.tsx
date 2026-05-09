import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function EmployeesDataPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') redirect('/auth/login')

  const { data: employees } = await supabase
    .from('profiles')
    .select('*, employee_profiles(*)')
    .eq('role', 'employee')

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">All Employees</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">City</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Experience</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {employees?.map((emp) => (
              <tr key={emp.id} className="border-t hover:bg-gray-50">
                <td className="px-6 py-3">{emp.full_name}</td>
                <td className="px-6 py-3">{emp.phone}</td>
                <td className="px-6 py-3">{emp.employee_profiles?.city || '-'}</td>
                <td className="px-6 py-3">{emp.employee_profiles?.years_experience || '-'}</td>
                <td className="px-6 py-3 text-sm text-gray-600">{new Date(emp.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}