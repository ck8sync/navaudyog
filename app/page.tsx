'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import PlatformStats from './PlatformStats';
import './landing.css';

const trades = [
  { name: 'Construction & Labour', description: 'Site work and field roles', icon: <><path d="M4 21h16M6 21V9l6-5 6 5v12"/><path d="M10 21v-7h4v7M3 10h18"/></> },
  { name: 'Manufacturing & Factory', description: 'Operators and line workers', icon: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6m9 3h-6m-3 9v-6m-9-3h6"/></> },
  { name: 'Delivery & Logistics', description: 'Riders, warehouse and fleet', icon: <><path d="M3 6h12v12H3zM15 10h4l3 4v4h-7z"/><circle cx="7.5" cy="19" r="2"/><circle cx="18.5" cy="19" r="2"/></> },
  { name: 'Security & Housekeeping', description: 'Guards and facility staff', icon: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/></> },
  { name: 'Retail & Sales', description: 'Store and field sales', icon: <><path d="M4 9h16l-1 12H5L4 9Z"/><path d="M8 9a4 4 0 0 1 8 0M9 13v.01M15 13v.01"/></> },
  { name: 'Driver & Transport', description: 'Cab, truck and company drivers', icon: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/><path d="M12 3v6m0 6v6m-9-9h6m6 0h6"/></> },
];

function MatchIllustration() {
  return <svg className="sc" viewBox="0 0 480 470" role="img" aria-label="An offer letter drops onto the page, is stamped, and a new person joins the team.">
    <circle cx="240" cy="205" r="175" fill="var(--soft)"/><circle cx="240" cy="205" r="205" fill="none" stroke="var(--ln)" strokeWidth="2" strokeDasharray="6 8"/>
    <rect x="52" y="50" width="52" height="52" fill="none" stroke="var(--co)" strokeWidth="3" transform="rotate(18 78 76)"/><polygon points="410,60 448,128 372,128" fill="var(--pr)"/><circle cx="64" cy="300" r="12" fill="var(--co)"/><circle cx="430" cy="270" r="8" fill="none" stroke="var(--pr)" strokeWidth="3"/>
    <g id="offer-letter"><rect x="150" y="62" width="180" height="214" rx="8" fill="var(--sf)" stroke="var(--ink)" strokeWidth="2.5"/><polygon points="298,62 330,62 330,94" fill="var(--soft)" stroke="var(--ink)" strokeWidth="2.5" strokeLinejoin="round"/><rect x="172" y="86" width="52" height="12" rx="2" fill="var(--pr)"/>
      <rect x="172" y="120" width="120" height="8" rx="3" fill="var(--ln)"/><rect x="172" y="142" width="136" height="8" rx="3" fill="var(--ln)"/><rect x="172" y="164" width="100" height="8" rx="3" fill="var(--ln)"/><rect x="172" y="186" width="124" height="8" rx="3" fill="var(--ln)"/>
      <g id="stamp"><circle cx="290" cy="236" r="28" fill="var(--co)"/><circle cx="290" cy="236" r="19" fill="none" stroke="var(--cd)" strokeWidth="2.5"/><path d="m280 236 7 7 13-15" fill="none" stroke="var(--cd)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/></g>
    </g>
    <rect x="40" y="418" width="400" height="6" rx="3" fill="var(--ink)"/>
    <g fill="var(--pr)"><circle cx="100" cy="364" r="17" opacity=".9"/><path d="M68 418a32 32 0 0 1 64 0z" opacity=".9"/><circle cx="180" cy="364" r="17" opacity=".6"/><path d="M148 418a32 32 0 0 1 64 0z" opacity=".6"/><circle cx="340" cy="364" r="17" opacity=".75"/><path d="M308 418a32 32 0 0 1 64 0z" opacity=".75"/><circle cx="420" cy="364" r="17" opacity=".45"/><path d="M388 418a32 32 0 0 1 64 0z" opacity=".45"/></g>
    <g id="silhouette" fill="none" stroke="var(--mut)" strokeWidth="2.5" strokeDasharray="5 5"><circle cx="260" cy="364" r="17"/><path d="M228 418a32 32 0 0 1 64 0"/></g><circle id="arrival-ring" cx="260" cy="392" r="30" fill="none" stroke="var(--co)" strokeWidth="3"/><g id="new-person" fill="var(--co)"><circle cx="260" cy="364" r="17"/><path d="M228 418a32 32 0 0 1 64 0z"/></g>
    <g id="join-check"><circle cx="292" cy="346" r="14" fill="var(--pr)"/><path d="m285 346 5 5 9-10" fill="none" stroke="var(--on)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/></g><text id="welcome-text" x="240" y="455" textAnchor="middle" fontFamily="Manrope,sans-serif" fontWeight="800" fontSize="17" fill="var(--ink)">Welcome to the team</text>
  </svg>;
}

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('go'); observer.unobserve(entry.target); }
    }), { threshold: 0.25 });
    containerRef.current?.querySelectorAll('.io').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  function findJobs(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = new FormData(event.currentTarget).get('trade')?.toString() || '';
    window.location.href = `/jobs${value ? `?category=${encodeURIComponent(value)}` : ''}`;
  }

  return <div ref={containerRef} className="landing-root">
    <main id="top">
      <section className="hero"><div className="wrap">
        <div className="hero-copy"><p className="eyebrow"><span className="eyebrow-dot"/> Work that moves you forward</p><h1>New job.<br/><em>New start.</em></h1>
          <p className="lede">Skip the resume. Our AI matches your skills to jobs near you, and you apply in one tap.</p>
          <form className="find" onSubmit={findJobs}><label className="sr-only" htmlFor="trade">What work do you do?</label><select id="trade" name="trade" defaultValue=""><option value="">What work do you do?</option>{trades.map(({ name }) => <option key={name}>{name}</option>)}</select><button className="btn" type="submit">Find my job <span aria-hidden="true">→</span></button></form>
          <div className="pills"><span><i className="shape-circle"/>AI job matching</span><span><i className="shape-triangle"/>No resume needed</span><span><i className="shape-square"/>Pay shown upfront</span></div>
        </div><MatchIllustration />
      </div></section>

      <section className="sec alt"><div className="wrap"><div className="head"><span className="section-kicker">Find your next move</span><h2>Find work in your trade.</h2><p>Six areas where skilled people get hired every day.</p></div>
        <div className="grid">{trades.map(({ name, description, icon }) => <Link className="card tr" href={`/jobs?category=${encodeURIComponent(name)}`} key={name}><span className="trade-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg></span><h3>{name}</h3><p>{description}</p><b>Browse jobs <span aria-hidden="true">→</span></b></Link>)}</div>
      </div></section>

      <section className="ai io"><div className="wrap"><div><span className="section-kicker light">A better way to get hired</span><h2>AI does the matching. You do the work.</h2><p className="sub">No resume to write and no endless scrolling. Our AI finds the jobs that fit you.</p>
        <div className="pts"><div><i className="shape-circle coral"/><p><b>It reads your skills</b>Tell us the work you do, in your own words.</p></div><div><i className="shape-triangle cream"/><p><b>It finds jobs near you</b>Matched on trade, pay and location.</p></div><div><i className="shape-square teal"/><p><b>It shows employers why you fit</b>Your profile goes straight to them with one tap.</p></div></div>
      </div><svg className="dg" viewBox="0 0 360 260" role="img" aria-label="Your skills connected to a best match job"><line x1="92" y1="130" x2="250" y2="50"/><line className="match-line" x1="92" y1="130" x2="250" y2="130"/><line x1="92" y1="130" x2="250" y2="210"/><circle cx="60" cy="130" r="34" fill="#FDFBF7"/><rect className="n" x="248" y="28" width="46" height="46" rx="6"/><rect className="n" x="244" y="104" width="54" height="54" rx="6"/><rect className="n" x="248" y="186" width="46" height="46" rx="6"/><text x="60" y="190" textAnchor="middle">Your skills</text><text x="271" y="178" textAnchor="middle" className="best-match">Best match</text></svg></div></section>

      <section className="sec"><div className="wrap"><div className="head"><span className="section-kicker">Built for both sides</span><h2>Why we built this.</h2></div><div className="two"><div className="card story"><p className="who">Ravi, a driver</p><p className="q">Nine years behind the wheel. He knows every road in the city.</p><p className="q muted">He has never owned a resume, so each new job starts with asking around and waiting.</p></div><div className="card story"><p className="who">Meena, a warehouse owner</p><p className="q">Her business is growing and she needs a fleet coordinator by Monday.</p><p className="q muted">She needs someone she can trust, and a fast way to find them.</p></div></div></div></section>

      <section className="meet io"><div className="wrap"><svg className="mt" viewBox="0 0 520 190" aria-hidden="true"><g className="person-left"><circle cx="140" cy="64" r="28"/><path d="M90 170a50 50 0 0 1 100 0z"/></g><g className="person-right"><circle cx="380" cy="64" r="28"/><path d="M330 170a50 50 0 0 1 100 0z"/></g><line x1="200" y1="140" x2="320" y2="140"/><g className="meet-check"><circle cx="260" cy="140" r="18"/><path d="m251 140 6 6 11-12"/></g></svg><h2>Then they meet on Nava Udyog.</h2><p>Your skills are your profile. No resume, no long forms, no waiting.</p></div></section>

      <section className="sec"><div className="wrap"><div className="head"><span className="section-kicker">Simple from the start</span><h2>From looking to hired in three steps.</h2></div><div className="steps"><div className="card step"><span className="step-number">01</span><h3>Add your skills</h3><p>Your name, your number and the work you do.</p></div><div className="card step"><span className="step-number coral-number">02</span><h3>Apply in one tap</h3><p>Your profile goes straight to the employer.</p></div><div className="card step"><span className="step-number">03</span><h3>Start work</h3><p>Pay is shown upfront, whether daily, weekly or monthly.</p></div></div></div></section>

      <section className="sec alt"><div className="wrap"><PlatformStats /></div></section>

      <section className="sec"><div className="wrap"><div className="head"><span className="badge">Coming soon</span><h2 className="soon-title">Hiring is only the beginning.</h2><p>Soon, Nava Udyog will be the one stop for every workforce need, not just jobs.</p></div><div className="svc">{[['Recruitment','Bulk, leadership and niche hiring'],['Staffing','Temporary, contract and permanent'],['Payroll','Setup, outsourcing and compliance'],['HR consulting','Policies and compliance'],['Employee management','Onboarding to performance'],['Training and HR technology','Skills and tools for your team']].map(([title, description]) => <div className="card service" key={title}><h3>{title}</h3><p>{description}</p></div>)}</div><p className="early-access"><Link className="btn c" href="/auth/register">Get early access as an employer <span aria-hidden="true">→</span></Link></p></div></section>

      <section className="sec final-section"><div className="wrap"><div className="fin"><div className="card box dark-box"><span className="section-kicker light">For workers</span><h2>I’m looking for work.</h2><p>Create a free profile and let our AI find your next job.</p><Link className="btn light-btn" href="/auth/register">Join as a worker <span aria-hidden="true">→</span></Link></div><div className="card box"><span className="section-kicker">For employers</span><h2>I’m hiring.</h2><p>Post a job and reach skilled workers across India.</p><Link className="btn" href="/auth/register">Post a job <span aria-hidden="true">→</span></Link></div></div></div></section>
    </main>
  </div>;
}
