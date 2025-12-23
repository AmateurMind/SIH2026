/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { HeroScene, QuantumComputerScene } from './components/QuantumScene';
import { SurfaceCodeDiagram, TransformerDecoderDiagram, PerformanceMetricDiagram } from './components/Diagrams';
import { Menu, X, BookOpen, Briefcase, Mic, FileText, Award, Shield, Layout, Users } from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
  <div className="p-6 bg-white rounded-xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 group">
    <div className="w-12 h-12 bg-stone-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-nobel-gold/10 transition-colors">
      <Icon className="text-stone-700 group-hover:text-nobel-gold" size={24} />
    </div>
    <h3 className="font-serif text-xl text-stone-900 mb-2">{title}</h3>
    <p className="text-sm text-stone-600 leading-relaxed">{description}</p>
  </div>
);

const App: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F8F4] text-stone-800 selection:bg-nobel-gold selection:text-white">

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-[#F9F8F4]/90 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-8 h-8 bg-nobel-gold rounded-lg flex items-center justify-center text-white font-serif font-bold text-xl shadow-sm">C</div>
            <span className={`font-serif font-bold text-lg tracking-wide transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'}`}>
              Campus<span className="font-normal text-stone-500">Buddy</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium tracking-wide text-stone-600">
            <a href="#features" onClick={scrollToSection('features')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Features</a>
            <a href="#ecosystem" onClick={scrollToSection('ecosystem')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Ecosystem</a>
            <a href="#analytics" onClick={scrollToSection('analytics')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Analytics</a>
            <button
              className="px-6 py-2 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors shadow-sm cursor-pointer"
            >
              Portal Login
            </button>
          </div>

          <button className="md:hidden text-stone-900 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-[#F9F8F4] flex flex-col items-center justify-center gap-8 text-xl font-serif animate-fade-in">
          <a href="#features" onClick={scrollToSection('features')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Features</a>
          <a href="#ecosystem" onClick={scrollToSection('ecosystem')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Ecosystem</a>
          <a href="#analytics" onClick={scrollToSection('analytics')} className="hover:text-nobel-gold transition-colors cursor-pointer uppercase">Analytics</a>
          <button
            onClick={() => setMenuOpen(false)}
            className="px-6 py-3 bg-stone-900 text-white rounded-lg shadow-lg cursor-pointer"
          >
            Login
          </button>
        </div>
      )}

      {/* Hero Section */}
      <header className="relative h-screen flex items-center justify-center overflow-hidden">
        <HeroScene />

        <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(249,248,244,0.92)_0%,rgba(249,248,244,0.7)_50%,rgba(249,248,244,0.4)_100%)]" />

        <div className="relative z-10 container mx-auto px-6 text-center">
          <div className="inline-block mb-4 px-3 py-1 border border-nobel-gold text-nobel-gold text-xs tracking-[0.2em] uppercase font-bold rounded-full backdrop-blur-sm bg-white/30">
            Next Gen Campus Recruitment
          </div>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-medium leading-tight md:leading-[1.1] mb-8 text-stone-900 drop-shadow-sm">
            AI-Powered <br /><span className="italic font-normal text-stone-600 text-3xl md:text-5xl block mt-4">Internship & Placement Portal</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-stone-700 font-light leading-relaxed mb-12">
            Automate your campus hiring with AI Mock Interviews, 1-Click Applications, and smart resume parsing. Connecting talent with opportunity instantly.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-4">
            <button className="px-8 py-4 bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-all hover:scale-105 shadow-lg font-medium tracking-wide flex items-center justify-center gap-2">
              <Briefcase size={18} /> For Recruiters
            </button>
            <button className="px-8 py-4 bg-white border border-stone-200 text-stone-800 rounded-lg hover:bg-stone-50 transition-all hover:border-stone-400 shadow-sm font-medium tracking-wide flex items-center justify-center gap-2">
              <BookOpen size={18} /> For Students
            </button>
          </div>
        </div>
      </header>

      <main>
        {/* Core Features Grid */}
        <section id="features" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl mb-4 text-stone-900">Intelligent Recruitment</h2>
              <div className="w-16 h-1 bg-nobel-gold mx-auto opacity-60"></div>
              <p className="mt-4 text-stone-600 max-w-2xl mx-auto">
                Replace manual coordination with automated workflows. From resume building to final offer, CampusBuddy handles the heavy lifting.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={Mic}
                title="AI Mock Interviews"
                description="Practice with our voice-enabled AI bot. Get instant scoring on confidence, technical accuracy, and soft skills."
              />
              <FeatureCard
                icon={FileText}
                title="Auto-Resume Builder"
                description="Generate ATS-friendly resumes in seconds. Our system auto-fills data from your verified digital profile."
              />
              <FeatureCard
                icon={Award}
                title="Digital Badges"
                description="Earn verifiable badges for internships and skills. Showcase your achievements directly to recruiters."
              />
              <FeatureCard
                icon={Layout}
                title="1-Click Apply"
                description="Apply to multiple companies instantly. Smart filters ensure you only see roles you are eligible for."
              />
              <FeatureCard
                icon={Shield}
                title="Secure Role Access"
                description="Dedicated portals for Placement Officers, Students, and Mentors with secure, role-based data privacy."
              />
              <FeatureCard
                icon={Users}
                title="Mentor Approval"
                description="Digital workflow for internship approvals. Mentors can review progress and sign off digitally."
              />
            </div>
          </div>
        </section>

        {/* AI Interview / Skill Gap Section */}
        <section className="py-24 bg-[#F9F8F4] border-t border-stone-200">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white text-stone-600 text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-stone-200 shadow-sm">
                  <Mic size={14} className="text-nobel-gold" /> AI TRAINING
                </div>
                <h2 className="font-serif text-4xl md:text-5xl mb-6 text-stone-900">AI Skill Assessment</h2>
                <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                  Our interactive skill matrix maps a student's technical abilities in real-time. Identify weak spots before the actual interview.
                </p>
                <ul className="space-y-4 text-stone-600 mb-8">
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-nobel-gold/20 flex items-center justify-center text-nobel-gold">✓</div>
                    <span>Voice-based technical Q&A sessions</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-nobel-gold/20 flex items-center justify-center text-nobel-gold">✓</div>
                    <span>Instant feedback on code logic</span>
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-nobel-gold/20 flex items-center justify-center text-nobel-gold">✓</div>
                    <span>Behavioral analysis scoring</span>
                  </li>
                </ul>
              </div>
              <div>
                <SurfaceCodeDiagram />
              </div>
            </div>
          </div>
        </section>

        {/* The Pipeline (Recruiters & TPO) */}
        <section className="py-24 bg-stone-900 text-stone-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="w-96 h-96 rounded-full bg-stone-600 blur-[100px] absolute top-[-100px] left-[-100px]"></div>
            <div className="w-96 h-96 rounded-full bg-nobel-gold blur-[100px] absolute bottom-[-100px] right-[-100px]"></div>
          </div>

          <div className="container mx-auto px-6 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="order-2 lg:order-1">
                <TransformerDecoderDiagram />
              </div>
              <div className="order-1 lg:order-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-stone-800 text-nobel-gold text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-stone-700">
                  <Briefcase size={14} /> WORKFLOW AUTOMATION
                </div>
                <h2 className="font-serif text-4xl md:text-5xl mb-6 text-white">Smart Application Pipeline</h2>
                <p className="text-lg text-stone-400 mb-6 leading-relaxed">
                  For Placement Cells & Recruiters: Track thousands of applications in a single view.
                </p>
                <p className="text-lg text-stone-400 leading-relaxed">
                  Our system automatically parses resumes, matches candidates to job descriptions (JD), schedules interviews, and generates offer letters upon selection. Zero paperwork.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Analytics Section */}
        <section id="analytics" className="py-24 bg-white">
          <div className="container mx-auto px-6">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="font-serif text-4xl md:text-5xl mb-6 text-stone-900">Real-time Placement Analytics</h2>
              <p className="text-lg text-stone-600 leading-relaxed">
                Colleges get a bird's-eye view of placement stats, average packages, and skill trends. Recruiters see funnel metrics.
              </p>
            </div>
            <div className="max-w-3xl mx-auto">
              <PerformanceMetricDiagram />
            </div>
          </div>
        </section>

        {/* Ecosystem Tabs */}
        <section id="ecosystem" className="py-24 bg-[#F5F4F0] border-t border-stone-200">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="font-serif text-4xl mb-6 text-stone-900">One Platform, Four Roles</h2>
              <p className="text-stone-500 max-w-2xl mx-auto">Seamless collaboration between all stakeholders in the placement process.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Student */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 hover:border-nobel-gold transition-colors">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-6">
                  <Users size={20} className="text-stone-700" />
                </div>
                <h3 className="font-serif text-xl mb-3">Students</h3>
                <p className="text-sm text-stone-600 leading-relaxed">Build digital profiles, practice with AI, apply to drives, and track status instantly.</p>
              </div>

              {/* Placement Cell */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 hover:border-nobel-gold transition-colors">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-6">
                  <Layout size={20} className="text-stone-700" />
                </div>
                <h3 className="font-serif text-xl mb-3">Placement Cell</h3>
                <p className="text-sm text-stone-600 leading-relaxed">Invite companies, manage student data, schedule drives, and generate compliance reports.</p>
              </div>

              {/* Mentors */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 hover:border-nobel-gold transition-colors">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-6">
                  <Award size={20} className="text-stone-700" />
                </div>
                <h3 className="font-serif text-xl mb-3">Mentors</h3>
                <p className="text-sm text-stone-600 leading-relaxed">Approve internships, provide project feedback, and validate skill badges for students.</p>
              </div>

              {/* Recruiters */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 hover:border-nobel-gold transition-colors">
                <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center mb-6">
                  <Briefcase size={20} className="text-stone-700" />
                </div>
                <h3 className="font-serif text-xl mb-3">Recruiters</h3>
                <p className="text-sm text-stone-600 leading-relaxed">Post jobs, filter candidates via AI scoring, and conduct seamless remote interviews.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Visual / Abstract tech section */}
        <section className="py-24 bg-white border-t border-stone-200">
          <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-6 relative h-[400px]">
              <div className="w-full h-full bg-[#1a1a1a] rounded-xl overflow-hidden relative border border-stone-800 shadow-2xl">
                <QuantumComputerScene />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="text-white font-serif text-xl mb-1">CampusBuddy Neural Core</div>
                  <div className="text-stone-400 text-xs uppercase tracking-widest">Processing Application...</div>
                </div>
              </div>
            </div>
            <div className="md:col-span-6">
              <h2 className="font-serif text-4xl mb-6 text-stone-900">Certificate Generation</h2>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                Upon successful completion of an internship or training module, the system automatically mints a verifiable digital certificate.
              </p>
              <p className="text-lg text-stone-600 mb-8 leading-relaxed">
                These certificates are cryptographically signed and can be directly shared on LinkedIn or attached to the digital resume, giving recruiters absolute trust in the candidate's credentials.
              </p>
              <button className="px-8 py-3 border border-stone-900 text-stone-900 font-medium rounded-lg hover:bg-stone-50 transition-colors">
                View Sample Certificate
              </button>
            </div>
          </div>
        </section>

      </main>

      <footer className="bg-stone-900 text-stone-400 py-16">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-nobel-gold rounded text-stone-900 flex items-center justify-center font-bold">C</div>
              <div className="text-white font-serif font-bold text-2xl">CAMPUS BUDDY</div>
            </div>
            <p className="text-sm max-w-md leading-relaxed mb-6">
              The complete operating system for campus placements. Bridging the gap between academia and industry with intelligent automation.
            </p>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-stone-700 transition-colors">in</button>
              <button className="w-10 h-10 rounded-full bg-stone-800 flex items-center justify-center hover:bg-stone-700 transition-colors">x</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 text-sm">
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase tracking-wider">Platform</h4>
              <a href="#" className="hover:text-nobel-gold transition-colors">For Students</a>
              <a href="#" className="hover:text-nobel-gold transition-colors">For Colleges</a>
              <a href="#" className="hover:text-nobel-gold transition-colors">For Recruiters</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase tracking-wider">Features</h4>
              <a href="#" className="hover:text-nobel-gold transition-colors">Resume Builder</a>
              <a href="#" className="hover:text-nobel-gold transition-colors">AI Mock Interviews</a>
              <a href="#" className="hover:text-nobel-gold transition-colors">Placement Stats</a>
            </div>
            <div className="flex flex-col gap-4">
              <h4 className="text-white font-bold uppercase tracking-wider">Legal</h4>
              <a href="#" className="hover:text-nobel-gold transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-nobel-gold transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-nobel-gold transition-colors">Security</a>
            </div>
          </div>
        </div>
        <div className="border-t border-stone-800 mt-16 pt-8 text-center text-xs text-stone-600">
          © 2025 CampusBuddy Portal. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default App;