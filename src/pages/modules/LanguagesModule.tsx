import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Globe, Search, Plus, CheckCircle2, AlertTriangle, Clock, Edit, Trash2,
  Download, Upload, Languages, BarChart3, Eye, RefreshCw
} from 'lucide-react';

const labels: Record<string, Record<string, string>> = {
  title: { fr: 'Gestion des langues', en: 'Language Management', pt: 'Gestão de Idiomas', ar: 'إدارة اللغات' },
  subtitle: { fr: 'Configurez les langues et traductions de la plateforme', en: 'Configure platform languages and translations', pt: 'Configure idiomas e traduções da plataforma', ar: 'تكوين لغات وترجمات المنصة' },
  active: { fr: 'Active', en: 'Active', pt: 'Ativo', ar: 'نشط' },
  inactive: { fr: 'Inactive', en: 'Inactive', pt: 'Inativo', ar: 'غير نشط' },
  default: { fr: 'Par défaut', en: 'Default', pt: 'Padrão', ar: 'افتراضي' },
  rtl: { fr: 'RTL', en: 'RTL', pt: 'RTL', ar: 'RTL' },
  ltr: { fr: 'LTR', en: 'LTR', pt: 'LTR', ar: 'LTR' },
  tabLanguages: { fr: 'Langues', en: 'Languages', pt: 'Idiomas', ar: 'اللغات' },
  tabTranslations: { fr: 'Traductions', en: 'Translations', pt: 'Traduções', ar: 'الترجمات' },
  tabStats: { fr: 'Statistiques', en: 'Statistics', pt: 'Estatísticas', ar: 'الإحصائيات' },
  search: { fr: 'Rechercher...', en: 'Search...', pt: 'Pesquisar...', ar: 'بحث...' },
  addLanguage: { fr: 'Ajouter une langue', en: 'Add language', pt: 'Adicionar idioma', ar: 'إضافة لغة' },
  code: { fr: 'Code', en: 'Code', pt: 'Código', ar: 'الرمز' },
  language: { fr: 'Langue', en: 'Language', pt: 'Idioma', ar: 'اللغة' },
  direction: { fr: 'Direction', en: 'Direction', pt: 'Direção', ar: 'الاتجاه' },
  status: { fr: 'Statut', en: 'Status', pt: 'Status', ar: 'الحالة' },
  coverage: { fr: 'Couverture', en: 'Coverage', pt: 'Cobertura', ar: 'التغطية' },
  actions: { fr: 'Actions', en: 'Actions', pt: 'Ações', ar: 'الإجراءات' },
  translationKey: { fr: 'Clé', en: 'Key', pt: 'Chave', ar: 'المفتاح' },
  module: { fr: 'Module', en: 'Module', pt: 'Módulo', ar: 'الوحدة' },
  missing: { fr: 'Manquantes', en: 'Missing', pt: 'Faltando', ar: 'مفقودة' },
  complete: { fr: 'Complètes', en: 'Complete', pt: 'Completas', ar: 'مكتملة' },
  exportAll: { fr: 'Exporter tout', en: 'Export all', pt: 'Exportar tudo', ar: 'تصدير الكل' },
  importFile: { fr: 'Importer', en: 'Import', pt: 'Importar', ar: 'استيراد' },
  save: { fr: 'Enregistrer', en: 'Save', pt: 'Salvar', ar: 'حفظ' },
  cancel: { fr: 'Annuler', en: 'Cancel', pt: 'Cancelar', ar: 'إلغاء' },
  setDefault: { fr: 'Définir par défaut', en: 'Set as default', pt: 'Definir como padrão', ar: 'تعيين كافتراضي' },
  preview: { fr: 'Aperçu', en: 'Preview', pt: 'Pré-visualizar', ar: 'معاينة' },
  totalKeys: { fr: 'Clés totales', en: 'Total keys', pt: 'Chaves totais', ar: 'إجمالي المفاتيح' },
  translated: { fr: 'Traduites', en: 'Translated', pt: 'Traduzidas', ar: 'مترجمة' },
  untranslated: { fr: 'Non traduites', en: 'Untranslated', pt: 'Não traduzidas', ar: 'غير مترجمة' },
  lastUpdate: { fr: 'Dernière MAJ', en: 'Last update', pt: 'Última atualização', ar: 'آخر تحديث' },
  nativeName: { fr: 'Nom natif', en: 'Native name', pt: 'Nome nativo', ar: 'الاسم الأصلي' },
  flagEmoji: { fr: 'Drapeau', en: 'Flag', pt: 'Bandeira', ar: 'العلم' },
};

