'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { JOB_CATEGORIES, EXPERIENCE_OPTIONS, PAY_TYPES, AVAILABILITY_OPTIONS, BRAND } from '@/lib/constants'

const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Other']

export default function EmployeeProfileSetup() {
  const [city, setCity] = useState('')
  const [jobCategories, setJobCategories] = useState<string[]>([])
  const [yearsExperience, setYearsExperience] = useState('')
  const [payPreference, setPayPreference] = useState('')
  const [availability, setAvailability] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setJobCategories([...jobCategories, category])
    } else {
      setJobCategories(jobCategories.filter(c => c !== category))
    }
  }

  const handleLanguageChange = (language: string, checked: boolean) => {
    if (checked) {
      setLanguages([...languages, language])
    } else {
      setLanguages(languages.filter(l => l !== language))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error } = await supabase
      .from('employee_profiles')
      .upsert({
        id: user.id,
        city,
        job_categories: jobCategories,
        years_experience: yearsExperience,
        pay_preference: payPreference,
        availability,
        languages,
      })

    if (error) {
      setError(error.message)
    } else {
      alert('Profile updated successfully!')
      router.push('/dashboard/employee')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-center mb-8" style={{ color: BRAND.primary }}>
            Complete Your Profile
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. Mumbai, Delhi, Pune"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Categories
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {JOB_CATEGORIES.map((category) => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={jobCategories.includes(category)}
                      onChange={(e) => handleCategoryChange(category, e.target.checked)}
                    />
                    {category}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Years of Experience
              </label>
              <select
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={yearsExperience}
                onChange={(e) => setYearsExperience(e.target.value)}
              >
                <option value="">Select experience</option>
                {EXPERIENCE_OPTIONS.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Pay Type
              </label>
              <div className="space-y-2">
                {PAY_TYPES.map((type) => (
                  <label key={type} className="flex items-center">
                    <input
                      type="radio"
                      name="payPreference"
                      value={type}
                      className="mr-2"
                      checked={payPreference === type}
                      onChange={(e) => setPayPreference(e.target.value)}
                    />
                    {type}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available to Join
              </label>
              <div className="space-y-2">
                {AVAILABILITY_OPTIONS.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="radio"
                      name="availability"
                      value={option}
                      className="mr-2"
                      checked={availability === option}
                      onChange={(e) => setAvailability(e.target.value)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Languages Spoken
              </label>
              <div className="grid grid-cols-2 gap-2">
                {LANGUAGES.map((language) => (
                  <label key={language} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={languages.includes(language)}
                      onChange={(e) => handleLanguageChange(language, e.target.checked)}
                    />
                    {language}
                  </label>
                ))}
              </div>
            </div>

            {error && <p className="text-red-600">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 text-white rounded-md hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: BRAND.primary }}
            >
              {loading ? 'Saving...' : 'Complete Profile'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}