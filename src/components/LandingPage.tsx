import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, ArrowRight, Shield, Zap, Globe, Layers, Check, 
  ChevronRight, Star, Mail, Play, Code, CheckCircle, ChevronLeft,
  Tv, MessageSquare, Award, ArrowUpRight, HelpCircle, Download,
  Palette, Mic, RefreshCw, Sliders, ChevronDown
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onLoginClick: () => void;
}

export default function LandingPage({ onGetStarted, onLoginClick }: LandingPageProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeMockupSlide, setActiveMockupSlide] = useState(0);
  const [demoTheme, setDemoTheme] = useState<'professional' | 'creative' | 'elegant' | 'tech'>('professional');
  const [beforeAfterSplit, setBeforeAfterSplit] = useState(50);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // Auto-rotate testimonial index occasionally
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const mockupSlides = [
    {
      title: "The Future of Sustainable Architecture",
      subtitle: "Designing with carbon-negative building materials",
      bullets: [
        "Self-healing bioconcrete seals internal cracks autonomously",
        "Mycelium insulating structures reduce heating costs by 45%",
        "Algae bioreactors integrated directly into double-pane glass facades"
      ],
      theme: "Modern Forest",
      color: "bg-emerald-950 text-emerald-50",
      accent: "text-emerald-400"
    },
    {
      title: "Generative AI in Corporate Finance",
      subtitle: "Automating portfolio risk assessment models",
      bullets: [
        "Real-time synthetic market stress simulations executed instantly",
        "Autonomous cash flow analysis predicts liquidity constraints",
        "LLM-powered document synthesis reduces auditing time by 75%"
      ],
      theme: "Cosmic Steel",
      color: "bg-slate-900 text-slate-50",
      accent: "text-indigo-400"
    },
    {
      title: "The Deep Ocean Micro-Robotics",
      subtitle: "Exploring abyssal ecosystems with swarming sensors",
      bullets: [
        "Autonomous hydrostatic pressure seals certified up to 11,000m",
        "Bioluminescent optical communications network dynamic alignment",
        "Micro-turbine kinetic energy harvesting from thermal vent currents"
      ],
      theme: "Abyssal Midnight",
      color: "bg-blue-950 text-blue-50",
      accent: "text-sky-400"
    }
  ];

  const testimonials = [
    {
      quote: "AuraSlides has completely transformed our enterprise bidding cycles. What used to take three designers an entire weekend now renders in 45 seconds with stunning layouts.",
      author: "Sarah Jenkins",
      role: "VP of Product, Apex Technologies",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
      logo: "APEX"
    },
    {
      quote: "The slide layouts are incredibly premium. It avoids all the boring AI templates and produces genuinely customized themes that feel like high-end Swiss typography.",
      author: "Dominic Thorne",
      role: "Creative Director, Vektor Studio",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
      logo: "VEKTOR"
    },
    {
      quote: "Our global consultants use AuraSlides for real-time document creation in front of clients. It outputs flawless PowerPoint slides and clean PDF summaries instantly.",
      author: "Elena Rostov",
      role: "Principal Consultant, McKinsey Group",
      rating: 5,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80",
      logo: "McKinsey"
    }
  ];

  const faqs = [
    {
      q: "How does the AI generate custom slide presentations?",
      a: "AuraSlides analyzes your prompt or uploaded text utilizing Gemini 2.5 models to structure a logical narrative outline. It then synthesizes structured slide components, speaker notes, and requests DALL-E image models to render beautiful content-specific visuals in one integrated stream."
    },
    {
      q: "Can I edit the content and layouts after they are generated?",
      a: "Absolutely. AuraSlides features a full visual editing workspace. You can drag and reorder slides, modify bullet points, customize typography, regenerate AI image prompts, change visual themes, and tweak the presenter notes freely."
    },
    {
      q: "What export options are supported?",
      a: "We support fully editable PowerPoint formats (.pptx) containing actual vector text, slides, shapes, and notes. We also offer high-fidelity vector PDF print outputs and instant public web-sharing links with password protections."
    },
    {
      q: "Can I use my own brand guidelines or custom color palettes?",
      a: "Yes. Our Pro and Enterprise tiers include Brand Kits, allowing you to lock in specific corporate hex colors, typography weights, logo watermarks, and slide layouts so every deck matches your identity perfectly."
    },
    {
      q: "Do I own the copyright to the generated content and images?",
      a: "Yes. All presentation text, slide arrangements, speaker scripts, and AI-generated image assets generated inside your personal account are 100% owned by you for both personal and commercial use."
    },
    {
      q: "Is my corporate data secure?",
      a: "Data privacy is our top priority. We do not use your proprietary documents or draft presentations to train public AI models. All session requests are securely encrypted in transit and isolated in a virtual sandbox environment."
    }
  ];

  const features = [
    {
      id: "ai-content",
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI-Powered Content Engine",
      description: "Generate professionally balanced copy, bullet structures, and speaker narratives from just a single sentence.",
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80",
      color: "border-indigo-500/30",
      badgeColor: "bg-indigo-950 text-indigo-400"
    },
    {
      id: "ai-images",
      icon: <Globe className="w-6 h-6" />,
      title: "Stunning Context-Aware Images",
      description: "Our generator scans slide semantics to compile relevant high-quality graphics and professional illustrations instantly.",
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&q=80",
      color: "border-purple-500/30",
      badgeColor: "bg-purple-950 text-purple-400"
    },
    {
      id: "smart-outlines",
      icon: <Layers className="w-6 h-6" />,
      title: "Smart Layout Outlines",
      description: "Review a logically structured story outline first. Edit and refine slide-by-slide concepts before rendering.",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80",
      color: "border-rose-500/30",
      badgeColor: "bg-rose-950 text-rose-400"
    },
    {
      id: "voice-scripts",
      icon: <Mic className="w-6 h-6" />,
      title: "Presenter Speech Drafts",
      description: "Every slide generates a natural, high-performance verbal script so you are prepared to pitch instantly.",
      image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?auto=format&fit=crop&w=600&q=80",
      color: "border-teal-500/30",
      badgeColor: "bg-teal-950 text-teal-400"
    },
    {
      id: "premium-themes",
      icon: <Palette className="w-6 h-6" />,
      title: "Swiss-Crafted Design Themes",
      description: "Switch between modern, creative, elegant, and technical aesthetics in one click. Beautiful typography pairing.",
      image: "https://images.unsplash.com/photo-1555255707-c07966088b7b?auto=format&fit=crop&w=600&q=80",
      color: "border-emerald-500/30",
      badgeColor: "bg-emerald-950 text-emerald-400"
    },
    {
      id: "export-anywhere",
      icon: <Download className="w-6 h-6" />,
      title: "Multi-Format Export Suites",
      description: "Export directly to fully editable PowerPoint files (.pptx), vector print PDFs, or premium password-locked share links.",
      image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80",
      color: "border-amber-500/30",
      badgeColor: "bg-amber-950 text-amber-400"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans relative overflow-x-hidden selection:bg-indigo-500 selection:text-white" id="landing-page-root">
      
      {/* Background ambient gradient glow blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-indigo-900/15 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute top-[30%] right-[-10%] w-[45vw] h-[45vw] bg-rose-900/10 rounded-full blur-[140px] -z-10" />
      <div className="absolute bottom-[10%] left-[10%] w-[40vw] h-[40vw] bg-indigo-950/20 rounded-full blur-[130px] -z-10" />

      {/* Decorative Matrix Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-35 -z-20 pointer-events-none" />

      {/* HEADER / NAVIGATION */}
      <nav className="border-b border-slate-800/60 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4" id="nav-container">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-500/10">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="text-xl font-black tracking-tight text-white font-serif">AuraSlides</span>
          </div>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#demo" className="hover:text-white transition-colors">Interactive Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-white transition-colors">Testimonials</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLoginClick}
              className="text-sm font-bold text-slate-300 hover:text-white px-3 py-1.5 cursor-pointer"
            >
              Sign In
            </button>
            <button 
              onClick={onGetStarted}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-lg shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all cursor-pointer flex items-center gap-1.5 group"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 1: HERO SECTION */}
      <section className="pt-20 pb-24 px-6 relative" id="hero-section">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-7 space-y-8 text-left">
            {/* Tagline Badge */}
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-full px-4 py-1.5 text-xs text-indigo-300 font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Introducing Premium AI presentation suites</span>
              <ChevronRight className="w-3 h-3 text-slate-500" />
            </motion.div>

            {/* Heading with elegant serif font */}
            <div className="space-y-4">
              <motion.h1 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-5xl sm:text-7xl font-bold text-white tracking-tight leading-[1.08] font-serif"
              >
                Create Stunning <br />
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-rose-400 bg-clip-text text-transparent">
                  Presentations
                </span> <br />
                with Generative AI.
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-lg sm:text-xl text-slate-400 font-medium max-w-xl leading-relaxed"
              >
                AuraSlides transforms raw prompts or notes into elite, professionally formatted decks containing structured scripts, custom layout styles, and gorgeous context-coherent images.
              </motion.p>
            </div>

            {/* Action CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center gap-4 pt-2"
            >
              <button 
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-xl shadow-indigo-600/30 hover:scale-[1.02] transition-all cursor-pointer flex items-center justify-center gap-2 text-base group"
              >
                <span>Generate Free Deck</span>
                <Sparkles className="w-5 h-5 text-indigo-300 group-hover:rotate-12 transition-transform" />
              </button>
              <a 
                href="#demo"
                className="w-full sm:w-auto px-8 py-4 bg-slate-900 border border-slate-800 hover:bg-slate-850 text-slate-300 hover:text-white font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 text-base"
              >
                <Play className="w-4 h-4 text-slate-400" />
                <span>Examine Live Editor</span>
              </a>
            </motion.div>

            {/* Trust rating badges */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="pt-6 flex flex-wrap items-center gap-8"
            >
              <div className="flex items-center gap-1 text-slate-400">
                <div className="flex -space-x-2">
                  <img className="w-7 h-7 rounded-full border border-slate-950 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=64&q=80" alt="avatar" />
                  <img className="w-7 h-7 rounded-full border border-slate-950 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&q=80" alt="avatar" />
                  <img className="w-7 h-7 rounded-full border border-slate-950 object-cover" src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=64&q=80" alt="avatar" />
                </div>
                <div className="text-xs pl-1">
                  <span className="font-extrabold text-white">10,000+</span> professionals active
                </div>
              </div>
              <div className="h-5 w-[1px] bg-slate-800" />
              <div className="flex items-center gap-1.5">
                <div className="flex">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
                </div>
                <span className="text-xs text-slate-400 font-bold">4.9/5 Rating (G2)</span>
              </div>
            </motion.div>
          </div>

          {/* Premium Floating Interactive Mockup on Right side */}
          <div className="lg:col-span-5 relative mt-8 lg:mt-0">
            <motion.div
              initial={{ opacity: 0, x: 50, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="relative z-10"
            >
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">auraslides_v2.5.tsx</span>
                </div>

                <div className="aspect-[4/3] bg-slate-950 rounded-xl overflow-hidden border border-slate-850 p-6 flex flex-col justify-between relative group">
                  <img 
                    src="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80" 
                    alt="Laptop Workspace Mockup" 
                    className="absolute inset-0 w-full h-full object-cover opacity-20 group-hover:scale-105 transition-transform duration-1000"
                  />
                  <div className="relative z-10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Quarterly Vision Deck</span>
                      <span className="text-[9px] bg-indigo-950 border border-indigo-800 text-indigo-300 px-2 py-0.5 rounded-full font-bold">Theme: Cosmic Steel</span>
                    </div>
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xl font-bold text-white tracking-tight">Enterprise Scaling Architecture</h4>
                      <p className="text-xs text-indigo-200">How generative models optimize cloud latency workflows.</p>
                    </div>
                    <ul className="space-y-1.5 text-[10px] text-slate-300">
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-400" /> Decentralized API nodes optimize globally</li>
                      <li className="flex items-center gap-1.5"><Check className="w-3 h-3 text-indigo-400" /> Hot-swap cache pools reduce render times</li>
                    </ul>
                  </div>

                  <div className="relative z-10 border-t border-slate-800/80 pt-3 flex items-center justify-between text-[9px] text-slate-500">
                    <span>Generated by AuraSlides AI</span>
                    <span>Slide 1 of 8</span>
                  </div>
                </div>
              </div>

              {/* Floating elements decoration */}
              <div className="absolute -top-6 -right-6 w-14 h-14 bg-indigo-600/10 border border-indigo-500/30 rounded-xl flex items-center justify-center text-indigo-400 shadow-lg blur-xs -z-10 animate-bounce" style={{ animationDuration: '6s' }}>
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="absolute -bottom-6 -left-6 w-16 h-16 bg-rose-500/10 border border-rose-500/30 rounded-full -z-10 animate-pulse" />
            </motion.div>
          </div>

        </div>

        {/* Corporate Trust Badges Row */}
        <div className="max-w-7xl mx-auto pt-20 text-center space-y-4 border-t border-slate-900/60 mt-16">
          <p className="text-xs uppercase font-extrabold tracking-widest text-slate-500">ADOPTED BY INNOVATORS AT GLOBAL TEAMS</p>
          <div className="flex flex-wrap items-center justify-center gap-x-16 gap-y-6 opacity-30 grayscale contrast-200">
            <span className="font-sans text-xl font-black tracking-tight text-white">stripe</span>
            <span className="font-serif text-xl font-bold text-white">McKinsey</span>
            <span className="font-sans text-xl font-semibold tracking-wider text-white">A P E X</span>
            <span className="font-mono text-xl font-bold text-white">VEKTOR</span>
            <span className="font-sans text-xl font-extrabold text-white">NETFLIX</span>
          </div>
        </div>
      </section>

      {/* SECTION 2: FEATURES GRID SECTION */}
      <section className="py-24 px-6 border-t border-slate-900 bg-slate-950/40 relative" id="features">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">ENGINEERED FOR PREMIUM QUALITY</h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-serif">Decks designed for high-stakes meetings</h3>
            <p className="text-slate-400 font-medium text-sm sm:text-base">
              AuraSlides skips generic templates. We compile bespoke typography layouts and imagery aligned with your presentation tone.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" id="features-cards">
            {features.map((feat) => (
              <motion.div 
                key={feat.id}
                whileHover={{ y: -6 }}
                className={`bg-slate-900/45 border ${feat.color} p-6 rounded-2xl flex flex-col justify-between hover:bg-slate-900/80 transition-all group relative overflow-hidden`}
              >
                <div className="space-y-4">
                  {/* Card illustrative visual */}
                  <div className="h-40 w-full rounded-xl overflow-hidden relative mb-4">
                    <img 
                      src={feat.image} 
                      alt={feat.title} 
                      className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                    <div className={`absolute bottom-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${feat.badgeColor}`}>
                      Premium Feature
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-950 text-indigo-400 rounded-xl flex items-center justify-center border border-slate-800">
                      {feat.icon}
                    </div>
                    <h4 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors">{feat.title}</h4>
                  </div>
                  
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-4 flex items-center gap-1.5 text-xs font-bold text-indigo-400 group-hover:text-indigo-300">
                  <span>Explore feature detail</span>
                  <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* SECTION 3: HOW IT WORKS SECTION */}
      <section className="py-24 px-6 border-t border-slate-900 relative" id="how-it-works">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">ELEGANT COGNITIVE WORKFLOW</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-serif">Three steps to pitch perfection</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Our streamlined pipeline lets you refine and co-author key ideas before compiling final decks.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative" id="steps-container">
            
            {/* Step 1 */}
            <div className="bg-slate-900/30 border border-slate-850 p-8 rounded-2xl space-y-5 relative">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/20">
                1
              </div>
              <h4 className="text-xl font-bold text-white">Describe Your Concept</h4>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                Provide your presentation theme, focus parameters, slide length guidelines, and select from elegant typography kits.
              </p>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-left font-mono text-[10px] text-slate-500">
                <span className="text-indigo-400 font-bold">&gt;_ prompt:</span> "Quarterly report on sustainable carbon capture investments..."
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-900/30 border border-slate-850 p-8 rounded-2xl space-y-5 relative">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/20">
                2
              </div>
              <h4 className="text-xl font-bold text-white">Fine-tune the Slide Outline</h4>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                AuraSlides AI compiles a logical content flow outline. Instantly reorder slides, delete topics, or lock down structural titles.
              </p>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-300">Slide 1: Executive Summary</span>
                  <span className="text-emerald-400 font-bold">Approved</span>
                </div>
                <div className="flex items-center justify-between text-[10px] bg-slate-950 p-2 rounded-lg border border-slate-800">
                  <span className="text-slate-300">Slide 2: CAPEX Projections</span>
                  <span className="text-indigo-400 font-bold">Reordered</span>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-900/30 border border-slate-850 p-8 rounded-2xl space-y-5 relative">
              <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-black text-lg shadow-lg shadow-indigo-600/20">
                3
              </div>
              <h4 className="text-xl font-bold text-white">Compile & Edit Workspace</h4>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                The AI designs detailed bullets, compiles speaker narratives, and renders matching imagery. Polish layouts in the premium sandbox.
              </p>
              <div className="flex items-center gap-2 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-900/50">
                <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '3s' }} />
                <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-rose-500 h-full w-4/5 animate-pulse" />
                </div>
                <span className="text-[9px] font-bold text-indigo-300">80%</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 4: INTERACTIVE DEMO / PREVIEW SECTION */}
      <section className="py-24 px-6 border-t border-slate-900 bg-slate-950/20 relative" id="demo">
        <div className="max-w-7xl mx-auto space-y-16">
          
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">LIVE COMPARISON</h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-serif">Power of the Aura AI Engine</h3>
            <p className="text-slate-400 font-medium text-sm sm:text-base">
              Use the switcher below to see how a single generated concept adapts flawlessly across standard visual themes.
            </p>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            
            {/* Visual theme selection bar */}
            <div className="flex flex-wrap items-center justify-center gap-3 border-b border-slate-800 pb-5 mb-6">
              <span className="text-xs text-slate-500 font-bold mr-2">Toggle Theme Layout:</span>
              <button 
                onClick={() => setDemoTheme('professional')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${demoTheme === 'professional' ? 'bg-slate-100 text-slate-950 border-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                💼 Professional Slate
              </button>
              <button 
                onClick={() => setDemoTheme('creative')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${demoTheme === 'creative' ? 'bg-rose-900/30 text-rose-300 border-rose-500/50' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                🎨 Creative Coral
              </button>
              <button 
                onClick={() => setDemoTheme('elegant')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${demoTheme === 'elegant' ? 'bg-amber-950/40 text-amber-300 border-amber-500/50 font-serif' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                ✨ Elegant Abyssal
              </button>
              <button 
                onClick={() => setDemoTheme('tech')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer border ${demoTheme === 'tech' ? 'bg-emerald-950/30 text-emerald-300 border-emerald-500/50 font-mono' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                ⚡ Tech Emerald
              </button>
            </div>

            {/* Slider Showcase frame */}
            <div className={`aspect-[16/10] sm:aspect-[16/9] w-full rounded-xl p-8 sm:p-12 text-left flex flex-col justify-between transition-all duration-700 ${
              demoTheme === 'professional' ? 'bg-slate-900 text-slate-50 border border-slate-800' :
              demoTheme === 'creative' ? 'bg-rose-950 text-rose-50 border border-rose-900/50' :
              demoTheme === 'elegant' ? 'bg-indigo-950 text-indigo-100 border border-indigo-900/50 font-serif' :
              'bg-emerald-950 text-emerald-50 border border-emerald-900/50 font-mono'
            }`}>
              <div className="flex items-center justify-between opacity-80 text-xs">
                <span>Enterprise Strategy Showcase</span>
                <span className="font-bold uppercase tracking-wider">{demoTheme} Brand layout</span>
              </div>

              <div className="space-y-6 max-w-2xl my-auto">
                <h4 className="text-2xl sm:text-4xl font-extrabold tracking-tight leading-tight">
                  Adapting Generative Intelligence
                </h4>
                <p className="text-xs sm:text-sm opacity-85 leading-relaxed">
                  How micro-models optimize local cache speeds across client-side state engines for instant data synchronizations.
                </p>
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>Synchronizes DB instances in 40ms without network packet drop.</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-0.5">•</span>
                    <span>Reduces cloud server costs by up to 65% globally.</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-[10px] opacity-60">
                <span>AuraSlides Presentation Suite</span>
                <span>Demo Slide 3 of 5</span>
              </div>
            </div>

            {/* Before / After Slider Tool description */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
              <span>Interactive preview transforms formatting on the fly.</span>
              <button 
                onClick={onGetStarted}
                className="text-indigo-400 font-bold flex items-center gap-1 hover:text-indigo-300"
              >
                <span>Compile your own presentation now</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 5: TESTIMONIALS SECTION */}
      <section className="py-24 px-6 border-t border-slate-900 relative" id="testimonials">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">CUSTOMER REFLECTIONS</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-serif">Loved by high-stakes professionals</h3>
          </div>

          <div className="max-w-4xl mx-auto bg-slate-900/60 border border-slate-800/80 rounded-2xl p-8 sm:p-12 relative overflow-hidden" id="testimonials-carousel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4 }}
                className="space-y-6 text-center sm:text-left"
              >
                <div className="flex justify-center sm:justify-start gap-1">
                  {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-indigo-400 text-indigo-400" />
                  ))}
                </div>

                <blockquote className="text-lg sm:text-2xl font-bold text-white tracking-tight leading-relaxed italic font-serif">
                  "{testimonials[activeTestimonial].quote}"
                </blockquote>

                <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-slate-800 gap-4">
                  <div className="flex items-center gap-4">
                    <img 
                      src={testimonials[activeTestimonial].avatar} 
                      alt={testimonials[activeTestimonial].author} 
                      className="w-12 h-12 rounded-full border border-indigo-500/35 object-cover"
                    />
                    <div className="text-left">
                      <span className="text-base font-bold text-white block">{testimonials[activeTestimonial].author}</span>
                      <span className="text-xs text-indigo-400 font-semibold">{testimonials[activeTestimonial].role}</span>
                    </div>
                  </div>
                  
                  {/* Decorative Company stamp */}
                  <div className="text-xs uppercase font-black tracking-widest text-slate-600 bg-slate-950 px-4 py-2 rounded-lg border border-slate-850">
                    {testimonials[activeTestimonial].logo}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Manual buttons */}
            <div className="absolute bottom-6 right-8 flex items-center gap-2">
              <button
                onClick={() => setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setActiveTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="p-1.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-800 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 6: PRICING SECTION */}
      <section className="py-24 px-6 border-t border-slate-900 bg-slate-950/40 relative" id="pricing">
        <div className="max-w-7xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">TRANSPARENT VALUE</h2>
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-serif">Flexible plans for any presenter scale</h3>
            
            {/* Billing toggle */}
            <div className="pt-6 flex items-center justify-center gap-4">
              <span className={`text-sm font-semibold transition-colors ${billingPeriod === 'monthly' ? 'text-white' : 'text-slate-500'}`}>Monthly billing</span>
              <button
                onClick={() => setBillingPeriod(billingPeriod === 'monthly' ? 'yearly' : 'monthly')}
                className="w-12 h-6.5 bg-indigo-950 border border-slate-800 rounded-full relative cursor-pointer outline-none p-0.5"
              >
                <div className={`w-5 h-5 bg-indigo-500 rounded-full transition-all ${billingPeriod === 'yearly' ? 'translate-x-5.5' : ''}`} />
              </button>
              <span className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${billingPeriod === 'yearly' ? 'text-white' : 'text-slate-500'}`}>
                <span>Yearly billing</span>
                <span className="bg-emerald-950 text-emerald-400 text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Save 20%</span>
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto" id="pricing-cards">
            {/* Free tier */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl flex flex-col justify-between space-y-6 hover:border-slate-800 hover:bg-slate-900/60 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Starter</span>
                <h4 className="text-2xl font-black text-white">Free Plan</h4>
                <p className="text-slate-400 text-xs">Best for testing out basic AI presentation outlines.</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-white">$0</span>
                  <span className="text-xs text-slate-500"> / forever</span>
                </div>
                <div className="border-t border-slate-800/80 my-4" />
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Create up to 3 presentation decks</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Outline preview review</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Standard PDF exports only</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={onGetStarted}
                className="w-full py-3 bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-300 font-bold rounded-xl transition-all cursor-pointer text-sm"
              >
                Get Started
              </button>
            </div>

            {/* Pro tier (Glowing visual card) */}
            <div className="bg-indigo-950/20 border-2 border-indigo-500/80 p-8 rounded-2xl flex flex-col justify-between space-y-6 relative hover:scale-[1.01] transition-all shadow-xl shadow-indigo-950/20">
              {/* Premium pop badge */}
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-gradient-to-r from-indigo-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md shadow-indigo-500/20 animate-pulse">
                Most Popular
              </div>

              <div className="space-y-4">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Professional</span>
                <h4 className="text-2xl font-black text-white">Pro Creator</h4>
                <p className="text-indigo-200/60 text-xs">For high-performance creators, teachers, and consultants.</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-white font-serif">
                    {billingPeriod === 'monthly' ? '$24' : '$19'}
                  </span>
                  <span className="text-xs text-slate-400"> / month</span>
                </div>
                <div className="border-t border-indigo-900/50 my-4" />
                <ul className="space-y-3 text-sm text-indigo-200">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Unlimited presentation creations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>AI image generation (unlimited fallbacks)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Full editable PowerPoint exports (PPTX)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Premium customized style themes</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={onGetStarted}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all cursor-pointer text-sm"
              >
                Unlock Pro Access
              </button>
            </div>

            {/* Enterprise tier */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-8 rounded-2xl flex flex-col justify-between space-y-6 hover:border-slate-800 hover:bg-slate-900/60 transition-all">
              <div className="space-y-4">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Enterprise</span>
                <h4 className="text-2xl font-black text-white">Enterprise Suite</h4>
                <p className="text-slate-400 text-xs">For corporate consulting teams, boards, and global agencies.</p>
                <div className="pt-2">
                  <span className="text-3xl font-black text-white">Custom</span>
                  <span className="text-xs text-slate-500"> / team quota</span>
                </div>
                <div className="border-t border-slate-800/80 my-4" />
                <ul className="space-y-3 text-sm text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Dedicated organization branding guidelines</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Multiple sub-team sharing, synchronization</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-indigo-400 shrink-0" />
                    <span>Dedicated high-rate quota limits</span>
                  </li>
                </ul>
              </div>
              <button 
                onClick={onGetStarted}
                className="w-full py-3 bg-slate-950 border border-slate-800 hover:bg-slate-850 hover:text-white text-slate-300 font-bold rounded-xl transition-all cursor-pointer text-sm"
              >
                Contact Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: FAQ / ACCORDION SECTION */}
      <section className="py-24 px-6 border-t border-slate-900 relative" id="faq">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-indigo-400">HAVE QUESTIONS?</h2>
            <h3 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-serif">Frequently Asked Questions</h3>
            <p className="text-slate-400 text-xs sm:text-sm">
              Everything you need to know about AuraSlides presentation compilers.
            </p>
          </div>

          <div className="space-y-4 border-t border-slate-800 pt-8">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border-b border-slate-850 pb-4">
                <button
                  onClick={() => setFaqOpen(faqOpen === idx ? null : idx)}
                  className="w-full py-4 flex items-center justify-between text-left text-base font-bold text-slate-200 hover:text-white transition-colors cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-300 ${faqOpen === idx ? 'rotate-180 text-indigo-400' : ''}`} />
                </button>
                <AnimatePresence initial={false}>
                  {faqOpen === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="text-slate-400 text-xs sm:text-sm leading-relaxed pb-4 pr-6">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 8: CTA / NEWSLETTER SECTION */}
      <section className="py-24 px-6 border-t border-slate-900 relative" id="newsletter">
        <div className="max-w-5xl mx-auto bg-gradient-to-tr from-indigo-950/40 via-slate-900 to-rose-950/20 border border-slate-800 rounded-3xl p-8 sm:p-16 text-center space-y-8 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-rose-500/5 rounded-full blur-[100px] -z-10" />

          <div className="max-w-2xl mx-auto space-y-4">
            <h3 className="text-3xl sm:text-5xl font-bold text-white tracking-tight font-serif">
              Ready to generate <br />
              your next winning deck?
            </h3>
            <p className="text-slate-400 font-medium text-xs sm:text-base max-w-lg mx-auto">
              Join thousands of founders, executives, consultants, and teachers building slides 10x faster with AuraSlides.
            </p>
          </div>

          <div className="max-w-md mx-auto">
            {newsletterSubmitted ? (
              <motion.div 
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 bg-emerald-950/30 border border-emerald-800/60 rounded-2xl flex items-center justify-center gap-3 text-emerald-400 text-sm font-bold"
              >
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                <span>You have successfully signed up for VIP template access! 🚀</span>
              </motion.div>
            ) : (
              <form 
                onSubmit={(e) => { 
                  e.preventDefault(); 
                  if (newsletterEmail.trim()) {
                    setNewsletterSubmitted(true); 
                  }
                }} 
                className="flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  required
                  placeholder="Enter your email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm outline-none focus:border-indigo-500 transition-all"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-2 text-sm shrink-0"
                >
                  <span>Join VIP List</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
            <p className="text-[10px] text-slate-500 mt-3 font-medium">No credit card required. Lock in free tier credits forever.</p>
          </div>
        </div>
      </section>

      {/* SECTION 9: FOOTER SECTION */}
      <footer className="border-t border-slate-900 bg-slate-950/80 pt-16 pb-8 px-6 relative" id="footer">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 pb-12">
          
          {/* Logo & description column */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight text-white font-serif">AuraSlides</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              Creating high-impact outlines, presenter speech drafts, and fully styled visuals. Built on advanced generative document algorithms for professional presenters.
            </p>
          </div>

          {/* Links column 1 */}
          <div className="space-y-3.5">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Product Suite</span>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><a href="#features" className="hover:text-white transition-colors">Smart Templates</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">Outline compiler</a></li>
              <li><a href="#demo" className="hover:text-white transition-colors">Premium themes</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Team workspace</a></li>
            </ul>
          </div>

          {/* Links column 2 */}
          <div className="space-y-3.5">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Connect Workspace</span>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Google OAuth integration</a></li>
              <li><a href="#" className="hover:text-white transition-colors">PowerPoint plugin</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Help Center documentation</a></li>
            </ul>
          </div>

          {/* Links column 3 */}
          <div className="space-y-3.5">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Legal & Security</span>
            <ul className="space-y-2.5 text-xs font-semibold text-slate-400">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-white transition-colors">GDPR compliance</a></li>
            </ul>
          </div>

        </div>

        {/* Deep bottom disclaimer and copyright */}
        <div className="max-w-7xl mx-auto border-t border-slate-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 font-medium gap-4">
          <span>&copy; {new Date().getFullYear()} AuraSlides Premium Presentation Engine. All rights reserved.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-all">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-all">Terms of Service</a>
            <a href="#" className="hover:text-white transition-all">Cookie Settings</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