interface PlatformLanguage {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  direction: 'ltr' | 'rtl';
  isActive: boolean;
  isDefault: boolean;
  coverage: number;
  totalKeys: number;
  translatedKeys: number;
  lastUpdate: string;
}

interface TranslationEntry {
  key: string;
  module: string;
  fr: string;
  en: string;
  pt: string;
  ar: string;
}

const LanguagesModule: React.FC = () => {
  const { lang } = useLanguage();
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.['fr'] || key;

  const [searchTerm, setSearchTerm] = useState('');
  const [translationSearch, setTranslationSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<TranslationEntry | null>(null);

  const [languages, setLanguages] = useState<PlatformLanguage[]>([
    { code: 'fr', name: 'Français', nativeName: 'Français', flag: '🇫🇷', direction: 'ltr', isActive: true, isDefault: true, coverage: 100, totalKeys: 620, translatedKeys: 620, lastUpdate: '2026-03-10' },
    { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', direction: 'ltr', isActive: true, isDefault: false, coverage: 98, totalKeys: 620, translatedKeys: 608, lastUpdate: '2026-03-09' },
    { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹', direction: 'ltr', isActive: true, isDefault: false, coverage: 92, totalKeys: 620, translatedKeys: 570, lastUpdate: '2026-03-07' },
    { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', direction: 'rtl', isActive: true, isDefault: false, coverage: 85, totalKeys: 620, translatedKeys: 527, lastUpdate: '2026-03-05' },
    { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', direction: 'ltr', isActive: false, isDefault: false, coverage: 15, totalKeys: 620, translatedKeys: 93, lastUpdate: '2026-02-20' },
    { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', direction: 'ltr', isActive: false, isDefault: false, coverage: 5, totalKeys: 620, translatedKeys: 31, lastUpdate: '2026-01-15' },
  ]);

  const translationEntries: TranslationEntry[] = [
    { key: 'sidebar.dashboard', module: 'Navigation', fr: 'Tableau de bord', en: 'Dashboard', pt: 'Painel', ar: 'لوحة التحكم' },
    { key: 'sidebar.myChildren', module: 'Navigation', fr: 'Mes enfants', en: 'My children', pt: 'Meus filhos', ar: 'أطفالي' },
    { key: 'login.title', module: 'Auth', fr: 'Connexion', en: 'Login', pt: 'Entrar', ar: 'تسجيل الدخول' },
    { key: 'login.email', module: 'Auth', fr: 'Email', en: 'Email', pt: 'Email', ar: 'البريد الإلكتروني' },
    { key: 'login.password', module: 'Auth', fr: 'Mot de passe', en: 'Password', pt: 'Senha', ar: 'كلمة المرور' },
    { key: 'screening.title', module: 'Screening', fr: 'Dépistage', en: 'Screening', pt: 'Triagem', ar: 'الفحص' },
    { key: 'screening.start', module: 'Screening', fr: 'Commencer', en: 'Start', pt: 'Iniciar', ar: 'ابدأ' },
    { key: 'child.name', module: 'Children', fr: 'Nom de l\'enfant', en: 'Child name', pt: 'Nome da criança', ar: 'اسم الطفل' },
    { key: 'child.age', module: 'Children', fr: 'Âge', en: 'Age', pt: 'Idade', ar: 'العمر' },
    { key: 'report.generate', module: 'Reporting', fr: 'Générer le rapport', en: 'Generate report', pt: 'Gerar relatório', ar: 'إنشاء التقرير' },
    { key: 'settings.save', module: 'Settings', fr: 'Enregistrer', en: 'Save', pt: 'Salvar', ar: 'حفظ' },
    { key: 'common.cancel', module: 'Common', fr: 'Annuler', en: 'Cancel', pt: 'Cancelar', ar: 'إلغاء' },
    { key: 'common.delete', module: 'Common', fr: 'Supprimer', en: 'Delete', pt: 'Excluir', ar: 'حذف' },
    { key: 'common.edit', module: 'Common', fr: 'Modifier', en: 'Edit', pt: 'Editar', ar: 'تعديل' },
    { key: 'common.search', module: 'Common', fr: 'Rechercher', en: 'Search', pt: 'Pesquisar', ar: 'بحث' },
  ];

  const modules = ['all', 'Navigation', 'Auth', 'Screening', 'Children', 'Reporting', 'Settings', 'Common'];

  const filteredLanguages = languages.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTranslations = translationEntries.filter(t =>
    (filterModule === 'all' || t.module === filterModule) &&
    (t.key.toLowerCase().includes(translationSearch.toLowerCase()) ||
     t.fr.toLowerCase().includes(translationSearch.toLowerCase()) ||
     t.en.toLowerCase().includes(translationSearch.toLowerCase()))
  );

  const toggleLanguageActive = (code: string) => {
    setLanguages(prev => prev.map(l =>
      l.code === code && !l.isDefault ? { ...l, isActive: !l.isActive } : l
    ));
  };

  const setDefaultLanguage = (code: string) => {
    setLanguages(prev => prev.map(l => ({
      ...l,
      isDefault: l.code === code,
      isActive: l.code === code ? true : l.isActive,
    })));
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 95) return 'text-green-600';
    if (coverage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCoverageBadge = (coverage: number) => {
    if (coverage >= 95) return 'default';
    if (coverage >= 75) return 'secondary';
    return 'destructive';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Languages className="h-7 w-7 text-primary" />
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> {t('exportAll')}
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-1" /> {t('importFile')}
            </Button>
            <Button size="sm" onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t('addLanguage')}
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Globe className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{languages.filter(l => l.isActive).length}</p>
              <p className="text-xs text-muted-foreground">{t('active')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">{languages[0].totalKeys}</p>
              <p className="text-xs text-muted-foreground">{t('totalKeys')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {Math.round(languages.filter(l => l.isActive).reduce((s, l) => s + l.coverage, 0) / languages.filter(l => l.isActive).length)}%
              </p>
              <p className="text-xs text-muted-foreground">{t('coverage')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {languages.filter(l => l.isActive).reduce((s, l) => s + (l.totalKeys - l.translatedKeys), 0)}
              </p>
              <p className="text-xs text-muted-foreground">{t('missing')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="languages">
          <TabsList>
            <TabsTrigger value="languages">{t('tabLanguages')}</TabsTrigger>
            <TabsTrigger value="translations">{t('tabTranslations')}</TabsTrigger>
            <TabsTrigger value="stats">{t('tabStats')}</TabsTrigger>
          </TabsList>

          {/* Languages Tab */}
          <TabsContent value="languages">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={t('search')}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('flagEmoji')}</TableHead>
                      <TableHead>{t('code')}</TableHead>
                      <TableHead>{t('language')}</TableHead>
                      <TableHead>{t('nativeName')}</TableHead>
                      <TableHead>{t('direction')}</TableHead>
                      <TableHead>{t('coverage')}</TableHead>
                      <TableHead>{t('status')}</TableHead>
                      <TableHead>{t('lastUpdate')}</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLanguages.map(langItem => (
                      <TableRow key={langItem.code}>
                        <TableCell className="text-2xl">{langItem.flag}</TableCell>
                        <TableCell className="font-mono font-bold text-foreground">{langItem.code.toUpperCase()}</TableCell>
                        <TableCell className="text-foreground">{langItem.name}</TableCell>
                        <TableCell className="text-muted-foreground">{langItem.nativeName}</TableCell>
                        <TableCell>
                          <Badge variant={langItem.direction === 'rtl' ? 'secondary' : 'outline'}>
                            {langItem.direction.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress value={langItem.coverage} className="w-20 h-2" />
                            <span className={`text-sm font-medium ${getCoverageColor(langItem.coverage)}`}>
                              {langItem.coverage}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={langItem.isActive}
                              onCheckedChange={() => toggleLanguageActive(langItem.code)}
                              disabled={langItem.isDefault}
                            />
                            {langItem.isDefault && (
                              <Badge variant="default">{t('default')}</Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">{langItem.lastUpdate}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {!langItem.isDefault && (
                              <Button variant="ghost" size="sm" onClick={() => setDefaultLanguage(langItem.code)} title={t('setDefault')}>
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Translations Tab */}
          <TabsContent value="translations">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t('search')}
                      value={translationSearch}
                      onChange={e => setTranslationSearch(e.target.value)}
                      className="max-w-xs"
                    />
                  </div>
                  <Select value={filterModule} onValueChange={setFilterModule}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {modules.map(m => (
                        <SelectItem key={m} value={m}>{m === 'all' ? t('module') + ' (All)' : m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('translationKey')}</TableHead>
                      <TableHead>{t('module')}</TableHead>
                      <TableHead>🇫🇷 FR</TableHead>
                      <TableHead>🇬🇧 EN</TableHead>
                      <TableHead>🇵🇹 PT</TableHead>
                      <TableHead>🇸🇦 AR</TableHead>
                      <TableHead>{t('actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTranslations.map(entry => (
                      <TableRow key={entry.key}>
                        <TableCell className="font-mono text-xs text-foreground">{entry.key}</TableCell>
                        <TableCell><Badge variant="outline">{entry.module}</Badge></TableCell>
                        <TableCell className="text-sm text-foreground">{entry.fr}</TableCell>
                        <TableCell className="text-sm text-foreground">{entry.en}</TableCell>
                        <TableCell className="text-sm text-foreground">{entry.pt}</TableCell>
                        <TableCell className="text-sm text-foreground" dir="rtl">{entry.ar}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => setEditingTranslation(entry)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {languages.filter(l => l.isActive).map(langItem => (
                <Card key={langItem.code}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span className="text-2xl">{langItem.flag}</span>
                      {langItem.name}
                      {langItem.isDefault && <Badge variant="default" className="ml-2">{t('default')}</Badge>}
                    </CardTitle>
                    <CardDescription>{langItem.nativeName} — {langItem.code.toUpperCase()}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-muted-foreground">{t('coverage')}</span>
                        <span className={`font-bold ${getCoverageColor(langItem.coverage)}`}>{langItem.coverage}%</span>
                      </div>
                      <Progress value={langItem.coverage} className="h-3" />
                    </div>
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-muted rounded-lg p-2">
                        <p className="text-lg font-bold text-foreground">{langItem.totalKeys}</p>
                        <p className="text-xs text-muted-foreground">{t('totalKeys')}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <p className="text-lg font-bold text-green-600">{langItem.translatedKeys}</p>
                        <p className="text-xs text-muted-foreground">{t('translated')}</p>
                      </div>
                      <div className="bg-muted rounded-lg p-2">
                        <p className="text-lg font-bold text-red-600">{langItem.totalKeys - langItem.translatedKeys}</p>
                        <p className="text-xs text-muted-foreground">{t('untranslated')}</p>
                      </div>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{t('direction')}: <Badge variant="outline">{langItem.direction.toUpperCase()}</Badge></span>
                      <span>{t('lastUpdate')}: {langItem.lastUpdate}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Add Language Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('addLanguage')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('code')}</Label>
                <Input placeholder="ex: wo, ha, zu" />
              </div>
              <div>
                <Label>{t('language')}</Label>
                <Input placeholder="ex: Wolof, Hausa, Zulu" />
              </div>
              <div>
                <Label>{t('nativeName')}</Label>
                <Input placeholder="ex: Wolof, Hausa, isiZulu" />
              </div>
              <div>
                <Label>{t('flagEmoji')}</Label>
                <Input placeholder="🇸🇳" />
              </div>
              <div>
                <Label>{t('direction')}</Label>
                <Select defaultValue="ltr">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ltr">LTR</SelectItem>
                    <SelectItem value="rtl">RTL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>{t('cancel')}</Button>
              <Button onClick={() => setShowAddDialog(false)}>{t('save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Translation Dialog */}
        <Dialog open={!!editingTranslation} onOpenChange={() => setEditingTranslation(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                <span className="font-mono text-sm">{editingTranslation?.key}</span>
              </DialogTitle>
            </DialogHeader>
            {editingTranslation && (
              <div className="space-y-3">
                <div>
                  <Label>🇫🇷 Français</Label>
                  <Input defaultValue={editingTranslation.fr} />
                </div>
                <div>
                  <Label>🇬🇧 English</Label>
                  <Input defaultValue={editingTranslation.en} />
                </div>
                <div>
                  <Label>🇵🇹 Português</Label>
                  <Input defaultValue={editingTranslation.pt} />
                </div>
                <div>
                  <Label>🇸🇦 العربية</Label>
                  <Input defaultValue={editingTranslation.ar} dir="rtl" />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTranslation(null)}>{t('cancel')}</Button>
              <Button onClick={() => setEditingTranslation(null)}>{t('save')}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LanguagesModule;
