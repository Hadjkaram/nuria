import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Settings, Building, Globe, Bell, Shield, Palette, Database,
  Mail, Lock, Users, Save, RefreshCw, Eye, EyeOff, CheckCircle2,
  Monitor, Smartphone, Moon, Sun, Volume2, VolumeX, Clock, Calendar,
  FileText, Download, Upload, AlertTriangle, Info, Zap, Server
} from 'lucide-react';
import type { Lang } from '@/i18n/translations';

const SettingsModule: React.FC = () => {
  const { lang, setLang } = useLanguage();
  const { user } = useAuth();

  // General settings
  const [orgName, setOrgName] = useState('Centre de Santé Communautaire - Abobo');
  const [orgEmail, setOrgEmail] = useState('contact@csc-abobo.ci');
  const [orgPhone, setOrgPhone] = useState('+225 27 22 44 55 66');
  const [orgAddress, setOrgAddress] = useState('Boulevard de la Paix, Abobo, Abidjan');
  const [orgDescription, setOrgDescription] = useState('Centre de santé spécialisé dans le suivi du développement de l\'enfant.');
  const [timezone, setTimezone] = useState('Africa/Abidjan');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');

  // Notification settings
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [notifNewPatient, setNotifNewPatient] = useState(true);
  const [notifAppointment, setNotifAppointment] = useState(true);
  const [notifScreening, setNotifScreening] = useState(true);
  const [notifReport, setNotifReport] = useState(false);
  const [notifAlert, setNotifAlert] = useState(true);

  // Security
  const [twoFactor, setTwoFactor] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState('60');
  const [passwordPolicy, setPasswordPolicy] = useState('strong');
  const [auditLog, setAuditLog] = useState(true);
  const [ipRestriction, setIpRestriction] = useState(false);

  // Appearance
  const [theme, setTheme] = useState('system');
  const [compactMode, setCompactMode] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);

  // Modules
  const [modules, setModules] = useState([
    { id: 'screening', name: 'Dépistage', enabled: true },
    { id: 'adhd', name: 'TDAH', enabled: true },
    { id: 'autism', name: 'Autisme / TND', enabled: true },
    { id: 'teleconsultation', name: 'Téléconsultation', enabled: true },
    { id: 'carePlans', name: 'Plans de PEC', enabled: true },
    { id: 'training', name: 'Formation', enabled: false },
    { id: 'community', name: 'Module communautaire', enabled: false },
    { id: 'reporting', name: 'Reporting avancé', enabled: true },
  ]);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const toggleModule = (id: string) => {
    setModules(prev => prev.map(m => m.id === id ? { ...m, enabled: !m.enabled } : m));
  };

  const isAdmin = user?.role === 'orgAdmin' || user?.role === 'superAdmin' || user?.role === 'program';

  const l = {
    fr: {
      title: 'Paramètres', general: 'Général', notifications: 'Notifications', security: 'Sécurité', appearance: 'Apparence', modulesTab: 'Modules', data: 'Données',
      orgInfo: 'Informations de l\'organisation', orgName: 'Nom de l\'organisation', email: 'Email de contact', phone: 'Téléphone', address: 'Adresse', description: 'Description',
      regional: 'Paramètres régionaux', language: 'Langue', timezone: 'Fuseau horaire', dateFormat: 'Format de date',
      notifChannels: 'Canaux de notification', emailNotifs: 'Notifications par email', smsNotifs: 'Notifications SMS', pushNotifs: 'Notifications push',
      notifTypes: 'Types de notifications', newPatient: 'Nouveau patient inscrit', appointment: 'Rappels de rendez-vous', screening: 'Résultats de dépistage', report: 'Rapports générés', alert: 'Alertes cliniques',
      securitySettings: 'Paramètres de sécurité', twoFactor: 'Authentification à deux facteurs', sessionTimeout: 'Expiration de session (min)', passwordPolicy: 'Politique de mot de passe', auditLog: 'Journal d\'audit', ipRestriction: 'Restriction IP',
      weak: 'Faible', medium: 'Moyen', strong: 'Fort',
      themeSettings: 'Thème et affichage', lightTheme: 'Clair', darkTheme: 'Sombre', systemTheme: 'Système', compactMode: 'Mode compact', animations: 'Animations',
      activeModules: 'Modules actifs', moduleDesc: 'Activez ou désactivez les modules selon vos besoins.',
      dataManagement: 'Gestion des données', exportData: 'Exporter les données', importData: 'Importer des données', backupDesc: 'Dernière sauvegarde : 10 Mars 2026, 02:00', autoBackup: 'Sauvegarde automatique',
      save: 'Enregistrer', saved: 'Enregistré !', reset: 'Réinitialiser',
    },
    en: {
      title: 'Settings', general: 'General', notifications: 'Notifications', security: 'Security', appearance: 'Appearance', modulesTab: 'Modules', data: 'Data',
      orgInfo: 'Organization information', orgName: 'Organization name', email: 'Contact email', phone: 'Phone', address: 'Address', description: 'Description',
      regional: 'Regional settings', language: 'Language', timezone: 'Timezone', dateFormat: 'Date format',
      notifChannels: 'Notification channels', emailNotifs: 'Email notifications', smsNotifs: 'SMS notifications', pushNotifs: 'Push notifications',
      notifTypes: 'Notification types', newPatient: 'New patient registered', appointment: 'Appointment reminders', screening: 'Screening results', report: 'Generated reports', alert: 'Clinical alerts',
      securitySettings: 'Security settings', twoFactor: 'Two-factor authentication', sessionTimeout: 'Session timeout (min)', passwordPolicy: 'Password policy', auditLog: 'Audit log', ipRestriction: 'IP restriction',
      weak: 'Weak', medium: 'Medium', strong: 'Strong',
      themeSettings: 'Theme and display', lightTheme: 'Light', darkTheme: 'Dark', systemTheme: 'System', compactMode: 'Compact mode', animations: 'Animations',
      activeModules: 'Active modules', moduleDesc: 'Enable or disable modules as needed.',
      dataManagement: 'Data management', exportData: 'Export data', importData: 'Import data', backupDesc: 'Last backup: March 10, 2026, 02:00', autoBackup: 'Auto backup',
      save: 'Save', saved: 'Saved!', reset: 'Reset',
    },
    pt: {
      title: 'Configurações', general: 'Geral', notifications: 'Notificações', security: 'Segurança', appearance: 'Aparência', modulesTab: 'Módulos', data: 'Dados',
      orgInfo: 'Informações da organização', orgName: 'Nome da organização', email: 'Email de contato', phone: 'Telefone', address: 'Endereço', description: 'Descrição',
      regional: 'Configurações regionais', language: 'Idioma', timezone: 'Fuso horário', dateFormat: 'Formato de data',
      notifChannels: 'Canais de notificação', emailNotifs: 'Notificações por email', smsNotifs: 'Notificações SMS', pushNotifs: 'Notificações push',
      notifTypes: 'Tipos de notificações', newPatient: 'Novo paciente registrado', appointment: 'Lembretes de consultas', screening: 'Resultados de triagem', report: 'Relatórios gerados', alert: 'Alertas clínicos',
      securitySettings: 'Configurações de segurança', twoFactor: 'Autenticação de dois fatores', sessionTimeout: 'Expiração da sessão (min)', passwordPolicy: 'Política de senha', auditLog: 'Registro de auditoria', ipRestriction: 'Restrição de IP',
      weak: 'Fraca', medium: 'Média', strong: 'Forte',
      themeSettings: 'Tema e exibição', lightTheme: 'Claro', darkTheme: 'Escuro', systemTheme: 'Sistema', compactMode: 'Modo compacto', animations: 'Animações',
      activeModules: 'Módulos ativos', moduleDesc: 'Ative ou desative os módulos conforme necessário.',
      dataManagement: 'Gestão de dados', exportData: 'Exportar dados', importData: 'Importar dados', backupDesc: 'Último backup: 10 de Março de 2026, 02:00', autoBackup: 'Backup automático',
      save: 'Salvar', saved: 'Salvo!', reset: 'Redefinir',
    },
    ar: {
      title: 'الإعدادات', general: 'عام', notifications: 'الإشعارات', security: 'الأمان', appearance: 'المظهر', modulesTab: 'الوحدات', data: 'البيانات',
      orgInfo: 'معلومات المنظمة', orgName: 'اسم المنظمة', email: 'البريد الإلكتروني', phone: 'الهاتف', address: 'العنوان', description: 'الوصف',
      regional: 'الإعدادات الإقليمية', language: 'اللغة', timezone: 'المنطقة الزمنية', dateFormat: 'تنسيق التاريخ',
      notifChannels: 'قنوات الإشعارات', emailNotifs: 'إشعارات البريد', smsNotifs: 'إشعارات SMS', pushNotifs: 'إشعارات فورية',
      notifTypes: 'أنواع الإشعارات', newPatient: 'مريض جديد مسجل', appointment: 'تذكيرات المواعيد', screening: 'نتائج الفحص', report: 'التقارير المنشأة', alert: 'تنبيهات سريرية',
      securitySettings: 'إعدادات الأمان', twoFactor: 'المصادقة الثنائية', sessionTimeout: 'انتهاء الجلسة (دقيقة)', passwordPolicy: 'سياسة كلمة المرور', auditLog: 'سجل التدقيق', ipRestriction: 'تقييد IP',
      weak: 'ضعيفة', medium: 'متوسطة', strong: 'قوية',
      themeSettings: 'المظهر والعرض', lightTheme: 'فاتح', darkTheme: 'داكن', systemTheme: 'النظام', compactMode: 'الوضع المضغوط', animations: 'الرسوم المتحركة',
      activeModules: 'الوحدات النشطة', moduleDesc: 'تفعيل أو تعطيل الوحدات حسب الحاجة.',
      dataManagement: 'إدارة البيانات', exportData: 'تصدير البيانات', importData: 'استيراد البيانات', backupDesc: 'آخر نسخة احتياطية: 10 مارس 2026، 02:00', autoBackup: 'نسخ احتياطي تلقائي',
      save: 'حفظ', saved: 'تم الحفظ!', reset: 'إعادة تعيين',
    },
  }[lang] || {
    title: 'Paramètres', general: 'Général', notifications: 'Notifications', security: 'Sécurité', appearance: 'Apparence', modulesTab: 'Modules', data: 'Données',
    orgInfo: 'Organisation', orgName: 'Nom', email: 'Email', phone: 'Tél', address: 'Adresse', description: 'Description',
    regional: 'Régional', language: 'Langue', timezone: 'Fuseau', dateFormat: 'Format date',
    notifChannels: 'Canaux', emailNotifs: 'Email', smsNotifs: 'SMS', pushNotifs: 'Push',
    notifTypes: 'Types', newPatient: 'Nouveau patient', appointment: 'RDV', screening: 'Dépistage', report: 'Rapports', alert: 'Alertes',
    securitySettings: 'Sécurité', twoFactor: '2FA', sessionTimeout: 'Session (min)', passwordPolicy: 'Politique MDP', auditLog: 'Audit', ipRestriction: 'IP',
    weak: 'Faible', medium: 'Moyen', strong: 'Fort',
    themeSettings: 'Thème', lightTheme: 'Clair', darkTheme: 'Sombre', systemTheme: 'Système', compactMode: 'Compact', animations: 'Animations',
    activeModules: 'Modules', moduleDesc: 'Gérez les modules.',
    dataManagement: 'Données', exportData: 'Exporter', importData: 'Importer', backupDesc: 'Dernière sauvegarde : 10 Mar 2026', autoBackup: 'Auto-backup',
    save: 'Enregistrer', saved: 'Enregistré !', reset: 'Réinitialiser',
  };

  const langOptions: { value: Lang; label: string }[] = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
    { value: 'ar', label: 'العربية' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{l.title}</h1>
            <p className="text-muted-foreground text-sm">
              {user?.role === 'superAdmin' ? 'Global' : user?.role === 'program' ? 'Programme' : 'Organisation'}
            </p>
          </div>
          <Button onClick={handleSave} disabled={saved}>
            {saved ? <><CheckCircle2 className="h-4 w-4 mr-2" />{l.saved}</> : <><Save className="h-4 w-4 mr-2" />{l.save}</>}
          </Button>
        </div>

        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 w-full">
            <TabsTrigger value="general">{l.general}</TabsTrigger>
            <TabsTrigger value="notifications">{l.notifications}</TabsTrigger>
            <TabsTrigger value="security">{l.security}</TabsTrigger>
            <TabsTrigger value="appearance">{l.appearance}</TabsTrigger>
            {isAdmin && <TabsTrigger value="modules">{l.modulesTab}</TabsTrigger>}
            {isAdmin && <TabsTrigger value="data">{l.data}</TabsTrigger>}
          </TabsList>

          {/* General */}
          <TabsContent value="general" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Building className="h-5 w-5" />{l.orgInfo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>{l.orgName}</Label><Input value={orgName} onChange={e => setOrgName(e.target.value)} className="mt-1" /></div>
                  <div><Label>{l.email}</Label><Input type="email" value={orgEmail} onChange={e => setOrgEmail(e.target.value)} className="mt-1" /></div>
                  <div><Label>{l.phone}</Label><Input value={orgPhone} onChange={e => setOrgPhone(e.target.value)} className="mt-1" /></div>
                  <div><Label>{l.address}</Label><Input value={orgAddress} onChange={e => setOrgAddress(e.target.value)} className="mt-1" /></div>
                </div>
                <div><Label>{l.description}</Label><Textarea value={orgDescription} onChange={e => setOrgDescription(e.target.value)} className="mt-1" rows={3} /></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Globe className="h-5 w-5" />{l.regional}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>{l.language}</Label>
                    <Select value={lang} onValueChange={v => setLang(v as Lang)}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {langOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{l.timezone}</Label>
                    <Select value={timezone} onValueChange={setTimezone}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Africa/Abidjan">Africa/Abidjan (GMT+0)</SelectItem>
                        <SelectItem value="Africa/Lagos">Africa/Lagos (GMT+1)</SelectItem>
                        <SelectItem value="Africa/Dakar">Africa/Dakar (GMT+0)</SelectItem>
                        <SelectItem value="Europe/Paris">Europe/Paris (GMT+1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{l.dateFormat}</Label>
                    <Select value={dateFormat} onValueChange={setDateFormat}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                        <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                        <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Notifications */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Bell className="h-5 w-5" />{l.notifChannels}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: l.emailNotifs, icon: Mail, value: emailNotifs, setter: setEmailNotifs },
                  { label: l.smsNotifs, icon: Smartphone, value: smsNotifs, setter: setSmsNotifs },
                  { label: l.pushNotifs, icon: Bell, value: pushNotifs, setter: setPushNotifs },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium text-foreground">{item.label}</span>
                    </div>
                    <Switch checked={item.value} onCheckedChange={item.setter} />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5" />{l.notifTypes}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { label: l.newPatient, value: notifNewPatient, setter: setNotifNewPatient },
                  { label: l.appointment, value: notifAppointment, setter: setNotifAppointment },
                  { label: l.screening, value: notifScreening, setter: setNotifScreening },
                  { label: l.report, value: notifReport, setter: setNotifReport },
                  { label: l.alert, value: notifAlert, setter: setNotifAlert },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-2">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <Switch checked={item.value} onCheckedChange={item.setter} />
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Shield className="h-5 w-5" />{l.securitySettings}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.twoFactor}</p>
                    <p className="text-xs text-muted-foreground">TOTP / SMS</p>
                  </div>
                  <Switch checked={twoFactor} onCheckedChange={setTwoFactor} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>{l.sessionTimeout}</Label>
                    <Select value={sessionTimeout} onValueChange={setSessionTimeout}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15 min</SelectItem>
                        <SelectItem value="30">30 min</SelectItem>
                        <SelectItem value="60">60 min</SelectItem>
                        <SelectItem value="120">2h</SelectItem>
                        <SelectItem value="480">8h</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{l.passwordPolicy}</Label>
                    <Select value={passwordPolicy} onValueChange={setPasswordPolicy}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weak">{l.weak}</SelectItem>
                        <SelectItem value="medium">{l.medium}</SelectItem>
                        <SelectItem value="strong">{l.strong}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.auditLog}</p>
                    <p className="text-xs text-muted-foreground">Logs & Audit</p>
                  </div>
                  <Switch checked={auditLog} onCheckedChange={setAuditLog} />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.ipRestriction}</p>
                    <p className="text-xs text-muted-foreground">Whitelist IP</p>
                  </div>
                  <Switch checked={ipRestriction} onCheckedChange={setIpRestriction} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2"><Palette className="h-5 w-5" />{l.themeSettings}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="mb-3 block">{l.themeSettings}</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light', label: l.lightTheme, icon: Sun },
                      { value: 'dark', label: l.darkTheme, icon: Moon },
                      { value: 'system', label: l.systemTheme, icon: Monitor },
                    ].map(t => (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={`p-4 rounded-lg border-2 text-center transition-all ${theme === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                      >
                        <t.icon className={`h-6 w-6 mx-auto mb-2 ${theme === t.value ? 'text-primary' : 'text-muted-foreground'}`} />
                        <p className={`text-sm font-medium ${theme === t.value ? 'text-primary' : 'text-foreground'}`}>{t.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.compactMode}</p>
                    <p className="text-xs text-muted-foreground">Reduce spacing</p>
                  </div>
                  <Switch checked={compactMode} onCheckedChange={setCompactMode} />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{l.animations}</p>
                    <p className="text-xs text-muted-foreground">UI transitions</p>
                  </div>
                  <Switch checked={animationsEnabled} onCheckedChange={setAnimationsEnabled} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Modules */}
          {isAdmin && (
            <TabsContent value="modules" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5" />{l.activeModules}</CardTitle>
                  <CardDescription>{l.moduleDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {modules.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${m.enabled ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`} />
                        <span className="text-sm font-medium text-foreground">{m.name}</span>
                      </div>
                      <Switch checked={m.enabled} onCheckedChange={() => toggleModule(m.id)} />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Data */}
          {isAdmin && (
            <TabsContent value="data" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><Database className="h-5 w-5" />{l.dataManagement}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button className="p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors text-center">
                      <Download className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-medium text-sm text-foreground">{l.exportData}</p>
                      <p className="text-xs text-muted-foreground mt-1">CSV, JSON, PDF</p>
                    </button>
                    <button className="p-4 rounded-lg border-2 border-dashed border-border hover:border-primary/50 transition-colors text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="font-medium text-sm text-foreground">{l.importData}</p>
                      <p className="text-xs text-muted-foreground mt-1">CSV, JSON</p>
                    </button>
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div>
                      <p className="text-sm font-medium text-foreground">{l.autoBackup}</p>
                      <p className="text-xs text-muted-foreground">{l.backupDesc}</p>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="h-3 w-3 mr-1" />Active
                    </Badge>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      {lang === 'fr' ? 'L\'exportation des données sensibles nécessite les droits administrateur.' :
                       lang === 'en' ? 'Exporting sensitive data requires administrator rights.' :
                       lang === 'pt' ? 'A exportação de dados sensíveis requer direitos de administrador.' :
                       'يتطلب تصدير البيانات الحساسة صلاحيات المسؤول.'}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default SettingsModule;
