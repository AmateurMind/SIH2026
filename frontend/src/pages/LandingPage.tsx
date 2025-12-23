/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useEffect } from 'react';
import { Suspense } from 'react';
const HeroScene = React.lazy(() => import('../components/landing-page/QuantumScene').then(module => ({ default: module.HeroScene })));
import { SurfaceCodeDiagram, TransformerDecoderDiagram, PerformanceMetricDiagram } from '../components/landing-page/Diagrams';
import { Menu, X, BookOpen, Briefcase, Mic, FileText, Award, Shield, Layout, Users, Globe, ChevronDown, CheckCircle2, ArrowRight, GraduationCap } from 'lucide-react';
import { APPS } from '../config/apps';
import LoginDropdown from '../components/landing-page/LoginDropdown';

const FeatureCard = ({ icon: Icon, title, description, colorClass }: { icon: any, title: string, description: string, colorClass: string }) => (
    <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-${colorClass}-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 group-hover:bg-${colorClass}-500/20 transition-colors`}></div>
        <div className={`w-12 h-12 bg-${colorClass}-50 text-${colorClass}-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            <Icon size={24} />
        </div>
        <h3 className="font-sans font-bold text-xl text-slate-900 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed">{description}</p>
    </div >
);

const LandingPage: React.FC = () => {
    const [scrolled, setScrolled] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Accessibility: Font Size Control
    const [fontSize, setFontSize] = useState(100);
    useEffect(() => {
        document.documentElement.style.fontSize = `${fontSize}%`;
        return () => {
            document.documentElement.style.fontSize = '100%';
        };
    }, [fontSize]);

    // Language Control
    const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
    const [currentLang, setCurrentLang] = useState('EN');
    const languages = [
        { code: 'EN', label: 'English' },
        { code: 'HI', label: 'Hindi' },
        { code: 'ES', label: 'Spanish' },
        { code: 'FR', label: 'French' }
    ];

    const translations: any = {
        EN: {
            features: "Features",
            ecosystem: "Ecosystem",
            analytics: "Analytics",
            help: "Help",
            heroTag: "Next Gen Campus Recruitment",
            heroTitle: "AI-Powered",
            heroSubtitle: "Internship & Placement Portal",
            heroDesc: "Automate your campus hiring with AI Mock Interviews, 1-Click Applications, and smart resume parsing. Connecting talent with opportunity instantly.",
            forRecruiters: "For Recruiters",
            forStudents: "For Students",
            intelligentRecruitment: "Intelligent Recruitment",
            intelligentDesc: "Replace manual coordination with automated workflows. From resume building to final offer, CampusBuddy handles the heavy lifting.",
            launchCareer: "Launch Your Career With",
            topRecruiters: "50+ Top Recruiters",
            createAccount: "Create Account for Students"
        },
        HI: {
            features: "विशेषताएँ",
            ecosystem: "पारिस्थितिकी तंत्र",
            analytics: "विश्लेषण",
            help: "सहायता",
            heroTag: "नेक्स्ट जेन कैंपस रिक्रूटमेंट",
            heroTitle: "एआई-संचालित",
            heroSubtitle: "इंटर्नशिप और प्लेसमेंट पोर्टल",
            heroDesc: "एआई मॉक इंटरव्यू, 1-क्लिक एप्लिकेशन और स्मार्ट रिज्यूमे पार्सिंग के साथ अपनी कैंपस हायरिंग को स्वचालित करें। प्रतिभा को अवसर से तुरंत जोड़ना।",
            forRecruiters: "रिक्रूटर्स के लिए",
            forStudents: "छात्रों के लिए",
            intelligentRecruitment: "बुद्धिमान भर्ती",
            intelligentDesc: "स्वचालित वर्कफ़्लो के साथ मैन्युअल समन्वय को बदलें। रिज्यूमे बनाने से लेकर अंतिम प्रस्ताव तक, कैंपसबडी भारी काम संभालता है।",
            launchCareer: "अपना करियर शुरू करें",
            topRecruiters: "50+ शीर्ष रिक्रूटर्स के साथ",
            createAccount: "खाता बनाएं"
        },
        ES: {
            features: "Características",
            ecosystem: "Ecosistema",
            analytics: "Analítica",
            help: "Ayuda",
            heroTag: "Reclutamiento de Próxima Generación",
            heroTitle: "Impulsado por IA",
            heroSubtitle: "Portal de Pasantías y Colocación",
            heroDesc: "Automatice su contratación en el campus con entrevistas simuladas por IA, solicitudes con 1 clic y análisis inteligente de currículums. Conectando talento con oportunidades al instante.",
            forRecruiters: "Para Reclutadores",
            forStudents: "Para Estudiantes",
            intelligentRecruitment: "Reclutamiento Inteligente",
            intelligentDesc: "Reemplace la coordinación manual con flujos de trabajo automatizados. Desde la creación de currículums hasta la oferta final, CampusBuddy se encarga del trabajo pesado.",
            launchCareer: "Lanza Tu Carrera Con",
            topRecruiters: "50+ Mejores Reclutadores",
            createAccount: "Crear Cuenta"
        },
        FR: {
            features: "Fonctionnalités",
            ecosystem: "Écosystème",
            analytics: "Analytique",
            help: "Aide",
            heroTag: "Recrutement de Nouvelle Génération",
            heroTitle: "Propulsé par l'IA",
            heroSubtitle: "Portail de Stages et Placement",
            heroDesc: "Automatisez votre recrutement sur le campus avec des simulations d'entretiens IA, des candidatures en 1 clic et une analyse intelligente de CV. Connecter instantanément le talent à l'opportunité.",
            forRecruiters: "Pour les Recruteurs",
            forStudents: "Pour les Étudiants",
            intelligentRecruitment: "Recrutement Intelligent",
            intelligentDesc: "Remplacez la coordination manuelle par des flux de travail automatisés. De la création de CV à l'offre finale, CampusBuddy s'occupe du gros du travail.",
            launchCareer: "Lancez Votre Carrière Avec",
            topRecruiters: "50+ Meilleurs Recruteurs",
            createAccount: "Créer un Compte"
        }
    };

    const t = translations[currentLang];

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
        <div className="min-h-screen bg-white text-slate-800 font-sans selection:bg-indigo-500 selection:text-white">

            {/* Navigation */}
            <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/80 backdrop-blur-md shadow-sm py-4' : 'bg-transparent py-6'}`}>
                <div className="container mx-auto px-6 flex justify-between items-center">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <GraduationCap size={24} />
                        </div>
                        <span className={`font-bold text-xl tracking-tight transition-opacity ${scrolled ? 'opacity-100' : 'opacity-0 md:opacity-100'} text-slate-900`}>
                            Campus<span className="text-blue-600">Buddy</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <a href="#features" onClick={scrollToSection('features')} className="hover:text-blue-600 transition-colors cursor-pointer">Features</a>
                        <a href="#ecosystem" onClick={scrollToSection('ecosystem')} className="hover:text-blue-600 transition-colors cursor-pointer">Ecosystem</a>
                        <a href="#analytics" onClick={scrollToSection('analytics')} className="hover:text-blue-600 transition-colors cursor-pointer">Analytics</a>

                        {/* Accessibility Controls */}
                        <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                            {/* Language Selector */}
                            <div className="relative">
                                <button
                                    onClick={() => setLanguageMenuOpen(!languageMenuOpen)}
                                    className="flex items-center gap-2 cursor-pointer hover:text-blue-600 transition-colors group py-2"
                                >
                                    <Globe size={18} className="text-slate-400 group-hover:text-blue-600" />
                                    <span className="font-semibold text-sm">{currentLang}</span>
                                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-200 ${languageMenuOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {languageMenuOpen && (
                                    <div className="absolute top-full left-0 mt-2 w-32 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-fade-in overflow-hidden z-50">
                                        {languages.map(lang => (
                                            <button
                                                key={lang.code}
                                                onClick={() => {
                                                    setCurrentLang(lang.code);
                                                    setLanguageMenuOpen(false);
                                                }}
                                                className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 hover:text-blue-600 transition-colors flex items-center justify-between ${currentLang === lang.code ? 'text-blue-600 font-bold bg-slate-50' : 'text-slate-600'}`}
                                            >
                                                <span>{lang.label}</span>
                                                {currentLang === lang.code && <div className="w-1.5 h-1.5 rounded-full bg-blue-600"></div>}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Font Size Controls */}
                            <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1 select-none">
                                <button
                                    onClick={() => setFontSize(s => Math.max(s - 10, 90))}
                                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm hover:text-blue-600 text-slate-600 font-medium text-xs transition-all"
                                    aria-label="Decrease font size"
                                >
                                    A-
                                </button>
                                <div className="w-px h-4 bg-slate-300"></div>
                                <button
                                    onClick={() => setFontSize(s => Math.min(s + 10, 130))}
                                    className="w-8 h-8 flex items-center justify-center rounded hover:bg-white hover:shadow-sm hover:text-blue-600 text-slate-900 font-bold text-sm transition-all"
                                    aria-label="Increase font size"
                                >
                                    A+
                                </button>
                            </div>
                        </div>

                        <a
                            href="#contact"
                            onClick={(e) => {
                                e.preventDefault();
                                const element = document.getElementById('contact');
                                if (element) {
                                    element.scrollIntoView({ behavior: 'smooth' });
                                    // Highlight effect
                                    element.classList.add('bg-slate-800/50', 'p-4', 'rounded-xl', 'transition-all', 'duration-500');
                                    setTimeout(() => {
                                        element.classList.remove('bg-slate-800/50', 'p-4', 'rounded-xl');
                                    }, 2000);
                                }
                            }}
                            className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-medium hover:bg-slate-800 transition-all shadow-sm hover:shadow-md cursor-pointer"
                        >
                            Help
                        </a>
                    </div>

                    <button className="md:hidden text-slate-900 p-2" onClick={() => setMenuOpen(!menuOpen)}>
                        {menuOpen ? <X /> : <Menu />}
                    </button>
                </div>
            </nav>

            {/* Mobile Menu */}
            {
                menuOpen && (
                    <div className="fixed inset-0 z-40 bg-white flex flex-col items-center justify-center gap-8 text-xl font-medium animate-fade-in text-slate-800">
                        <a href="#features" onClick={scrollToSection('features')} className="hover:text-blue-600 transition-colors cursor-pointer">Features</a>
                        <a href="#ecosystem" onClick={scrollToSection('ecosystem')} className="hover:text-blue-600 transition-colors cursor-pointer">Ecosystem</a>
                        <a href="#analytics" onClick={scrollToSection('analytics')} className="hover:text-blue-600 transition-colors cursor-pointer">Analytics</a>
                        <a
                            href={`${APPS.STUDENT.url}/login`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-8 py-3 bg-blue-600 text-white rounded-full shadow-lg cursor-pointer hover:bg-blue-700 transition-colors"
                        >
                            Login
                        </a>
                    </div>
                )
            }

            {/* Hero Section */}
            <header className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
                <Suspense fallback={<div className="absolute inset-0 z-0 bg-gradient-to-br from-slate-50 to-white" />}>
                    <HeroScene />
                </Suspense>

                <div className="absolute inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/40 via-white to-white" />

                <div className="relative z-10 container mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold tracking-wider uppercase animate-fade-in-up">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                        </span>
                        {t.heroTag}
                    </div>

                    <h1 className="font-sans text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-tight mb-8 text-slate-900 drop-shadow-sm">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#172554] via-[#1e3a8a] to-[#172554]">{t.heroTitle}</span>
                        <br />
                        <span className="text-4xl md:text-6xl text-slate-700 font-medium block mt-2">{t.heroSubtitle}</span>
                    </h1>

                    <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-600 leading-relaxed mb-12">
                        {t.heroDesc}
                    </p>

                    <div className="mt-12 flex flex-col items-center animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <LoginDropdown />
                        <p className="mt-6 text-sm text-slate-400 font-medium">
                            Select your role to access the dashboard
                        </p>
                    </div>
                </div>
            </header>

            <main>
                {/* Core Features Grid */}
                <section id="features" className="py-24 bg-white relative">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="text-center mb-16">
                            <h2 className="font-bold text-4xl mb-4 text-slate-900">{t.intelligentRecruitment}</h2>
                            <div className="w-20 h-1.5 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
                            <p className="mt-4 text-slate-600 max-w-2xl mx-auto text-lg">
                                {t.intelligentDesc}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FeatureCard
                                icon={Mic}
                                title="AI Mock Interviews"
                                description="Practice with our voice-enabled AI bot. Get instant scoring on confidence, technical accuracy, and soft skills."
                                colorClass="purple"
                            />
                            <FeatureCard
                                icon={FileText}
                                title="Auto-Resume Builder"
                                description="Generate ATS-friendly resumes in seconds. Our system auto-fills data from your verified digital profile."
                                colorClass="blue"
                            />
                            <FeatureCard
                                icon={Award}
                                title="Digital Badges"
                                description="Earn verifiable badges for internships and skills. Showcase your achievements directly to recruiters."
                                colorClass="amber"
                            />
                            <FeatureCard
                                icon={Layout}
                                title="1-Click Apply"
                                description="Apply to multiple companies instantly. Smart filters ensure you only see roles you are eligible for."
                                colorClass="emerald"
                            />
                            <FeatureCard
                                icon={Shield}
                                title="Secure Role Access"
                                description="Dedicated portals for Placement Officers, Students, and Mentors with secure, role-based data privacy."
                                colorClass="rose"
                            />
                            <FeatureCard
                                icon={Users}
                                title="Mentor Approval"
                                description="Digital workflow for internship approvals. Mentors can review progress and sign off digitally."
                                colorClass="indigo"
                            />
                        </div>
                    </div>
                </section>



                {/* The Pipeline (Recruiters & TPO) */}
                <section className="py-24 bg-[#0F172A] text-white overflow-hidden relative">
                    <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
                        <div className="w-[800px] h-[800px] rounded-full bg-indigo-600/20 blur-[120px] absolute top-[-200px] left-[-200px]"></div>
                        <div className="w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[100px] absolute bottom-[-100px] right-[-100px]"></div>
                    </div>

                    <div className="container mx-auto px-6 relative z-10">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                            <div className="order-2 lg:order-1">
                                <TransformerDecoderDiagram />
                            </div>
                            <div className="order-1 lg:order-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 text-blue-400 text-xs font-bold tracking-widest uppercase rounded-full mb-6 border border-slate-700">
                                    <Briefcase size={14} /> WORKFLOW AUTOMATION
                                </div>
                                <h2 className="font-bold text-4xl md:text-5xl mb-6 text-white">Smart Application Pipeline</h2>
                                <p className="text-lg text-slate-400 mb-6 leading-relaxed">
                                    For Placement Cells & Recruiters: Track thousands of applications in a single view.
                                </p>
                                <p className="text-lg text-slate-400 leading-relaxed">
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
                            <h2 className="font-bold text-4xl md:text-5xl mb-6 text-slate-900">Real-time Placement Analytics</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Colleges get a bird's-eye view of placement stats, average packages, and skill trends. Recruiters see funnel metrics.
                            </p>
                        </div>
                        <div className="max-w-4xl mx-auto transform hover:scale-[1.01] transition-transform duration-500">
                            <PerformanceMetricDiagram />
                        </div>
                    </div>
                </section>

                {/* Ecosystem Tabs */}
                <section id="ecosystem" className="py-24 bg-slate-50 border-t border-slate-200">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-16">
                            <h2 className="font-bold text-4xl mb-6 text-slate-900">One Platform, Four Roles</h2>
                            <p className="text-slate-500 max-w-2xl mx-auto text-lg">Seamless collaboration between all stakeholders in the placement process.</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Student */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors">
                                    <Users size={24} className="text-blue-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-slate-900">Students</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Build digital profiles, practice with AI, apply to drives, and track status instantly.</p>
                            </div>

                            {/* Placement Cell */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-indigo-400 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-indigo-600 transition-colors">
                                    <Layout size={24} className="text-indigo-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-slate-900">Placement Cell</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Invite companies, manage student data, schedule drives, and generate compliance reports.</p>
                            </div>

                            {/* Mentors -> Faculty */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-purple-400 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-600 transition-colors">
                                    <Award size={24} className="text-purple-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-slate-900">Faculty</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Approve internships, provide project feedback, and validate skill badges for students.</p>
                            </div>

                            {/* Recruiters */}
                            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-orange-400 hover:shadow-lg transition-all duration-300 group">
                                <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-600 transition-colors">
                                    <Briefcase size={24} className="text-orange-600 group-hover:text-white transition-colors" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-slate-900">Recruiters</h3>
                                <p className="text-sm text-slate-600 leading-relaxed">Post jobs, filter candidates via AI scoring, and conduct seamless remote interviews.</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Visual / Abstract tech section */}
                <section className="py-24 bg-white border-t border-slate-200 overflow-hidden">
                    <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
                        <div className="md:col-span-6 relative h-[450px]">
                            <div className="absolute inset-0 bg-blue-600/5 rounded-3xl transform rotate-3"></div>
                            <div className="w-full h-full bg-slate-100 rounded-2xl overflow-hidden relative border border-slate-200 shadow-2xl group transform hover:-rotate-1 transition-transform duration-500">
                                <img
                                    src="https://images.pexels.com/photos/3184436/pexels-photo-3184436.jpeg"
                                    alt="Team Collaboration"
                                    loading="lazy"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                                <div className="absolute bottom-8 left-8 text-white">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Award className="text-yellow-400" />
                                        <span className="font-bold uppercase tracking-widest text-sm">Verified Credentials</span>
                                    </div>
                                    <p className="text-2xl font-bold">Block-chain Secured Certificates</p>
                                </div>
                            </div>
                        </div>
                        <div className="md:col-span-6">
                            <h2 className="font-bold text-4xl mb-6 text-slate-900">Certificate Generation</h2>
                            <p className="text-lg text-slate-600 mb-6 leading-relaxed">
                                Upon successful completion of an internship or training module, the system automatically mints a verifiable digital certificate.
                            </p>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                These certificates are cryptographically signed and can be directly shared on LinkedIn or attached to the digital resume, giving recruiters absolute trust in the candidate's credentials.
                            </p>
                            <button
                                onClick={() => {
                                    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
                                    const baseUrl = apiUrl.replace('/api', '');
                                    window.open(`${baseUrl}/certificates/CERT-IPP-STU012-INT001-2025.pdf`, '_blank');
                                }}
                                className="px-8 py-3 bg-white border-2 border-slate-900 text-slate-900 font-bold rounded-full hover:bg-slate-900 hover:text-white transition-colors shadow-sm cursor-pointer"
                            >
                                View Sample Certificate
                            </button>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-6">
                        <div className="bg-slate-900 rounded-[2.5rem] p-12 md:p-16 flex flex-col md:flex-row items-center justify-between relative overflow-hidden shadow-2xl shadow-slate-900/20">
                            {/* Content */}
                            <div className="relative z-10 max-w-2xl">
                                <h2 className="font-sans text-4xl md:text-5xl text-white font-bold mb-8 leading-tight">
                                    {t.launchCareer} <br />
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-300">{t.topRecruiters}</span>
                                </h2>
                                <a
                                    href={`${APPS.STUDENT.url}/login?signup=true`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-block px-10 py-4 bg-white text-blue-700 rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                                >
                                    {t.createAccount}
                                </a>
                            </div>

                            {/* Image */}
                            <div className="relative z-10 mt-12 md:mt-0 md:absolute md:right-0 md:bottom-0 md:h-[115%] w-full md:w-auto flex justify-center md:justify-end pointer-events-none">
                                <img
                                    src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg"
                                    alt="Happy Student"
                                    loading="lazy"
                                    className="h-64 md:h-full object-contain object-bottom drop-shadow-2xl hover:scale-105 transition-transform duration-500 mask-image-b"
                                />
                            </div>

                            {/* Decorative Circles */}
                            <div className="absolute top-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                        </div>
                    </div>
                </section>

            </main>

            <footer className="bg-slate-900 text-slate-400 py-16">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-start gap-12">
                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-8 h-8 bg-blue-50 rounded-full text-blue-600 flex items-center justify-center">
                                <GraduationCap size={20} />
                            </div>
                            <div className="text-white font-bold text-2xl">CAMPUS BUDDY</div>
                        </div>
                        <p className="text-sm max-w-md leading-relaxed mb-6">
                            The complete operating system for campus placements. Bridging the gap between academia and industry with intelligent automation.
                        </p>
                        <div className="flex gap-4">
                            <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all">in</a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-black hover:text-white transition-all">x</a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-sm">
                        <div className="flex flex-col gap-4">
                            <h4 className="text-white font-bold uppercase tracking-wider">Platform</h4>
                            <a href={`${APPS.STUDENT.url}/login`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">For Students</a>
                            <a href={`${APPS.ADMIN.url}/admin/login`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">For Colleges</a>
                            <a href={`${APPS.RECRUITER.url}/recruiter/login`} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors">For Recruiters</a>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h4 className="text-white font-bold uppercase tracking-wider">Features</h4>
                            <a href="#" className="hover:text-blue-400 transition-colors">Resume Builder</a>
                            <a href="#" className="hover:text-blue-400 transition-colors">AI Mock Interviews</a>
                            <a href="#" className="hover:text-blue-400 transition-colors">Placement Stats</a>
                        </div>
                        <div className="flex flex-col gap-4">
                            <h4 className="text-white font-bold uppercase tracking-wider">Legal</h4>
                            <a href="#" className="hover:text-blue-400 transition-colors">Privacy Policy</a>
                            <a href="#" className="hover:text-blue-400 transition-colors">Terms of Service</a>
                            <a href="#" className="hover:text-blue-400 transition-colors">Security</a>
                        </div>
                        <div id="contact" className="flex flex-col gap-4">
                            <h4 className="text-white font-bold uppercase tracking-wider">Contact Us</h4>
                            <a href="mailto:rohanpawar907553@gmail.com" className="hover:text-blue-400 transition-colors">rohanpawar907553@gmail.com</a>
                            <a href="tel:8767342647" className="hover:text-blue-400 transition-colors">8767342647</a>
                            <span className="text-slate-500">Shivaji Nagar, Pune</span>
                        </div>
                    </div>
                </div>
                <div className="border-t border-slate-800 mt-16 pt-8 text-center text-xs text-slate-600">
                    © 2025 CampusBuddy Portal. All rights reserved.
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
