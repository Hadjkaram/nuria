import React, { useState, useEffect } from 'react';
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
  Download, Upload, Languages, BarChart3, Eye, RefreshCw, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

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
  id: string;
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
  id: string;
  key: string;
  module: string;
  fr: string;
  en: string;
  pt: string;
  ar: string;
}

const LanguagesModule: React.FC = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.['fr'] || key;

  const [searchTerm, setSearchTerm] = useState('');
  const [translationSearch, setTranslationSearch] = useState('');
  const [filterModule, setFilterModule] = useState('all');
  
  const [languages, setLanguages] = useState<PlatformLanguage[]>([]);
  const [translationEntries, setTranslationEntries] = useState<TranslationEntry[]>([]);
  
  const [isLoadingLangs, setIsLoadingLangs] = useState(true);
  const [isLoadingTrans, setIsLoadingTrans] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<TranslationEntry | null>(null);
  
  const [newLang, setNewLang] = useState({ code: '', language: '', nativeName: '', flag: '', direction: 'ltr' });

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchData = async () => {
    setIsLoadingLangs(true);
    setIsLoadingTrans(true);
    try {
      const [langsRes, transRes] = await Promise.all([
        supabase.from('platform_languages').select('*').order('is_default', { ascending: false }),
        supabase.from('translations').select('*').order('key', { ascending: true })
      ]);

      if (langsRes.error) throw langsRes.error;
      if (transRes.error) throw transRes.error;

      if (langsRes.data) {
        setLanguages(langsRes.data.map(l => ({
          id: l.id, code: l.code, name: l.name, nativeName: l.native_name, flag: l.flag,
          direction: l.direction, isActive: l.is_active, isDefault: l.is_default, coverage: l.coverage,
          totalKeys: l.total_keys, translatedKeys: l.translated_keys, lastUpdate: l.last_update
        })));
      }

      if (transRes.data) {
        setTranslationEntries(transRes.data.map(tr => ({
          id: tr.id, key: tr.key, module: tr.module, fr: tr.fr || '', en: tr.en || '', pt: tr.pt || '', ar: tr.ar || ''
        })));
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
    } finally {
      setIsLoadingLangs(false);
      setIsLoadingTrans(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const modules = ['all', 'Navigation', 'Auth', 'Screening', 'Children', 'Reporting', 'Settings', 'Common'];

  const filteredLanguages = languages.filter(l =>
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.nativeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredTranslations = translationEntries.filter(tr =>
    (filterModule === 'all' || tr.module === filterModule) &&
    (tr.key.toLowerCase().includes(translationSearch.toLowerCase()) ||
     tr.fr.toLowerCase().includes(translationSearch.toLowerCase()) ||
     tr.en.toLowerCase().includes(translationSearch.toLowerCase()))
  );

  // --- 2. ACTIONS SUPABASE (LANGUES) ---
  const toggleLanguageActive = async (code: string) => {
    const langToUpdate = languages.find(l => l.code === code);
    if (!langToUpdate || langToUpdate.isDefault) return;
    
    const newStatus = !langToUpdate.isActive;
    setLanguages(prev => prev.map(l => l.code === code ? { ...l, isActive: newStatus } : l));

    try {
      const { error } = await supabase.from('platform_languages').update({ is_active: newStatus }).eq('id', langToUpdate.id);
      if (error) throw error;
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de la mise à jour du statut.", variant: "destructive" });
      fetchData(); // Revert on error
    }
  };

  const setDefaultLanguage = async (code: string) => {
    const langToUpdate = languages.find(l => l.code === code);
    if (!langToUpdate) return;

    setLanguages(prev => prev.map(l => ({ ...l, isDefault: l.code === code, isActive: l.code === code ? true : l.isActive })));

    try {
      // Retirer le statut par défaut de toutes les autres langues
      await supabase.from('platform_languages').update({ is_default: false }).neq('code', code);
      // Appliquer le statut à la nouvelle
      const { error } = await supabase.from('platform_languages').update({ is_default: true, is_active: true }).eq('id', langToUpdate.id);
      if (error) throw error;
      toast({ title: "Succès", description: "Langue par défaut mise à jour." });
    } catch (err) {
      toast({ title: "Erreur", description: "Échec de l'opération.", variant: "destructive" });
      fetchData(); // Revert
    }
  };

  const handleAddLanguage = async () => {
    if (!newLang.code || !newLang.language) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('platform_languages').insert([{
        code: newLang.code.toLowerCase(),
        name: newLang.language,
        native_name: newLang.nativeName,
        flag: newLang.flag,
        direction: newLang.direction,
        is_active: false,
        is_default: false,
      }]);
      if (error) throw error;
      
      toast({ title: "Succès", description: "Langue ajoutée avec succès." });
      setShowAddDialog(false);
      setNewLang({ code: '', language: '', nativeName: '', flag: '', direction: 'ltr' });
      fetchData();
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. ACTIONS SUPABASE (TRADUCTIONS) ---
  const handleSaveTranslation = async () => {
    if (!editingTranslation) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('translations').update({
        fr: editingTranslation.fr,
        en: editingTranslation.en,
        pt: editingTranslation.pt,
        ar: editingTranslation.ar,
        updated_at: new Date().toISOString()
      }).eq('id', editingTranslation.id);

      if (error) throw error;

      setTranslationEntries(prev => prev.map(t => t.id === editingTranslation.id ? editingTranslation : t));
      setEditingTranslation(null);
      toast({ title: "Succès", description: "Traduction mise à jour." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCoverageColor = (coverage: number) => {
    if (coverage >= 95) return 'text-green-600';
    if (coverage >= 75) return 'text-yellow-600';
    return 'text-red-600';
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
              <p className="text-2xl font-bold text-foreground">{languages.length > 0 ? languages[0].totalKeys : 0}</p>
              <p className="text-xs text-muted-foreground">{t('totalKeys')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <BarChart3 className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">
                {languages.filter(l => l.isActive).length > 0 
                  ? Math.round(languages.filter(l => l.isActive).reduce((s, l) => s + l.coverage, 0) / languages.filter(l => l.isActive).length)
                  : 0}%
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
                {isLoadingLangs ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
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
                      {filteredLanguages.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={9} className="text-center text-muted-foreground py-6">Aucune langue trouvée.</TableCell>
                        </TableRow>
                      ) : filteredLanguages.map(langItem => (
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
                )}
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
                {isLoadingTrans ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : (
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
                      {filteredTranslations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-6">Aucune traduction trouvée.</TableCell>
                        </TableRow>
                      ) : filteredTranslations.map(entry => (
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
                )}
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
                <Input value={newLang.code} onChange={e => setNewLang({...newLang, code: e.target.value})} placeholder="ex: wo, ha, zu" />
              </div>
              <div>
                <Label>{t('language')}</Label>
                <Input value={newLang.language} onChange={e => setNewLang({...newLang, language: e.target.value})} placeholder="ex: Wolof, Hausa, Zulu" />
              </div>
              <div>
                <Label>{t('nativeName')}</Label>
                <Input value={newLang.nativeName} onChange={e => setNewLang({...newLang, nativeName: e.target.value})} placeholder="ex: Wolof, Hausa, isiZulu" />
              </div>
              <div>
                <Label>{t('flagEmoji')}</Label>
                <Input value={newLang.flag} onChange={e => setNewLang({...newLang, flag: e.target.value})} placeholder="🇸🇳" />
              </div>
              <div>
                <Label>{t('direction')}</Label>
                <Select value={newLang.direction} onValueChange={v => setNewLang({...newLang, direction: v})}>
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
              <Button onClick={handleAddLanguage} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t('save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Translation Dialog */}
        <Dialog open={!!editingTranslation} onOpenChange={(open) => !open && setEditingTranslation(null)}>
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
                  <Input value={editingTranslation.fr} onChange={e => setEditingTranslation({...editingTranslation, fr: e.target.value})} />
                </div>
                <div>
                  <Label>🇬🇧 English</Label>
                  <Input value={editingTranslation.en} onChange={e => setEditingTranslation({...editingTranslation, en: e.target.value})} />
                </div>
                <div>
                  <Label>🇵🇹 Português</Label>
                  <Input value={editingTranslation.pt} onChange={e => setEditingTranslation({...editingTranslation, pt: e.target.value})} />
                </div>
                <div>
                  <Label>🇸🇦 العربية</Label>
                  <Input value={editingTranslation.ar} onChange={e => setEditingTranslation({...editingTranslation, ar: e.target.value})} dir="rtl" />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTranslation(null)}>{t('cancel')}</Button>
              <Button onClick={handleSaveTranslation} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t('save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LanguagesModule;