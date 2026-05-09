import { createClient } from '@/lib/supabase/server'
import JobCard from '@/components/JobCard'
import { JOB_CATEGORIES, PAY_TYPES, BRAND } from '@/lib/constants'
import { Search, Filter, MapPin, Briefcase } from 'lucide-react'

export default async function JobsPage(props: {
  searchParams: Promise<{ category?: string; location?: string; pay_type?: string }>
}) {
  const searchParams = await props.searchParams
  const supabase = await createClient()

  let query = supabase
    .from('jobs')
    .select(`
      *,
      employer_profiles!employer_id (
        company_name
      )
    `)
    .eq('status', 'active')

  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  if (searchParams.location) {
    query = query.ilike('location', `%${searchParams.location}%`)
  }
  if (searchParams.pay_type) {
    query = query.eq('pay_type', searchParams.pay_type)
  }

  const { data: jobs, error } = await query.order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching jobs:', error)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-black text-gray-900 mb-4">Find Your Next Opportunity</h1>
          <p className="text-lg text-gray-600">Browse through thousands of verified job listings across India.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-12 flex flex-col md:flex-row gap-4">
          <div className="flex-grow relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by job title or keyword..."
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
            />
          </div>
          <div className="w-full md:w-48 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Location"
              className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-brand-navy/20 focus:border-brand-navy outline-none"
            />
          </div>
          <button className="btn-primary py-3">
             Search Jobs
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 space-y-8">
            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center">
                <Filter className="w-4 h-4 mr-2" /> Categories
              </h3>
              <div className="space-y-2">
                {JOB_CATEGORIES.map(cat => (
                  <label key={cat} className="flex items-center group cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-brand-navy focus:ring-brand-navy" />
                    <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-brand-navy transition-colors">{cat}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-4">Pay Type</h3>
              <div className="space-y-2">
                {PAY_TYPES.map(type => (
                  <label key={type} className="flex items-center group cursor-pointer">
                    <input type="radio" name="pay_type" className="w-4 h-4 border-gray-300 text-brand-navy focus:ring-brand-navy" />
                    <span className="ml-3 text-sm font-medium text-gray-600 group-hover:text-brand-navy transition-colors">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </aside>

          {/* Job Listings Grid */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-6">
               <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">
                  Showing {jobs?.length || 0} active jobs
               </p>
               <select className="text-sm font-bold text-gray-600 bg-transparent outline-none">
                  <option>Newest First</option>
                  <option>Highest Pay</option>
               </select>
            </div>

            {jobs && jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-gray-100">
                 <Briefcase className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                 <h3 className="text-xl font-bold text-gray-900 mb-2">No jobs found</h3>
                 <p className="text-gray-500">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}