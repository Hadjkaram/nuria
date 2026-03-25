import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/i18n/LanguageContext';
import { Button } from '@/components/ui/button';
import nuriaLogo from '@/assets/nuria-logo.png';

const ResetPasswordPage: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen bg-muted flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/"><img src={nuriaLogo} alt="NURIA" className="h-16 mx-auto mb-4" /></Link>
          <h1 className="text-2xl font-bold">{t('auth.resetPassword')}</h1>
          <p className="text-muted-foreground mt-2">{t('auth.resetDesc')}</p>
        </div>
        <div className="bg-card rounded-xl p-8 shadow-lg border border-border space-y-4">
          {sent ? (
            <div className="text-center">
              <div className="bg-secondary/10 text-secondary p-4 rounded-lg mb-4">
                Un lien de réinitialisation a été envoyé à {email}
              </div>
              <Link to="/login" className="text-primary hover:underline text-sm">{t('auth.backToLogin')}</Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('auth.email')} required className="w-full px-4 py-3 rounded-lg border border-input bg-background focus:ring-2 focus:ring-ring outline-none" />
              <Button type="submit" size="lg" className="w-full">{t('auth.sendReset')}</Button>
              <div className="text-center">
                <Link to="/login" className="text-sm text-primary hover:underline">{t('auth.backToLogin')}</Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
