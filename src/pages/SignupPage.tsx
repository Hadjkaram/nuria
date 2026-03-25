import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
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
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirmPassword: '', role: 'parent' as UserRole });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirmPassword) { setError('Les mots de passe ne correspondent pas'); return; }
    if (form.password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    setLoading(true);
    await signup(form);
    setLoading(false);
    navigate('/dashboard');
  };

  const update = (key: string, value: string) => setForm({ ...form, [key]: value });

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><img src={nuriaLogo} alt="NURIA" className="h-16 mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-bold">{t('auth.signup')}</h1>
        </div>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl p-8 shadow-lg border border-border space-y-4">
          {error && <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.firstName')}</label>
              <input type="text" value={form.firstName} onChange={(e) => update('firstName', e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.lastName')}</label>
              <input type="text" value={form.lastName} onChange={(e) => update('lastName', e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
            <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.role')}</label>
            <select value={form.role} onChange={(e) => update('role', e.target.value)} className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none">
              {roles.map((r) => <option key={r.value} value={r.value}>{t(r.labelKey)}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
            <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">{t('auth.confirmPassword')}</label>
            <input type="password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" />
          </div>
          <Button type="submit" size="lg" className="w-full" disabled={loading}>
            {loading ? '...' : t('auth.signupBtn')}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            {t('auth.hasAccount')}{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">{t('auth.login')}</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
