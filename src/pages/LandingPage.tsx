import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import { Brain, Users, School, Heart, BarChart3, Building, CheckCircle2, ArrowRight, Globe, MessageSquare, Stethoscope, BookOpen, Shield, Eye, HandMetal, Sparkles, ClipboardList } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import nuriaLogo from '@/assets/nuria-logo.png';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const disorders = [
    { icon: Brain, key: 'autism', color: 'text-blue-400', bg: 'bg-blue-500/15' },
    { icon: Eye, key: 'adhd', color: 'text-amber-400', bg: 'bg-amber-500/15' },
    { icon: MessageSquare, key: 'language', color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
    { icon: BookOpen, key: 'learning', color: 'text-violet-400', bg: 'bg-violet-500/15' },
    { icon: Heart, key: 'delay', color: 'text-rose-400', bg: 'bg-rose-500/15' },
    { icon: HandMetal, key: 'motor', color: 'text-teal-400', bg: 'bg-teal-500/15' },
  ];

  const platformFeatures = [
    { icon: Shield, key: 'screening', color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { icon: ArrowRight, key: 'orientation', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { icon: Users, key: 'coordination', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { icon: BarChart3, key: 'followup', color: 'text-violet-500', bg: 'bg-violet-500/10' },
    { icon: Stethoscope, key: 'teleconsult', color: 'text-teal-500', bg: 'bg-teal-500/10' },
    { icon: Heart, key: 'guidance', color: 'text-rose-500', bg: 'bg-rose-500/10' },
  ];

  const benefits = [
    { icon: Heart, key: 'parents', accent: 'border-blue-500' },
    { icon: Stethoscope, key: 'professionals', accent: 'border-emerald-500' },
    { icon: School, key: 'schools', accent: 'border-amber-500' },
    { icon: Users, key: 'community', accent: 'border-orange-500' },
    { icon: BarChart3, key: 'programs', accent: 'border-teal-500' },
    { icon: Building, key: 'ministries', accent: 'border-indigo-500' },
  ];

  const faqItems = Array.from({ length: 10 }, (_, i) => ({
    q: t(`faq.q${i + 1}`),
    a: t(`faq.a${i + 1}`),
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* ═══════════════════ HERO ═══════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center overflow-hidden" style={{ background: 'linear-gradient(165deg, hsl(205 78% 22%) 0%, hsl(205 78% 16%) 50%, hsl(205 78% 12%) 100%)' }}>
        {/* Decorative circles */}
        <div className="absolute top-20 left-[-10%] w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, hsl(36 90% 55%), transparent 70%)' }} />
        <div className="absolute bottom-10 right-[-5%] w-[400px] h-[400px] rounded-full opacity-[0.05]" style={{ background: 'radial-gradient(circle, hsl(160 55% 42%), transparent 70%)' }} />
        
        {/* Africa silhouette subtle watermark */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/[0.03] text-[400px] font-black leading-none select-none pointer-events-none hidden xl:block">🌍</div>

        <div className="container mx-auto px-4 pt-24 pb-32 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-5 py-2.5 mb-10 animate-fade-in">
              <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--accent))] animate-pulse" />
              <span className="text-white/90 text-sm font-medium tracking-wide">Plateforme africaine de neurodéveloppement</span>
            </div>

            {/* Logo - DOUBLED */}
            <img src={nuriaLogo} alt="NURIA" className="h-32 md:h-48 lg:h-56 mx-auto mb-10 brightness-0 invert drop-shadow-2xl animate-fade-in" style={{ animationDelay: '0.1s' }} />

            {/* Title with orange accent */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold leading-[1.1] mb-8 animate-fade-in" style={{ animationDelay: '0.15s' }}>
              <span className="text-white">Détection précoce,{'\n'}coordination des soins</span>
              <br />
              <span className="text-[hsl(var(--accent))]">et accompagnement des familles</span>
            </h1>

            {/* Subtitles */}
            <p className="text-white/90 text-lg md:text-xl font-semibold mb-4 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              La première plateforme africaine dédiée aux troubles du neurodéveloppement
            </p>
            <p className="text-white/60 text-base md:text-lg mb-6 max-w-2xl mx-auto animate-fade-in leading-relaxed" style={{ animationDelay: '0.25s' }}>
              Une solution numérique innovante pour surveiller le développement des enfants, repérer les signes d'alerte, faciliter l'accès aux soins spécialisés et coordonner les acteurs de santé, d'éducation et de la communauté.
            </p>
            <p className="text-[hsl(var(--accent))]/80 italic text-base mb-10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              Pensée pour l'Afrique. Déployée pour les systèmes de santé, les familles et les professionnels.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in" style={{ animationDelay: '0.35s' }}>
              <Button 
                size="xl" 
                className="bg-[hsl(var(--accent))] hover:bg-[hsl(36,90%,48%)] text-white shadow-xl shadow-amber-500/20 text-base px-8 py-6 rounded-xl group"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Demander une démonstration
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              {/* CORRECTION : Bouton bleu au lieu de contour blanc */}
              <Button 
                size="xl"
                className="bg-[#0056A8] hover:bg-[#004080] text-white shadow-xl text-base px-8 py-6 rounded-xl border-none transition-all"
                onClick={() => navigate('/login')}
              >
                Se connecter
              </Button>
              
              {/* NOUVEAU BOUTON : PORTAIL AGENT DE TERRAIN */}
              <Button 
                size="xl"
                className="bg-white/15 hover:bg-white/25 text-white border border-white/20 text-base px-8 py-6 rounded-xl backdrop-blur-sm transition-all"
                onClick={() => navigate('/recensement')}
              >
                <ClipboardList className="mr-2 h-5 w-5" />
                Portail Agent de Terrain
              </Button>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full" preserveAspectRatio="none">
            <path d="M0 120L48 110C96 100 192 80 288 70C384 60 480 60 576 65C672 70 768 80 864 85C960 90 1056 90 1152 82C1248 74 1344 58 1392 50L1440 42V120H1392C1344 120 1248 120 1152 120C1056 120 960 120 864 120C768 120 672 120 576 120C480 120 384 120 288 120C192 120 96 120 48 120H0Z" fill="hsl(210, 20%, 98%)" />
          </svg>
        </div>
      </section>

      {/* ═══════════════════ PROBLEM ═══════════════════ */}
      <section id="problem" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <span className="text-[hsl(var(--accent))] font-semibold text-sm tracking-widest uppercase mb-3 block">Le constat</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">{t('problem.title')}</h2>
            <p className="text-muted-foreground text-lg leading-relaxed">{t('problem.desc')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { val: '15%', icon: '⚠️' },
              { val: '5+ ans', icon: '⏰' },
              { val: '↓', icon: '🔗' },
            ].map((item, i) => (
              <div key={i} className="bg-card rounded-2xl p-8 card-hover text-center border border-border group">
                <div className="text-5xl mb-4">{item.icon}</div>
                <div className="text-4xl font-extrabold text-primary mb-2">{item.val}</div>
                <div className="font-semibold mb-1">{t(`problem.stat${i + 1}`)}</div>
                <div className="text-sm text-muted-foreground">{t(`problem.stat${i + 1}.desc`)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ DISORDERS ═══════════════════ */}
      <section id="disorders" className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(165deg, hsl(205 78% 18%) 0%, hsl(205 78% 14%) 100%)' }}>
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <span className="text-[hsl(var(--accent))] font-semibold text-sm tracking-widest uppercase mb-3 block">Troubles couverts</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">{t('disorders.title')}</h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">{t('disorders.subtitle')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {disorders.map(({ icon: Icon, key, color, bg }) => (
              <div key={key} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group hover:scale-[1.02]">
                <div className={`w-14 h-14 rounded-xl ${bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-7 w-7 ${color}`} />
                </div>
                <h3 className="font-bold text-lg mb-2 text-white">{t(`disorders.${key}`)}</h3>
                <p className="text-sm text-white/55">{t(`disorders.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ EARLY DETECTION ═══════════════════ */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-16 items-center">
            <div>
              <span className="text-[hsl(var(--accent))] font-semibold text-sm tracking-widest uppercase mb-3 block">Pourquoi agir tôt ?</span>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">{t('early.title')}</h2>
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">{t('early.desc')}</p>
              <ul className="space-y-4">
                {['point1', 'point2', 'point3', 'point4'].map((p) => (
                  <li key={p} className="flex items-start gap-4 bg-card rounded-xl p-4 border border-border card-hover">
                    <CheckCircle2 className="h-6 w-6 text-[hsl(var(--secondary))] mt-0.5 flex-shrink-0" />
                    <span className="font-medium">{t(`early.${p}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="rounded-3xl p-12 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, hsl(205 78% 20%), hsl(205 78% 30%))' }}>
                <div className="text-center">
                  <div className="text-8xl md:text-9xl font-extrabold text-[hsl(var(--accent))] mb-2 leading-none">0-5</div>
                  <div className="text-2xl font-bold text-white">ans</div>
                  <div className="text-white/60 mt-2 text-lg">Fenêtre critique d'intervention</div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-[hsl(var(--accent))]/20 blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full bg-[hsl(var(--secondary))]/20 blur-2xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════ PLATFORM FEATURES ═══════════════════ */}
      <section id="platform" className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[hsl(var(--accent))] font-semibold text-sm tracking-widest uppercase mb-3 block">Fonctionnalités</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('platform.title')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {platformFeatures.map(({ icon: Icon, key, color, bg }) => (
              <div key={key} className="bg-card rounded-2xl p-8 card-hover border border-border text-center group hover:border-primary/30">
                <div className={`w-16 h-16 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform`}>
                  <Icon className={`h-8 w-8 ${color}`} />
                </div>
                <h3 className="font-bold text-lg mb-2">{t(`platform.${key}`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`platform.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ BENEFITS ═══════════════════ */}
      <section id="benefits" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-[hsl(var(--accent))] font-semibold text-sm tracking-widest uppercase mb-3 block">Pour qui ?</span>
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t('benefits.title')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map(({ icon: Icon, key, accent }) => (
              <div key={key} className={`bg-card rounded-2xl p-6 card-hover border-l-4 ${accent} border border-border`}>
                <Icon className="h-8 w-8 text-primary mb-4" />
                <h3 className="font-bold text-lg mb-2">{t(`benefits.${key}`)}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{t(`benefits.${key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ COVERAGE ═══════════════════ */}
      <section className="py-24 relative overflow-hidden" style={{ background: 'linear-gradient(165deg, hsl(205 78% 18%) 0%, hsl(205 78% 12%) 100%)' }}>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Globe className="h-20 w-20 mx-auto mb-8 text-[hsl(var(--accent))]/60" />
          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">{t('coverage.title')}</h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">{t('coverage.desc')}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-10">
            {['🇨🇮 Côte d\'Ivoire', '🇸🇳 Sénégal', '🇲🇱 Mali', '🇧🇫 Burkina Faso', '🇩🇯 Djibouti', '🇬🇳 Guinée', '🇨🇲 Cameroun', '🇲🇬 Madagascar'].map((c) => (
              <div key={c} className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-full px-5 py-2.5 text-white/80 text-sm font-medium">{c}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PARTNERS ═══════════════════ */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-10">{t('partners.title')}</h2>
          <div className="flex flex-wrap justify-center gap-6">
            {['OMS', 'UNICEF', 'UNESCO', 'Union Africaine', 'Banque Mondiale'].map((p) => (
              <div key={p} className="bg-muted rounded-xl px-10 py-5 font-semibold text-muted-foreground/60 text-lg border border-border">{p}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════ CONTACT ═══════════════════ */}
      <section id="contact" className="py-24 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[hsl(var(--accent))] font-semibold text-sm tracking-widest uppercase mb-3 block">Nous contacter</span>
            <h2 className="text-3xl md:text-5xl font-bold">{t('contact.title')}</h2>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); alert(t('contact.success')); }} className="max-w-lg mx-auto space-y-4">
            <input type="text" placeholder={t('contact.name')} required className="w-full px-5 py-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-ring outline-none text-base" />
            <input type="text" placeholder={t('contact.org')} className="w-full px-5 py-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-ring outline-none text-base" />
            <input type="email" placeholder={t('contact.email')} required className="w-full px-5 py-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-ring outline-none text-base" />
            <input type="text" placeholder={t('contact.country')} className="w-full px-5 py-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-ring outline-none text-base" />
            <textarea placeholder={t('contact.message')} rows={4} required className="w-full px-5 py-4 rounded-xl border border-input bg-card text-foreground focus:ring-2 focus:ring-ring outline-none resize-none text-base" />
            <Button type="submit" size="lg" className="w-full py-6 text-base bg-[hsl(var(--accent))] hover:bg-[hsl(36,90%,48%)] text-white rounded-xl">{t('contact.send')}</Button>
          </form>
        </div>
      </section>

      {/* ═══════════════════ FAQ ═══════════════════ */}
      <section id="faq" className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-[hsl(var(--accent))] font-semibold text-sm tracking-widest uppercase mb-3 block">Questions fréquentes</span>
            <h2 className="text-3xl md:text-5xl font-bold">{t('faq.title')}</h2>
          </div>
          <div className="max-w-2xl mx-auto">
            <Accordion type="single" collapsible className="space-y-3">
              {faqItems.map((item, i) => (
                <AccordionItem key={i} value={`faq-${i}`} className="bg-card border border-border rounded-xl px-5">
                  <AccordionTrigger className="text-left font-semibold text-base">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;