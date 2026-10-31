'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import './landing.css';

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('on');
          observer.unobserve(entry.target);

          const statEls = entry.target.querySelectorAll<HTMLElement>('[data-n]');
          statEls.forEach((el) => {
            const targetNum = Number(el.dataset.n);
            const suffix = el.dataset.s || '';
            const startTime = performance.now();

            const animate = (now: number) => {
              const progress = Math.min(1, (now - startTime) / 1100);
              const currentVal = Math.round(targetNum * (1 - Math.pow(1 - progress, 3)));
              el.textContent = `${currentVal}${progress < 1 ? '' : suffix}`;
              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };
            requestAnimationFrame(animate);
          });
        });
      },
      { threshold: 0.15 }
    );

    const elements = containerRef.current?.querySelectorAll('.rv');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="landing-root">
      <main id="top">
        {/* Hero */}
        <section className="hero">
          <div className="wrap">
            <div>
              <h1>
                New job.<br />
                <em>New start.</em>
              </h1>
              <p className="l">
                Skilled people look for work. Businesses look for hands. Nava Udyog is the one stop where they find each other, and everything that comes after.
              </p>
              <div className="cta">
                <Link className="btn" href="/jobs">Find a job</Link>
                <Link className="btn g" href="/auth/register">Post a job</Link>
              </div>
            </div>
            <div className="cards" aria-hidden="true">
              <div className="card">
                <span className="pill">Verified employer</span>
                <h3>Warehouse Fleet Coordinator</h3>
                <p className="m">Apex Logistics India · Bangalore Outer Ring Road</p>
                <p className="pay">₹25,000 / month</p>
              </div>
              <div className="card">
                <span className="pill">No resume needed</span>
                <h3>Your skills are your profile</h3>
                <div className="chips">
                  <span>Driving</span>
                  <span>Dispatch</span>
                  <span>Kannada</span>
                  <span>Hindi</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stories */}
        <section className="sec alt">
          <div className="wrap">
            <div className="head rv">
              <h2>Two people. One missing link.</h2>
            </div>
            <div className="two rv">
              <div className="story">
                <p className="who">The worker</p>
                <p>Ravi has driven trucks for nine years and knows every road in the city.</p>
                <p>He has never owned a resume, so every new job starts with asking around and waiting.</p>
              </div>
              <div className="story">
                <p className="who">The employer</p>
                <p>Meena runs a fast-growing warehouse and needs a fleet coordinator by Monday.</p>
                <p>She doesn’t need a degree. She needs someone she can trust, and a quick way to find them.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Meet Banner */}
        <section className="meet">
          <div className="wrap rv">
            <h2>Then they meet.</h2>
            <p>On Nava Udyog, your skills are your profile. No resume, no long forms, no waiting.</p>
          </div>
        </section>

        {/* Steps */}
        <section className="sec">
          <div className="wrap">
            <div className="head rv">
              <h2>Three steps from looking to hired.</h2>
            </div>
            <div className="steps rv">
              <div className="step">
                <b>1</b>
                <h3>Add your skills</h3>
                <p>Your name, your number and the work you do.</p>
              </div>
              <div className="step">
                <b>2</b>
                <h3>Apply in one tap</h3>
                <p>Your profile goes straight to the employer.</p>
              </div>
              <div className="step">
                <b>3</b>
                <h3>Start work</h3>
                <p>Pay is shown upfront: daily, weekly or monthly.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="sec alt">
          <div className="wrap">
            <div className="head rv">
              <h2>Work in every trade that keeps India moving.</h2>
            </div>
            <div className="grid rv">
              <Link className="tr" href="/jobs?category=Construction%20%26%20Labour">
                <h3>Construction &amp; Labour</h3>
                <p>Site work and field roles</p>
                <span>Browse jobs</span>
              </Link>
              <Link className="tr" href="/jobs?category=Manufacturing%20%26%20Factory">
                <h3>Manufacturing &amp; Factory</h3>
                <p>Operators and line workers</p>
                <span>Browse jobs</span>
              </Link>
              <Link className="tr" href="/jobs?category=Delivery%20%26%20Logistics">
                <h3>Delivery &amp; Logistics</h3>
                <p>Riders, warehouse and fleet</p>
                <span>Browse jobs</span>
              </Link>
              <Link className="tr" href="/jobs?category=Security%20%26%20Housekeeping">
                <h3>Security &amp; Housekeeping</h3>
                <p>Guards and facility staff</p>
                <span>Browse jobs</span>
              </Link>
              <Link className="tr" href="/jobs?category=Retail%20%26%20Sales">
                <h3>Retail &amp; Sales</h3>
                <p>Store and field sales</p>
                <span>Browse jobs</span>
              </Link>
              <Link className="tr" href="/jobs?category=Driver%20%26%20Transport">
                <h3>Driver &amp; Transport</h3>
                <p>Cab, truck and company drivers</p>
                <span>Browse jobs</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="sec">
          <div className="wrap rv">
            <div className="stats">
              <div className="stat">
                <strong data-n="10" data-s="K+">0</strong>
                <span>Active jobs</span>
              </div>
              <div className="stat">
                <strong data-n="50" data-s="K+">0</strong>
                <span>Workers</span>
              </div>
              <div className="stat">
                <strong data-n="500" data-s="+">0</strong>
                <span>Companies</span>
              </div>
              <div className="stat">
                <strong>24/7</strong>
                <span>Support</span>
              </div>
            </div>
          </div>
        </section>

        {/* Coming Soon */}
        <section className="sec alt soon">
          <div className="wrap">
            <div className="head rv">
              <span className="pill">Coming soon</span>
              <h2 style={{ marginTop: '16px' }}>Hiring is only the beginning.</h2>
              <p>Soon, Nava Udyog will be the one stop for every workforce need, not just jobs.</p>
            </div>
            <div className="grid rv">
              <div className="card"><h3>Recruitment</h3><p>Bulk, leadership and niche hiring</p></div>
              <div className="card"><h3>Staffing</h3><p>Temporary, contract and permanent</p></div>
              <div className="card"><h3>Payroll</h3><p>Setup, outsourcing and compliance</p></div>
              <div className="card"><h3>HR Consulting</h3><p>Policies and compliance</p></div>
              <div className="card"><h3>Employee Management</h3><p>From onboarding to performance</p></div>
              <div className="card"><h3>Training &amp; HR Technology</h3><p>Skills and tools for your team</p></div>
            </div>
            <p className="rv" style={{ marginTop: '36px' }}>
              <Link className="btn" href="/auth/register">Get early access as an employer</Link>
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="sec">
          <div className="wrap">
            <div className="fin rv">
              <div className="box d">
                <h2>I’m looking for work.</h2>
                <p>Create a free profile and apply to verified employers in minutes.</p>
                <Link className="btn" style={{ background: 'var(--bg)', color: 'var(--ink)' }} href="/auth/register">
                  Join as a worker
                </Link>
              </div>
              <div className="box">
                <h2>I’m hiring.</h2>
                <p>Post a job and reach skilled workers across India.</p>
                <Link className="btn" href="/auth/register">
                  Post a job
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

    </div>
  );
}
