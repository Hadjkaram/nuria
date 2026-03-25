import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Menu, X, Globe, ClipboardList } from 'lucide-react';
import type { Lang } from '@/i18n/translations';
import nuriaLogo from '@/assets/nuria-logo.png';

const langLabels: Record<Lang, string> = { fr: 'FR', en: 'EN', pt: 'PT', ar: 'AR' };

const Navbar: React.FC = () => {
  const { t, lang, setLang } = useLanguage();
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const navLinks = [
    { label: 'À propos', href: '/#problem' },
    { label: 'Fonctionnalités', href: '/#platform' },
    { label: t('nav.benefits'), href: '/#benefits' },
    { label: 'FAQ', href: '/#faq' },
    { label: t('nav.contact'), href: '/#contact' },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    if (href.startsWith('/#')) {
      const id = href.replace('/#', '');
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      else navigate('/');
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[hsl(205,78%,18%)]/95 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <img src={nuriaLogo} alt="NURIA" className="h-14 md:h-16 brightness-0 invert" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-6">
          {navLinks.map((link) => (
            <button key={link.href} onClick={() => scrollTo(link.href)} className="text-sm font-medium text-white/75 hover:text-white transition-colors">
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <div className="relative">
            <button onClick={() => setLangOpen(!langOpen)} className="flex items-center gap-1 text-sm text-white/70 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10">
              <Globe className="h-4 w-4" />
              {langLabels[lang]}
            </button>
            {langOpen && (
              <div className="absolute top-full right-0 mt-1 bg-[hsl(205,78%,15%)] border border-white/20 rounded-lg shadow-lg py-1 min-w-[80px]">
                {(Object.keys(langLabels) as Lang[]).map((l) => (
                  <button key={l} onClick={() => { setLang(l); setLangOpen(false); }} className={`block w-full text-left px-3 py-1.5 text-sm hover:bg-white/10 transition-colors ${lang === l ? 'text-[hsl(var(--accent))] font-semibold' : 'text-white/80'}`}>
                    {langLabels[l]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* BOUTON : ESPACE AGENT (Desktop) - Dirige vers /login-agent */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-[hsl(var(--accent))] hover:text-white hover:bg-[hsl(var(--accent))]/20 mr-2" 
            onClick={() => navigate('/login-agent')}
          >
            <ClipboardList className="h-4 w-4 mr-2" />
            Espace Agent
          </Button>

          {isAuthenticated ? (
            <>
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/dashboard')}>{t('nav.dashboard')}</Button>
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10" onClick={logout}>{t('nav.logout')}</Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10" onClick={() => navigate('/login')}>{t('nav.login')}</Button>
              <Button size="sm" className="bg-[hsl(var(--accent))] hover:bg-[hsl(36,90%,48%)] text-white" onClick={() => navigate('/signup')}>{t('hero.cta.demo')}</Button>
            </>
          )}
        </div>

        <button className="lg:hidden p-2 text-white" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden bg-[hsl(205,78%,15%)] border-b border-white/10 px-4 pb-4">
          {navLinks.map((link) => (
            <button key={link.href} onClick={() => scrollTo(link.href)} className="block w-full text-left py-2 text-sm text-white/75 hover:text-white">
              {link.label}
            </button>
          ))}
          
          <div className="flex gap-2 mt-3 pb-3 border-b border-white/10">
            {/* BOUTON : ESPACE AGENT (Mobile) - Dirige vers /login-agent */}
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full bg-[hsl(var(--accent))]/10 text-[hsl(var(--accent))] hover:bg-[hsl(var(--accent))]/20 border border-[hsl(var(--accent))]/30" 
              onClick={() => { navigate('/login-agent'); setMobileOpen(false); }}
            >
              <ClipboardList className="h-4 w-4 mr-2" />
              Accès Agent de Terrain
            </Button>
          </div>

          <div className="flex gap-2 mt-3">
            {(Object.keys(langLabels) as Lang[]).map((l) => (
              <button key={l} onClick={() => { setLang(l); setMobileOpen(false); }} className={`px-2 py-1 text-xs rounded ${lang === l ? 'bg-[hsl(var(--accent))] text-white' : 'bg-white/10 text-white/60'}`}>
                {langLabels[l]}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-3">
            {isAuthenticated ? (
              <>
                <Button variant="outline" size="sm" className="flex-1 border-white/30 text-white" onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}>{t('nav.dashboard')}</Button>
                <Button variant="ghost" size="sm" className="flex-1 text-white/70" onClick={() => { logout(); setMobileOpen(false); }}>{t('nav.logout')}</Button>
              </>
            ) : (
              <>
                <Button variant="outline" size="sm" className="flex-1 border-white/30 text-white" onClick={() => { navigate('/login'); setMobileOpen(false); }}>{t('nav.login')}</Button>
                <Button size="sm" className="flex-1 bg-[hsl(var(--accent))] text-white" onClick={() => { navigate('/signup'); setMobileOpen(false); }}>{t('nav.signup')}</Button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;