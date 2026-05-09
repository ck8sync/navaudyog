'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/context/AuthContext'
import { JOB_CATEGORIES, EXPERIENCE_OPTIONS, PAY_TYPES, AVAILABILITY_OPTIONS, BRAND } from '@/lib/constants'
import { Plus, Trash2, Save, User, GraduationCap, Briefcase, Sparkles, MapPin, CheckCircle } from 'lucide-react'

const LANGUAGES = ['Hindi', 'English', 'Tamil', 'Telugu', 'Kannada', 'Bengali', 'Marathi', 'Other']

interface Education {
  id?: string
  qualification: string
  institution_name: string
  board_university: string
  year_of_passing: string
  percentage_cgpa: string
}

interface Experience {
  id?: string
  company_name: string
  designation: string
  duration: string
  salary_drawn: string
  reason_for_leaving: string
}

export default function EmployeeProfileSetup() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState('')
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  // Personal Details
  const [fullName, setFullName] = useState('')
  const [fatherMotherName, setFatherMotherName] = useState('')
  const [dob, setDob] = useState('')
  const [gender, setGender] = useState('')
  const [phone, setPhone] = useState('')
  const [alternateNumber, setAlternateNumber] = useState('')
  const [email, setEmail] = useState('')
  const [currentAddress, setCurrentAddress] = useState('')
  const [permanentAddress, setPermanentAddress] = useState('')

  // Profile Specific
  const [city, setCity] = useState('')
  const [jobCategories, setJobCategories] = useState<string[]>([])
  const [yearsExperience, setYearsExperience] = useState('')
  const [fresherExperienced, setFresherExperienced] = useState('Fresher')
  
  // Education & Experience
  const [education, setEducation] = useState<Education[]>([
    { qualification: 'SSLC/10th', institution_name: '', board_university: '', year_of_passing: '', percentage_cgpa: '' },
    { qualification: 'PUC/12th', institution_name: '', board_university: '', year_of_passing: '', percentage_cgpa: '' },
    { qualification: 'Diploma/UG', institution_name: '', board_university: '', year_of_passing: '', percentage_cgpa: '' },
    { qualification: 'PG/Other', institution_name: '', board_university: '', year_of_passing: '', percentage_cgpa: '' }
  ])
  const [experiences, setExperiences] = useState<Experience[]>([])

  // Skills & Preferences
  const [technicalSkills, setTechnicalSkills] = useState('')
  const [languages, setLanguages] = useState<string[]>([])
  const [certifications, setCertifications] = useState('')
  const [preferredLocation, setPreferredLocation] = useState('')
  const [expectedSalary, setExpectedSalary] = useState('')
  const [noticePeriod, setNoticePeriod] = useState('')
  const [shiftPreference, setShiftPreference] = useState('')
  const [declarationAccepted, setDeclarationAccepted] = useState(false)

  useEffect(() => {
    if (user) {
      fetchProfileData()
    }
  }, [user])

  const fetchProfileData = async () => {
    if (!user) return
    
    try {
      // Fetch basic profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) {
        setFullName(profile.full_name || '')
        setPhone(profile.phone || '')
        setEmail(user.email || '')
      }

      // Fetch employee profile
      const { data: empProfile } = await supabase
        .from('employee_profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (empProfile) {
        setFatherMotherName(empProfile.father_mother_name || '')
        setDob(empProfile.dob || '')
        setGender(empProfile.gender || '')
        setAlternateNumber(empProfile.alternate_number || '')
        setCurrentAddress(empProfile.current_address || '')
        setPermanentAddress(empProfile.permanent_address || '')
        setCity(empProfile.city || '')
        setJobCategories(empProfile.job_categories || [])
        setYearsExperience(empProfile.years_experience || '')
        setFresherExperienced(empProfile.fresher_experienced || 'Fresher')
        setTechnicalSkills(empProfile.technical_skills?.join(', ') || '')
        setCertifications(empProfile.certifications?.join(', ') || '')
        setLanguages(empProfile.languages || [])
        setPreferredLocation(empProfile.preferred_location || '')
        setExpectedSalary(empProfile.expected_salary || '')
        setNoticePeriod(empProfile.notice_period || '')
        setShiftPreference(empProfile.shift_preference || '')
        setDeclarationAccepted(empProfile.declaration_accepted || false)
      }

      // Fetch Education
      const { data: eduData } = await supabase
        .from('education_qualifications')
        .select('*')
        .eq('employee_id', user.id)
      
      if (eduData && eduData.length > 0) {
        // Merge with defaults to ensure all fields are present
        const mergedEdu = [
            'SSLC/10th', 'PUC/12th', 'Diploma/UG', 'PG/Other'
        ].map(q => {
            const found = eduData.find(e => e.qualification === q)
            return found || { qualification: q, institution_name: '', board_university: '', year_of_passing: '', percentage_cgpa: '' }
        })
        setEducation(mergedEdu)
      }

      // Fetch Experience
      const { data: expData } = await supabase
        .from('work_experiences')
        .select('*')
        .eq('employee_id', user.id)
      
      if (expData && expData.length > 0) {
        setExperiences(expData)
      }

    } catch (err) {
      console.error('Error fetching profile:', err)
    } finally {
      setFetching(false)
    }
  }

  const handleEducationChange = (index: number, field: keyof Education, value: string) => {
    const newEdu = [...education]
    newEdu[index] = { ...newEdu[index], [field]: value }
    setEducation(newEdu)
  }

  const addExperience = () => {
    setExperiences([...experiences, { company_name: '', designation: '', duration: '', salary_drawn: '', reason_for_leaving: '' }])
  }

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index))
  }

  const handleExperienceChange = (index: number, field: keyof Experience, value: string) => {
    const newExp = [...experiences]
    newExp[index] = { ...newExp[index], [field]: value }
    setExperiences(newExp)
  }

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
    if (!declarationAccepted) {
        setError('Please accept the declaration to proceed.')
        return
    }

    setLoading(true)
    setError('')

    try {
        // 1. Update Profiles table (Full Name)
        await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', user.id)

        // 2. Update Employee Profiles
        const { error: empError } = await supabase
            .from('employee_profiles')
            .upsert({
                id: user.id,
                city,
                father_mother_name: fatherMotherName,
                dob,
                gender,
                alternate_number: alternateNumber,
                current_address: currentAddress,
                permanent_address: permanentAddress,
                job_categories: jobCategories,
                years_experience: yearsExperience,
                fresher_experienced: fresherExperienced,
                technical_skills: technicalSkills.split(',').map(s => s.trim()).filter(s => s),
                certifications: certifications.split(',').map(c => c.trim()).filter(c => c),
                languages,
                preferred_location: preferredLocation,
                expected_salary: expectedSalary,
                notice_period: noticePeriod,
                shift_preference: shiftPreference,
                declaration_accepted: declarationAccepted,
                pay_preference: expectedSalary // Mapping expected salary to pay preference for compatibility
            })

        if (empError) throw empError

        // 3. Update Education (Delete then Insert)
        await supabase.from('education_qualifications').delete().eq('employee_id', user.id)
        const eduToInsert = education
            .filter(e => e.institution_name) // Only insert if they filled something
            .map(e => ({ ...e, employee_id: user.id }))
        
        if (eduToInsert.length > 0) {
            await supabase.from('education_qualifications').insert(eduToInsert)
        }

        // 4. Update Experience (Delete then Insert)
        await supabase.from('work_experiences').delete().eq('employee_id', user.id)
        const expToInsert = experiences
            .filter(e => e.company_name)
            .map(e => ({ ...e, employee_id: user.id }))
        
        if (expToInsert.length > 0) {
            await supabase.from('work_experiences').insert(expToInsert)
        }

        alert('Profile saved successfully!')
        router.push('/dashboard/employee')
    } catch (err: any) {
        setError(err.message)
    } finally {
        setLoading(false)
    }
  }

  if (fetching) return <div className="min-h-screen flex items-center justify-center">Loading your profile...</div>

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-3">Complete Your Profile</h1>
            <p className="text-lg text-gray-500 font-medium">Help us find the best opportunities for you by providing your details.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 1. Personal Details */}
          <Section title="Personal Details" icon={<User className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Full Name">
                    <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="input-field" placeholder="Your full name" />
                </Field>
                <Field label="Father's / Mother's Name">
                    <input type="text" required value={fatherMotherName} onChange={e => setFatherMotherName(e.target.value)} className="input-field" placeholder="Name" />
                </Field>
                <Field label="Date of Birth">
                    <input type="date" required value={dob} onChange={e => setDob(e.target.value)} className="input-field" />
                </Field>
                <Field label="Gender">
                    <select required value={gender} onChange={e => setGender(e.target.value)} className="input-field">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                    </select>
                </Field>
                <Field label="Mobile Number">
                    <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="input-field" placeholder="10-digit number" />
                </Field>
                <Field label="Alternate Number">
                    <input type="tel" value={alternateNumber} onChange={e => setAlternateNumber(e.target.value)} className="input-field" placeholder="Optional" />
                </Field>
                <div className="md:col-span-2">
                    <Field label="Email ID">
                        <input type="email" disabled value={email} className="input-field bg-gray-50" />
                    </Field>
                </div>
                <div className="md:col-span-2">
                    <Field label="Current Address">
                        <textarea required value={currentAddress} onChange={e => setCurrentAddress(e.target.value)} className="input-field min-h-[80px]" placeholder="Street, Area, City, Pincode" />
                    </Field>
                </div>
                <div className="md:col-span-2">
                    <Field label="Permanent Address">
                        <div className="flex items-center mb-2">
                            <input type="checkbox" id="sameAddress" className="mr-2" onChange={(e) => { if(e.target.checked) setPermanentAddress(currentAddress) }} />
                            <label htmlFor="sameAddress" className="text-xs text-gray-500 font-bold uppercase tracking-wider">Same as current address</label>
                        </div>
                        <textarea required value={permanentAddress} onChange={e => setPermanentAddress(e.target.value)} className="input-field min-h-[80px]" placeholder="Street, Area, City, Pincode" />
                    </Field>
                </div>
            </div>
          </Section> Section

          {/* 2. Educational Qualification */}
          <Section title="Educational Qualification" icon={<GraduationCap className="w-5 h-5" />}>
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Qualification</th>
                            <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Institution</th>
                            <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Board/Univ</th>
                            <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Year</th>
                            <th className="py-4 text-xs font-black text-gray-400 uppercase tracking-widest">% / CGPA</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {education.map((edu, idx) => (
                            <tr key={idx}>
                                <td className="py-4 pr-4 font-bold text-gray-700">{edu.qualification}</td>
                                <td className="py-4 pr-4">
                                    <input type="text" value={edu.institution_name} onChange={e => handleEducationChange(idx, 'institution_name', e.target.value)} className="input-field py-1 text-sm" placeholder="Name" />
                                </td>
                                <td className="py-4 pr-4">
                                    <input type="text" value={edu.board_university} onChange={e => handleEducationChange(idx, 'board_university', e.target.value)} className="input-field py-1 text-sm" placeholder="Board" />
                                </td>
                                <td className="py-4 pr-4">
                                    <input type="text" value={edu.year_of_passing} onChange={e => handleEducationChange(idx, 'year_of_passing', e.target.value)} className="input-field py-1 text-sm w-20" placeholder="YYYY" />
                                </td>
                                <td className="py-4">
                                    <input type="text" value={edu.percentage_cgpa} onChange={e => handleEducationChange(idx, 'percentage_cgpa', e.target.value)} className="input-field py-1 text-sm w-20" placeholder="%" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </Section>

          {/* 3. Work Experience */}
          <Section title="Work Experience" icon={<Briefcase className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Field label="Total Experience">
                    <select required value={yearsExperience} onChange={e => setYearsExperience(e.target.value)} className="input-field">
                        <option value="">Select experience</option>
                        {EXPERIENCE_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </Field>
                <Field label="Status">
                    <select required value={fresherExperienced} onChange={e => setFresherExperienced(e.target.value)} className="input-field">
                        <option value="Fresher">Fresher</option>
                        <option value="Experienced">Experienced</option>
                    </select>
                </Field>
            </div>

            {fresherExperienced === 'Experienced' && (
                <div className="space-y-6">
                    {experiences.map((exp, idx) => (
                        <div key={idx} className="relative p-6 border border-gray-100 rounded-2xl bg-gray-50/50">
                            <button type="button" onClick={() => removeExperience(idx)} className="absolute top-4 right-4 text-red-400 hover:text-red-600">
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Field label="Company Name">
                                    <input type="text" value={exp.company_name} onChange={e => handleExperienceChange(idx, 'company_name', e.target.value)} className="input-field" placeholder="Name" />
                                </Field>
                                <Field label="Designation">
                                    <input type="text" value={exp.designation} onChange={e => handleExperienceChange(idx, 'designation', e.target.value)} className="input-field" placeholder="Role" />
                                </Field>
                                <Field label="Duration">
                                    <input type="text" value={exp.duration} onChange={e => handleExperienceChange(idx, 'duration', e.target.value)} className="input-field" placeholder="e.g. 2 Years" />
                                </Field>
                                <Field label="Salary Drawn">
                                    <input type="text" value={exp.salary_drawn} onChange={e => handleExperienceChange(idx, 'salary_drawn', e.target.value)} className="input-field" placeholder="Amount" />
                                </Field>
                                <div className="md:col-span-2">
                                    <Field label="Reason for Leaving">
                                        <input type="text" value={exp.reason_for_leaving} onChange={e => handleExperienceChange(idx, 'reason_for_leaving', e.target.value)} className="input-field" placeholder="Optional" />
                                    </Field>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button type="button" onClick={addExperience} className="flex items-center gap-2 text-brand-navy font-black text-sm uppercase tracking-widest hover:text-brand-navy/80">
                        <Plus className="w-4 h-4" /> Add Experience Entry
                    </button>
                </div>
            )}
          </Section>

          {/* 4. Skills & Certifications */}
          <Section title="Skills & Certifications" icon={<Sparkles className="w-5 h-5" />}>
            <div className="space-y-6">
                <Field label="Technical Skills (Comma separated)">
                    <input type="text" value={technicalSkills} onChange={e => setTechnicalSkills(e.target.value)} className="input-field" placeholder="e.g. Driving, Plastering, Welding" />
                </Field>
                <Field label="Languages Known">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {LANGUAGES.map(lang => (
                            <label key={lang} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${languages.includes(lang) ? 'bg-brand-navy border-brand-navy text-white' : 'bg-white border-gray-100 text-gray-500'}`}>
                                <input type="checkbox" className="hidden" checked={languages.includes(lang)} onChange={e => handleLanguageChange(lang, e.target.checked)} />
                                <span className="text-xs font-black uppercase tracking-tight">{lang}</span>
                            </label>
                        ))}
                    </div>
                </Field>
                <Field label="Certifications (Comma separated)">
                    <input type="text" value={certifications} onChange={e => setCertifications(e.target.value)} className="input-field" placeholder="e.g. ITI, Driving License, First Aid" />
                </Field>
            </div>
          </Section>

          {/* 5. Job Preferences */}
          <Section title="Job Preferences" icon={<MapPin className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Field label="Preferred Location">
                    <input type="text" value={preferredLocation} onChange={e => setPreferredLocation(e.target.value)} className="input-field" placeholder="City Name" />
                </Field>
                <Field label="Expected Salary">
                    <input type="text" value={expectedSalary} onChange={e => setExpectedSalary(e.target.value)} className="input-field" placeholder="Per month / Daily" />
                </Field>
                <Field label="Notice Period">
                    <input type="text" value={noticePeriod} onChange={e => setNoticePeriod(e.target.value)} className="input-field" placeholder="e.g. Immediately, 15 Days" />
                </Field>
                <Field label="Shift Preference">
                    <select value={shiftPreference} onChange={e => setShiftPreference(e.target.value)} className="input-field">
                        <option value="Any">Any Shift</option>
                        <option value="Day">Day Shift</option>
                        <option value="Night">Night Shift</option>
                    </select>
                </Field>
                <div className="md:col-span-2">
                    <Field label="Job Categories Interested In">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {JOB_CATEGORIES.map(cat => (
                                <label key={cat} className={`flex items-center p-3 border rounded-xl cursor-pointer transition-all ${jobCategories.includes(cat) ? 'bg-brand-navy border-brand-navy text-white' : 'bg-white border-gray-100 text-gray-500'}`}>
                                    <input type="checkbox" className="hidden" checked={jobCategories.includes(cat)} onChange={e => handleCategoryChange(cat, e.target.checked)} />
                                    <span className="text-xs font-black uppercase tracking-tight">{cat}</span>
                                </label>
                            ))}
                        </div>
                    </Field>
                </div>
            </div>
          </Section>

          {/* 7. Declaration */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black text-gray-900 mb-4">Declaration</h2>
            <p className="text-sm text-gray-500 italic mb-6">
                I hereby declare that the information provided above is true and correct to the best of my knowledge.
            </p>
            <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" checked={declarationAccepted} onChange={e => setDeclarationAccepted(e.target.checked)} className="w-5 h-5 rounded border-gray-300 text-brand-navy focus:ring-brand-navy" />
                <span className="text-sm font-bold text-gray-700">I agree to the declaration</span>
            </label>
          </div>

          {error && <p className="text-red-600 font-bold text-center bg-red-50 p-4 rounded-xl">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 px-8 text-white rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: BRAND.primary }}
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-5 h-5" />}
            {loading ? 'Saving Your Profile...' : 'Save & Complete Profile'}
          </button>
        </form>
      </div>

      <style jsx global>{`
        .input-field {
            width: 100%;
            padding: 0.75rem 1rem;
            border: 1px solid #E2E8F0;
            border-radius: 0.75rem;
            outline: none;
            font-weight: 500;
            transition: all 0.2s;
        }
        .input-field:focus {
            border-color: #1A237E;
            box-shadow: 0 0 0 3px rgba(26, 35, 126, 0.1);
        }
      `}</style>
    </div>
  )
}

function Section({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) {
    return (
        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-brand-light flex items-center justify-center text-brand-navy">
                    {icon}
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">{title}</h2>
            </div>
            {children}
        </div>
    )
}

function Field({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest">{label}</label>
            {children}
        </div>
    )
}