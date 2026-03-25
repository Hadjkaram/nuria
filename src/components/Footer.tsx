import React from 'react';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Lang } from '@/i18n/translations';
import nuriaLogo from '@/assets/nuria-logo.png';

const langLabels: Record<Lang, string> = { fr: 'FR', en: 'EN', pt: 'PT', ar: 'AR' };

const Footer: React.FC = () => {
  const { t, lang, setLang } = useLanguage();

  return (
    <footer className="bg-foreground text-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <img src={nuriaLogo} alt="NURIA" className="h-12 mb-4 brightness-0 invert" />
            <p className="text-background/70 text-sm max-w-md">{t('footer.desc')}</p>
            <div className="flex gap-2 mt-4">
              {(Object.keys(langLabels) as Lang[]).map((l) => (
                <button key={l} onClick={() => setLang(l)} className={`px-3 py-1 text-xs rounded-full transition-colors ${lang === l ? 'bg-primary text-primary-foreground' : 'bg-background/10 text-background/60 hover:bg-background/20'}`}>
                  {langLabels[l]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t('footer.links')}</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="/#hero" className="hover:text-background transition-colors">{t('nav.home')}</a></li>
              <li><a href="/#disorders" className="hover:text-background transition-colors">{t('nav.disorders')}</a></li>
              <li><a href="/#benefits" className="hover:text-background transition-colors">{t('nav.benefits')}</a></li>
              <li><a href="/#contact" className="hover:text-background transition-colors">{t('nav.contact')}</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">{t('footer.legal')}</h4>
            <ul className="space-y-2 text-sm text-background/70">
              <li><a href="#" className="hover:text-background transition-colors">{t('footer.privacy')}</a></li>
              <li><a href="#" className="hover:text-background transition-colors">{t('footer.terms')}</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-background/10 mt-8 pt-8 text-center text-sm text-background/50">
          {t('footer.rights')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
