import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import nuriaLogo from '@/assets/nuria-logo.png';
// Import pour accéder directement à la db si besoin après le login
import { supabase } from '@/lib/supabase';

const LoginPage: React.FC = () => {
  const { t } = useLanguage();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Tente de connecter l'utilisateur via le context Auth
      const success = await login(email, password);

      if (success) {
        // 2. Si la connexion réussit, on va chercher son rôle dans la table profiles
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          // 3. Redirection intelligente basée sur le rôle
          if (profile?.role === 'parent') {
            navigate('/parent-dashboard');
          } else if (profile?.role === 'agent') {
            navigate('/dashboard'); // Ou '/agent-dashboard' si tu as séparé les routes
          } else {
             // Redirection par défaut (Médecins, Superviseurs, etc.)
            navigate('/dashboard');
          }
        } else {
            navigate('/dashboard'); // Sécurité
        }
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error(err);
      setError('Une erreur est survenue lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Branding */}
      <div className="lg:w-[55%] w-full bg-gradient-to-br from-[hsl(205,78%,22%)] to-[hsl(205,70%,32%)] flex flex-col items-center justify-center px-8 py-16 lg:py-0 text-center relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-white/5" />
        <div className="absolute bottom-[-60px] right-[-60px] w-48 h-48 rounded-full bg-white/5" />

        <img src={nuriaLogo} alt="NURIA" className="h-24 lg:h-28 mb-8 brightness-0 invert" />
        <h2 className="text-2xl lg:text-3xl font-bold text-white font-heading mb-4">
          African Neurodevelopment Platform
        </h2>
        <p className="text-white/70 max-w-md text-sm lg:text-base leading-relaxed">
          Une solution numérique innovante pour surveiller le développement des enfants, repérer les signes d'alerte, faciliter l'accès aux soins spécialisés et coordonner les acteurs de santé, d'éducation et de la communauté.
        </p>
      </div>

      {/* Right Panel - Login Form */}
      <div className="lg:w-[45%] w-full bg-muted flex items-center justify-center px-6 py-12 lg:py-0">
        <div className="w-full max-w-md">
          <h1 className="text-2xl lg:text-3xl font-bold font-heading text-foreground mb-1">
            Connexion à NURIA
          </h1>
          <p className="text-muted-foreground mb-8">Accédez à votre espace sécurisé</p>

          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-4">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@organisation.org"
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none transition-shadow"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-foreground">Mot de passe</label>
                <Link to="/reset-password" className="text-sm text-primary hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-ring outline-none transition-shadow pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={loading}>
              <LogIn size={18} className="mr-2" />
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Pas encore de compte ?{' '}
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Contactez votre administrateur
              </Link>
            </p>
          </form>

          {/* Demo accounts */}
          <div className="mt-10 border-t border-border pt-6">
            <p className="text-xs text-muted-foreground text-center mb-3">Comptes démo</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>parent.koffi@email.com</span><span>medecin@nuria.app</span>
              <span>agent@nuria.app</span><span>admin@nuria.app</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;