import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { type UserRole } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import nuriaLogo from '@/assets/nuria-logo.png';

const roles: { value: UserRole; labelKey: string }[] = [
  { value: 'parent', labelKey: 'role.parent' },
  { value: 'professional', labelKey: 'role.professional' },
  { value: 'teacher', labelKey: 'role.teacher' },
  { value: 'community', labelKey: 'role.community' },
  { value: 'orgAdmin', labelKey: 'role.orgAdmin' },
  { value: 'program', labelKey: 'role.program' },
  { value: 'ministry', labelKey: 'role.ministry' },
];

const SignupPage: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'parent' as UserRole
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setLoading(true);

    try {
      // 1. Inscription via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: {
          data: {
            first_name: form.firstName,
            last_name: form.lastName,
            role: form.role
          }
        }
      });

      if (authError) throw authError;

      // 2. Création du profil avec le statut 'pending' (En attente)
      if (authData.user) {
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: authData.user.id,
          email: form.email,
          first_name: form.firstName,
          last_name: form.lastName,
          role: form.role,
          status: 'pending', // 🚨 Met le compte en attente de validation !
          organization: '-'
        });

        if (profileError) throw profileError;

        // Affiche l'écran de succès au lieu de rediriger vers le dashboard
        setIsSuccess(true);
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC]">
      
      {/* ================= SECTION GAUCHE (BLEU) ================= */}
      <div className="md:w-[45%] bg-[#2B5B7E] flex flex-col justify-center items-center p-10 text-center relative overflow-hidden shrink-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 max-w-md flex flex-col items-center">
          <Link to="/">
            <img src={nuriaLogo} alt="NURIA Logo" className="h-20 mb-8 brightness-0 invert hover:opacity-90 transition-opacity" />
          </Link>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 leading-tight">
            African Neurodevelopment Platform
          </h1>
          
          <p className="text-blue-100/90 text-lg leading-relaxed max-w-md">
            Une solution numérique innovante pour surveiller le développement des enfants, 
            repérer les signes d'alerte, faciliter l'accès aux soins spécialisés et 
            coordonner les acteurs de santé, d'éducation et de la communauté.
          </p>
        </div>
      </div>

      {/* ================= SECTION DROITE (FORMULAIRE) ================= */}
      <div className="md:w-[55%] flex justify-center items-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          
          {isSuccess ? (
            // --- ÉCRAN DE SUCCÈS (Compte en attente) ---
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-3">Demande envoyée</h2>
              <p className="text-slate-600 mb-8 leading-relaxed">
                Votre inscription a bien été enregistrée. Pour des raisons de sécurité, votre compte est actuellement <strong>en attente de validation</strong> par un administrateur NURIA.
              </p>
              <Button onClick={() => navigate('/login')} className="w-full h-12 bg-[#2B5B7E] hover:bg-[#1f425b] text-white font-bold rounded-xl text-base">
                Retour à la connexion
              </Button>
            </div>
          ) : (
            // --- FORMULAIRE D'INSCRIPTION ---
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('auth.signup')}</h2>
              <p className="text-slate-500 mb-6">Créez votre compte sécurisé</p>

              {error && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium mb-6 border border-red-100 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-700">{t('auth.firstName')}</Label>
                    <Input 
                      required
                      className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#2B5B7E] rounded-xl"
                      value={form.firstName}
                      onChange={e => update('firstName', e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="font-semibold text-slate-700">{t('auth.lastName')}</Label>
                    <Input 
                      required
                      className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#2B5B7E] rounded-xl"
                      value={form.lastName}
                      onChange={e => update('lastName', e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-700">{t('auth.email')}</Label>
                  <Input 
                    required
                    type="email"
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#2B5B7E] rounded-xl"
                    value={form.email}
                    onChange={e => update('email', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-700">{t('auth.role')}</Label>
                  <select 
                    className="w-full h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#2B5B7E] focus:ring-1 focus:ring-[#2B5B7E] outline-none transition-colors"
                    value={form.role}
                    onChange={e => update('role', e.target.value)}
                  >
                    {roles.map((r) => <option key={r.value} value={r.value}>{t(r.labelKey)}</option>)}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-700">{t('auth.password')}</Label>
                  <Input 
                    required
                    type="password"
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#2B5B7E] rounded-xl"
                    value={form.password}
                    onChange={e => update('password', e.target.value)}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="font-semibold text-slate-700">{t('auth.confirmPassword')}</Label>
                  <Input 
                    required
                    type="password"
                    className="h-11 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#2B5B7E] rounded-xl"
                    value={form.confirmPassword}
                    onChange={e => update('confirmPassword', e.target.value)}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={loading}
                  className="w-full h-12 bg-[#2B5B7E] hover:bg-[#1f425b] text-white font-bold rounded-xl mt-6 shadow-md transition-all text-base"
                >
                  {loading ? <Loader2 className="animate-spin h-5 w-5" /> : t('auth.signupBtn')}
                </Button>

                <p className="text-center text-sm text-slate-500 mt-6">
                  {t('auth.hasAccount')}{' '}
                  <Link to="/login" className="text-[#2B5B7E] font-bold hover:underline">{t('auth.login')}</Link>
                </p>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default SignupPage;