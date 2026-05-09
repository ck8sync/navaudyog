import Link from "next/link";
import { JOB_CATEGORIES, BRAND } from "@/lib/constants";
import { ArrowRight, Briefcase, Users, Building2, CheckCircle2, Globe } from "lucide-react";

const CATEGORY_ICONS: Record<string, any> = {
  "Construction & Labour": Building2,
  "Manufacturing & Factory": Building2,
  "Delivery & Logistics": Globe,
  "Security & Housekeeping": CheckCircle2,
  "Retail & Sales": Users,
  "Driver & Transport": Briefcase,
};

export default function Home() {
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-brand-light opacity-30 blur-[120px] rounded-full" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-light text-brand-navy text-sm font-bold mb-8 animate-fade-in">
            <span className="mr-2">🇮🇳</span> Made in India for the Real Workforce
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-8 leading-[1.1]">
            <span style={{ color: BRAND.primary }}>New Job.</span><br />
            <span style={{ color: BRAND.accent }}>New Start.</span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-12 leading-relaxed">
            Navaudyog is India's premier platform connecting skilled workers with growing industries. No resume? No problem. Your skills are your profile.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link href="/jobs" className="btn-primary flex items-center group w-full sm:w-auto justify-center py-4 px-10 text-lg">
              Find Your Job
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="/auth/register" className="btn-accent w-full sm:w-auto justify-center py-4 px-10 text-lg">
              Post a Job Listing
            </Link>
          </div>
          
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
             <div className="text-center">
                <div className="text-3xl font-black text-brand-navy">10K+</div>
                <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">Active Jobs</div>
             </div>
             <div className="text-center">
                <div className="text-3xl font-black text-brand-navy">50K+</div>
                <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">Workers</div>
             </div>
             <div className="text-center">
                <div className="text-3xl font-black text-brand-navy">500+</div>
                <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">Companies</div>
             </div>
             <div className="text-center">
                <div className="text-3xl font-black text-brand-navy">24/7</div>
                <div className="text-sm text-gray-500 font-bold uppercase tracking-widest">Support</div>
             </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="py-24 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Explore Industries</h2>
              <p className="text-lg text-gray-600">Choose from thousands of high-demand roles in these top categories across India.</p>
            </div>
            <Link href="/jobs" className="text-brand-navy font-black flex items-center hover:underline">
              View All Roles <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {JOB_CATEGORIES.map((category) => {
              const Icon = CATEGORY_ICONS[category] || Building2;
              return (
                <Link
                  key={category}
                  href={`/jobs?category=${encodeURIComponent(category)}`}
                  className="card-premium group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-brand-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-7 h-7" style={{ color: BRAND.primary }} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 mb-2">{category}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-4">
                    Find jobs in factory, site work, or field roles in {category.split(' & ')[0]}.
                  </p>
                  <span className="text-xs font-black uppercase tracking-widest text-brand-amber inline-flex items-center">
                    Browse Now <ArrowRight className="ml-1 w-3 h-3" />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust Banner */}
      <section className="py-20 bg-brand-navy text-white text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight italic">
            "Sahi Naukri, Sahi Shuruat."
          </h2>
          <p className="text-xl text-brand-light/80 mb-12">
            Join thousands of workers who found their dream jobs in 24 hours.
          </p>
          <Link href="/auth/register" className="inline-block bg-white text-brand-navy px-10 py-4 rounded-xl font-black text-lg hover:bg-brand-light transition-colors">
            Start Your Journey 🇮🇳
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
             <span className="text-xl font-black tracking-tighter" style={{ color: BRAND.primary }}>
                {BRAND.name.toUpperCase()}
              </span>
              <p className="text-gray-400 text-sm mt-1">{BRAND.tagline}</p>
          </div>
          
          <div className="flex gap-8 text-sm font-bold text-gray-500">
             <Link href="/jobs" className="hover:text-brand-navy">Jobs</Link>
             <Link href="/auth/login" className="hover:text-brand-navy">Employer Login</Link>
             <Link href="/terms" className="hover:text-brand-navy">Terms</Link>
          </div>
          
          <div className="text-gray-400 text-sm font-medium">
             © 2024 Navaudyog. Made with ❤️ in India.
          </div>
        </div>
      </footer>
    </div>
  );
}
