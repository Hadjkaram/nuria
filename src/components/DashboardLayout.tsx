import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/i18n/LanguageContext';
import { roleNavigation } from '@/config/roleNavigation';
import { LogOut, Menu, User } from 'lucide-react';
import nuriaLogo from '@/assets/nuria-logo.png';
import { supabase } from '@/lib/supabase'; // <-- Ajout de Supabase

// Couleurs par rôle
const roleAccentColors: Record<string, string> = {
  parent: 'from-blue-500 to-blue-600',
  professional: 'from-emerald-500 to-emerald-600',
  teacher: 'from-amber-500 to-amber-600',
  community: 'from-orange-500 to-orange-600',
  orgAdmin: 'from-violet-500 to-violet-600',
  program: 'from-teal-500 to-teal-600',
  ministry: 'from-indigo-500 to-indigo-600',
  superAdmin: 'from-rose-500 to-rose-600',
};

const DashboardLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { t, lang, setLang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // --- NOUVEAU : État pour stocker les langues actives depuis Supabase ---
  const [activeLangs, setActiveLangs] = useState<{code: string, flag: string}[]>([
    { code: 'fr', flag: '🇫🇷' },
    { code: 'ar', flag: '🇸🇦' }
  ]);

  useEffect(() => {
    const fetchActiveLangs = async () => {
      const { data } = await supabase
        .from('platform_languages')
        .select('code, flag')
        .eq('is_active', true); // On ne prend que les langues activées !
      
      if (data && data.length > 0) {
        setActiveLangs(data);
      }
    };
    fetchActiveLangs();
  }, []);
  // ------------------------------------------------------------------------

  if (!user) {
    navigate('/login');
    return null;
  }

  const navItems = roleNavigation[user.role] || roleNavigation.parent;
  const accentGradient = roleAccentColors[user.role] || roleAccentColors.parent;

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex-shrink-0`}>
        <div className="flex flex-col h-full">
          {/* Logo + role badge */}
          <div className="p-4 border-b border-sidebar-border">
            <Link to="/" className="flex items-center gap-2 mb-2">
              <img src={nuriaLogo} alt="NURIA" className="h-8 brightness-0 invert" />
            </Link>
            <div className={`bg-gradient-to-r ${accentGradient} text-white text-xs px-2 py-1 rounded-md font-medium text-center`}>
              {t(`role.${user.role}`)}
            </div>
          </div>

          {/* Navigation par rôle */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{t(item.labelKey)}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom section (Profil & Langues) */}
          <div className="p-3 border-t border-sidebar-border space-y-3">
            <Link
              to="/dashboard/profile"
              className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
            >
              <User className="h-4 w-4" />
              {t('sidebar.profile')}
            </Link>
            
            {/* NOUVEAU : Boutons de langues générés depuis Supabase */}
            <div className="flex gap-2 flex-wrap px-2">
              {activeLangs.map((l) => (
                <button 
                  key={l.code} 
                  onClick={() => setLang(l.code)} 
                  className={`px-2 py-1.5 text-xs font-bold rounded flex items-center gap-1.5 transition-all ${lang === l.code ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-md' : 'bg-sidebar-accent/50 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent'}`}
                >
                  <span className="text-sm">{l.flag}</span>
                  <span>{l.code.toUpperCase()}</span>
                </button>
              ))}
            </div>

            <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors">
              <LogOut className="h-4 w-4" />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay mobile */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-foreground/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-card border-b border-border px-4 h-14 flex items-center justify-between lg:justify-end sticky top-0 z-30">
          <button className="lg:hidden p-2" onClick={() => setSidebarOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user.firstName} {user.lastName}</span>
            <span className={`text-xs bg-gradient-to-r ${accentGradient} text-white px-2 py-1 rounded-full font-medium`}>{t(`role.${user.role}`)}</span>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;