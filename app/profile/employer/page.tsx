'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { COMPANY_TYPES, BRAND } from '@/lib/constants'
import { INDIAN_STATES, INDIAN_CITIES } from '@/lib/indian-locations'
import { Upload, X } from 'lucide-react'

export default function EmployerProfileSetup() {
  const [companyName, setCompanyName] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [companyTypeSearch, setCompanyTypeSearch] = useState('')
  const [otherCompanyType, setOtherCompanyType] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [locations, setLocations] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [description, setDescription] = useState('')
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!/^[6-9]\d{9}$/.test(contactPhone)) { setError('Enter a valid 10-digit Indian mobile number.'); return }
    if (!state || !(INDIAN_CITIES[state] || []).includes(city)) { setError('Choose a city from the selected state.'); return }

    setLoading(true)
    setError('')

    try {
    const supabase = createClient()
    let logo_url: string | undefined

    if (logoFile) {
      const fileExt = logoFile.name.split('.').pop()
      const fileName = `${user.id}/logo.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('employer-logos')
        .upload(filePath, logoFile, { upsert: true })

      if (uploadError) {
        throw new Error('Error uploading logo: ' + uploadError.message)
      }

      const { data: { publicUrl } } = supabase.storage
        .from('employer-logos')
        .getPublicUrl(filePath)
      
      logo_url = publicUrl
    }

    const { error: upsertError } = await supabase
      .from('employer_profiles')
      .upsert({
        id: user.id,
        company_name: companyName,
        company_type: companyType,
        other_company_type: otherCompanyType || null,
        city,
        state,
        locations: [`${city}, ${state}`, ...locations.split(',').map(l => l.trim()).filter(Boolean)],
        contact_phone: contactPhone,
        description,
        logo_url
      })

    if (upsertError) throw upsertError
    alert('Profile updated successfully!')
    router.push('/dashboard/employer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save your employer profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (logoPreview) {
        URL.revokeObjectURL(logoPreview)
      }
      setLogoFile(file)
      setLogoPreview(URL.createObjectURL(file))
    }
  }

  const handleRemoveLogo = () => {
    if (logoPreview) {
      URL.revokeObjectURL(logoPreview)
    }
    setLogoFile(null)
    setLogoPreview(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-3xl font-bold text-center mb-8" style={{ color: BRAND.primary }}>
            Set Up Your Employer Profile
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col items-center mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-4 w-full text-center">
                Company Logo
              </label>
              <div className="relative group">
                <div 
                  className="w-32 h-32 rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden bg-gray-50 group-hover:border-brand-navy transition-colors cursor-pointer"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                  ) : (
                    <div className="text-center p-4">
                      <Upload className="w-8 h-8 mx-auto text-gray-400 group-hover:text-brand-navy mb-2" />
                      <span className="text-xs text-gray-500">Upload Logo</span>
                    </div>
                  )}
                </div>
                {logoPreview && (
                  <button 
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <input 
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 italic text-center">Recommended: Square logo, max 2MB</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name <span className="text-red-600">*</span>
              </label>
              <input 
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter company name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Type <span className="text-red-600">*</span>
              </label>
              <input type="search" className="mb-2 w-full px-3 py-2 border border-gray-300 rounded-md" placeholder="Search company types" value={companyTypeSearch} onChange={e => setCompanyTypeSearch(e.target.value)} />
              <select 
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                value={companyType}
                onChange={(e) => setCompanyType(e.target.value)}
              >
                <option value="">Select type</option>
                {COMPANY_TYPES.filter(type => type.toLowerCase().includes(companyTypeSearch.toLowerCase())).map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {companyType === 'Other' && <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Company type details</label>
              <input required value={otherCompanyType} onChange={e => setOtherCompanyType(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
            </div>}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">State / Union Territory <span className="text-red-600">*</span></label>
              <select required value={state} onChange={e => setState(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                <option value="">Select state / union territory</option>
                {INDIAN_STATES.map(item => <option key={item} value={item}>{item}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City <span className="text-red-600">*</span></label>
              <input required list="employer-cities" value={city} onChange={e => setCity(e.target.value)} placeholder="Search city" className="w-full px-3 py-2 border border-gray-300 rounded-md" />
              <datalist id="employer-cities">{(INDIAN_CITIES[state] || []).map(item => <option key={item} value={item} />)}</datalist>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                City / Location(s)
              </label>
              <input 
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g. Mumbai, Delhi (comma separated)"
                value={locations}
                onChange={(e) => setLocations(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone <span className="text-red-600">*</span>
              </label>
              <input 
                type="tel"
                required
                inputMode="numeric"
                pattern="[6-9][0-9]{9}"
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter contact phone"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                About Company
              </label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                placeholder="Describe your company (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
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
