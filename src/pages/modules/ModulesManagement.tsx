import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Lang } from '@/i18n/translations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Layers, Search, CheckCircle, XCircle, Settings, Eye, Baby,
  Brain, Puzzle, Stethoscope, Calendar, Video, BookHeart, GraduationCap,
  Users, BarChart3, FileText, Heart, MapPin, Building, Activity,
  ClipboardList, ArrowRightLeft, Award, TrendingUp, Shield, Globe,
  Database, Monitor, Flag, Lock, Unlock, AlertTriangle, Info, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase'; // <-- AJOUT

const tt = (map: Record<Lang, string>, lang: Lang) => map[lang] || map.fr;

// Mapping textuel des icônes stockées en DB vers le composant Lucide
const iconMap: Record<string, React.ElementType> = {
  Baby, Heart, Calendar, Video, FileText, ClipboardList, Brain, Puzzle, Eye,
  BookHeart, Award, Users, ArrowRightLeft, Activity, Settings, Building, BarChart3,
  TrendingUp, MapPin, Database, Layers
};

interface ModuleConfig {
  id: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  icon: React.ElementType; // Mapping fait côté front
  category: string;
  isEnabled: boolean;
  isCore: boolean;
  version: string;
  usageCount: number;
  roles: string[];
  dependencies: string[];
}

const categories: { key: string; label: Record<Lang, string>; icon: React.ElementType }[] = [
  { key: 'clinical', label: { fr: 'Clinique & Soins', en: 'Clinical & Care', pt: 'Clínico & Cuidados', ar: 'السريري والرعاية' }, icon: Stethoscope },
  { key: 'screening', label: { fr: 'Dépistage & Évaluation', en: 'Screening & Evaluation', pt: 'Triagem & Avaliação', ar: 'الفحص والتقييم' }, icon: ClipboardList },
  { key: 'education', label: { fr: 'Éducation & Formation', en: 'Education & Training', pt: 'Educação & Formação', ar: 'التعليم والتدريب' }, icon: GraduationCap },
  { key: 'community', label: { fr: 'Communauté & Terrain', en: 'Community & Field', pt: 'Comunidade & Campo', ar: 'المجتمع والميدان' }, icon: Users },
  { key: 'admin', label: { fr: 'Administration', en: 'Administration', pt: 'Administração', ar: 'الإدارة' }, icon: Settings },
  { key: 'analytics', label: { fr: 'Analytique & Rapports', en: 'Analytics & Reports', pt: 'Análise & Relatórios', ar: 'التحليلات والتقارير' }, icon: BarChart3 },
];

const ModulesManagement: React.FC = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  
  const [modules, setModules] = useState<ModuleConfig[]>([]); // <-- INITIALISATION VIDE
  const [isLoading, setIsLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null);
  const [showDepsWarning, setShowDepsWarning] = useState<{ module: ModuleConfig; dependents: string[] } | null>(null);

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchModules = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('modules_config').select('*').order('id', { ascending: true });
      
      if (error) throw error;

      if (data) {
        const formattedModules: ModuleConfig[] = data.map(m => ({
          id: m.id,
          name: m.name,
          description: m.description,
          icon: iconMap[m.icon_name] || Layers, // Fallback si icône inconnue
          category: m.category,
          isEnabled: m.is_enabled,
          isCore: m.is_core,
          version: m.version,
          usageCount: m.usage_count,
          roles: m.roles || [],
          dependencies: m.dependencies || []
        }));
        setModules(formattedModules);
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: "Impossible de charger la configuration des modules.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchModules();
  }, []);

  const labels = {
    title: { fr: 'Gestion des modules', en: 'Module Management', pt: 'Gestão de módulos', ar: 'إدارة الوحدات' },
    subtitle: { fr: 'Activer, désactiver et configurer les modules de la plateforme', en: 'Enable, disable and configure platform modules', pt: 'Ativar, desativar e configurar módulos da plataforma', ar: 'تفعيل وإلغاء تفعيل وتكوين وحدات المنصة' },
    overview: { fr: 'Vue d\'ensemble', en: 'Overview', pt: 'Visão geral', ar: 'نظرة عامة' },
    catalog: { fr: 'Catalogue', en: 'Catalog', pt: 'Catálogo', ar: 'الكتالوج' },
    search: { fr: 'Rechercher un module...', en: 'Search module...', pt: 'Buscar módulo...', ar: 'البحث عن وحدة...' },
    allCategories: { fr: 'Toutes les catégories', en: 'All categories', pt: 'Todas as categorias', ar: 'كل الفئات' },
    allStatuses: { fr: 'Tous', en: 'All', pt: 'Todos', ar: 'الكل' },
    enabled: { fr: 'Activé', en: 'Enabled', pt: 'Ativado', ar: 'مفعّل' },
    disabled: { fr: 'Désactivé', en: 'Disabled', pt: 'Desativado', ar: 'معطّل' },
    core: { fr: 'Module essentiel', en: 'Core module', pt: 'Módulo essencial', ar: 'وحدة أساسية' },
    version: { fr: 'Version', en: 'Version', pt: 'Versão', ar: 'الإصدار' },
    usage: { fr: 'Utilisation', en: 'Usage', pt: 'Uso', ar: 'الاستخدام' },
    roles: { fr: 'Rôles autorisés', en: 'Authorized roles', pt: 'Funções autorizadas', ar: 'الأدوار المصرح لها' },
    dependencies: { fr: 'Dépendances', en: 'Dependencies', pt: 'Dependências', ar: 'التبعيات' },
    noDeps: { fr: 'Aucune dépendance', en: 'No dependencies', pt: 'Sem dependências', ar: 'لا توجد تبعيات' },
    warningTitle: { fr: 'Attention', en: 'Warning', pt: 'Atenção', ar: 'تحذير' },
    warningDesc: { fr: 'Désactiver ce module affectera les modules suivants qui en dépendent :', en: 'Disabling this module will affect the following dependent modules:', pt: 'Desativar este módulo afetará os seguintes módulos dependentes:', ar: 'إلغاء تفعيل هذه الوحدة سيؤثر على الوحدات التالية التي تعتمد عليها:' },
    confirm: { fr: 'Confirmer', en: 'Confirm', pt: 'Confirmar', ar: 'تأكيد' },
    cancel: { fr: 'Annuler', en: 'Cancel', pt: 'Cancelar', ar: 'إلغاء' },
    records: { fr: 'enregistrements', en: 'records', pt: 'registros', ar: 'سجلات' },
  };

  const roleLabels: Record<string, Record<Lang, string>> = {
    parent: { fr: 'Parent', en: 'Parent', pt: 'Pai/Mãe', ar: 'ولي أمر' },
    professional: { fr: 'Professionnel', en: 'Professional', pt: 'Profissional', ar: 'مهني' },
    teacher: { fr: 'Enseignant', en: 'Teacher', pt: 'Professor', ar: 'معلم' },
    community: { fr: 'Communautaire', en: 'Community', pt: 'Comunitário', ar: 'مجتمعي' },
    orgAdmin: { fr: 'Admin. org.', en: 'Org. admin', pt: 'Admin. org.', ar: 'مدير منظمة' },
    program: { fr: 'Programme', en: 'Program', pt: 'Programa', ar: 'برنامج' },
    ministry: { fr: 'Ministère', en: 'Ministry', pt: 'Ministério', ar: 'وزارة' },
    superAdmin: { fr: 'Super Admin', en: 'Super Admin', pt: 'Super Admin', ar: 'المدير الأعلى' },
  };

  const filtered = modules.filter(m => {
    const matchSearch = tt(m.name, lang).toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = filterCategory === 'all' || m.category === filterCategory;
    const matchStatus = filterStatus === 'all' || (filterStatus === 'enabled' ? m.isEnabled : !m.isEnabled);
    return matchSearch && matchCat && matchStatus;
  });

  const totals = {
    total: modules.length,
    enabled: modules.filter(m => m.isEnabled).length,
    core: modules.filter(m => m.isCore).length,
    usage: modules.reduce((a, m) => a + m.usageCount, 0),
  };

  const getDependents = (moduleId: string) =>
    modules.filter(m => m.dependencies.includes(moduleId)).map(m => tt(m.name, lang));

  const handleToggle = (mod: ModuleConfig) => {
    if (mod.isCore) {
      toast({ title: tt({ fr: 'Module essentiel — ne peut pas être désactivé', en: 'Core module — cannot be disabled', pt: 'Módulo essencial — não pode ser desativado', ar: 'وحدة أساسية — لا يمكن إلغاء تفعيلها' }, lang), variant: 'destructive' });
      return;
    }
    if (mod.isEnabled) {
      const dependents = getDependents(mod.id);
      if (dependents.length > 0) {
        setShowDepsWarning({ module: mod, dependents });
        return;
      }
    }
    performToggle(mod.id);
  };

  // --- 2. ACTIONS SUPABASE (Mise à jour du statut) ---
  const performToggle = async (moduleId: string) => {
    const mod = modules.find(m => m.id === moduleId);
    if (!mod) return;
    
    const newStatus = !mod.isEnabled;

    // Maj Optimiste UI
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, isEnabled: newStatus } : m));
    setSelectedModule(prev => prev?.id === moduleId ? { ...prev, isEnabled: newStatus } : prev);
    setShowDepsWarning(null);

    try {
      const { error } = await supabase.from('modules_config').update({ 
        is_enabled: newStatus,
        updated_at: new Date().toISOString()
      }).eq('id', moduleId);

      if (error) throw error;
      toast({ title: tt({ fr: 'Module mis à jour', en: 'Module updated', pt: 'Módulo atualizado', ar: 'تم تحديث الوحدة' }, lang) });
    } catch (err: any) {
      toast({ title: "Erreur", description: "Échec de la mise à jour", variant: "destructive" });
      fetchModules(); // Rollback en cas d'erreur
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tt(labels.title, lang)}</h1>
            <p className="text-sm text-muted-foreground mt-1">{tt(labels.subtitle, lang)}</p>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline" className="gap-1"><Layers className="h-3.5 w-3.5" />{totals.enabled}/{totals.total} {tt(labels.enabled, lang)}</Badge>
            <Badge variant="secondary" className="gap-1"><Lock className="h-3.5 w-3.5" />{totals.core} {tt(labels.core, lang)}</Badge>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.slice(0, 4).map((cat, i) => {
            const Icon = cat.icon;
            const count = modules.filter(m => m.category === cat.key && m.isEnabled).length;
            const total = modules.filter(m => m.category === cat.key).length;
            return (
              <Card key={i} className="cursor-pointer hover:border-primary/30 transition-colors" onClick={() => setFilterCategory(cat.key)}>
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><Icon className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="text-xl font-bold text-foreground">{count}/{total}</div>
                      <div className="text-xs text-muted-foreground">{tt(cat.label, lang)}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={tt(labels.search, lang)} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tt(labels.allCategories, lang)}</SelectItem>
              {categories.map(c => <SelectItem key={c.key} value={c.key}>{tt(c.label, lang)}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{tt(labels.allStatuses, lang)}</SelectItem>
              <SelectItem value="enabled">{tt(labels.enabled, lang)}</SelectItem>
              <SelectItem value="disabled">{tt(labels.disabled, lang)}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Module list + detail */}
        {isLoading ? (
           <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <div className="flex gap-6">
            <div className={`space-y-3 transition-all ${selectedModule ? 'w-1/2' : 'w-full'}`}>
              {categories.filter(cat => filterCategory === 'all' || filterCategory === cat.key).map(cat => {
                const catModules = filtered.filter(m => m.category === cat.key);
                if (catModules.length === 0) return null;
                const CatIcon = cat.icon;
                return (
                  <div key={cat.key}>
                    <div className="flex items-center gap-2 mb-2 mt-4 first:mt-0">
                      <CatIcon className="h-4 w-4 text-primary" />
                      <span className="text-sm font-semibold text-foreground">{tt(cat.label, lang)}</span>
                      <Badge variant="outline" className="text-[10px] ml-auto">{catModules.filter(m => m.isEnabled).length}/{catModules.length}</Badge>
                    </div>
                    {catModules.map(mod => {
                      const Icon = mod.icon;
                      const isSelected = selectedModule?.id === mod.id;
                      return (
                        <Card key={mod.id} className={`cursor-pointer transition-all hover:border-primary/30 mb-2 ${isSelected ? 'border-primary ring-1 ring-primary/20' : ''} ${!mod.isEnabled ? 'opacity-60' : ''}`} onClick={() => setSelectedModule(mod)}>
                          <CardContent className="py-3.5">
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${mod.isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                                <Icon className={`h-5 w-5 ${mod.isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="font-medium text-sm truncate">{tt(mod.name, lang)}</span>
                                  {mod.isCore && <Badge variant="secondary" className="text-[9px] h-4 gap-0.5"><Lock className="h-2.5 w-2.5" />{tt(labels.core, lang)}</Badge>}
                                </div>
                                <p className="text-[11px] text-muted-foreground truncate">{tt(mod.description, lang)}</p>
                              </div>
                              <Switch checked={mod.isEnabled} onCheckedChange={() => handleToggle(mod)} onClick={e => e.stopPropagation()} />
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {/* Detail panel */}
            {selectedModule && (
              <div className="w-1/2">
                <Card className="sticky top-20">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${selectedModule.isEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                          <selectedModule.icon className={`h-6 w-6 ${selectedModule.isEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{tt(selectedModule.name, lang)}</CardTitle>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant={selectedModule.isEnabled ? 'default' : 'outline'}>{tt(selectedModule.isEnabled ? labels.enabled : labels.disabled, lang)}</Badge>
                            {selectedModule.isCore && <Badge variant="secondary" className="gap-0.5"><Lock className="h-3 w-3" />{tt(labels.core, lang)}</Badge>}
                          </div>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedModule(null)}><XCircle className="h-4 w-4" /></Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <p className="text-sm text-muted-foreground">{tt(selectedModule.description, lang)}</p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">{tt(labels.version, lang)}</div>
                        <div className="font-bold text-sm mt-0.5">v{selectedModule.version}</div>
                      </div>
                      <div className="bg-muted/30 rounded-lg p-3">
                        <div className="text-xs text-muted-foreground">{tt(labels.usage, lang)}</div>
                        <div className="font-bold text-sm mt-0.5">{selectedModule.usageCount.toLocaleString()} {tt(labels.records, lang)}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2">{tt(labels.roles, lang)}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedModule.roles.map(r => (
                          <Badge key={r} variant="outline" className="text-[10px]">{tt(roleLabels[r] || { fr: r, en: r, pt: r, ar: r }, lang)}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-muted-foreground mb-2">{tt(labels.dependencies, lang)}</div>
                      {selectedModule.dependencies.length > 0 ? (
                        <div className="space-y-1.5">
                          {selectedModule.dependencies.map(depId => {
                            const dep = modules.find(m => m.id === depId);
                            if (!dep) return null;
                            return (
                              <div key={depId} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                                <dep.icon className="h-4 w-4 text-primary" />
                                <span className="text-sm">{tt(dep.name, lang)}</span>
                                <Badge variant={dep.isEnabled ? 'default' : 'destructive'} className="ml-auto text-[9px]">
                                  {tt(dep.isEnabled ? labels.enabled : labels.disabled, lang)}
                                </Badge>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">{tt(labels.noDeps, lang)}</p>
                      )}
                    </div>

                    {getDependents(selectedModule.id).length > 0 && (
                      <div>
                        <div className="text-xs font-semibold text-muted-foreground mb-2">{tt({ fr: 'Utilisé par', en: 'Used by', pt: 'Usado por', ar: 'يُستخدم بواسطة' }, lang)}</div>
                        <div className="flex flex-wrap gap-1.5">
                          {getDependents(selectedModule.id).map((name, i) => (
                            <Badge key={i} variant="outline" className="text-[10px]">{name}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2">
                      <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                        <div>
                          <div className="text-sm font-medium">{tt(selectedModule.isEnabled ? labels.enabled : labels.disabled, lang)}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {selectedModule.isCore
                              ? tt({ fr: 'Ce module essentiel ne peut pas être désactivé', en: 'This core module cannot be disabled', pt: 'Este módulo essencial não pode ser desativado', ar: 'هذه الوحدة الأساسية لا يمكن إلغاء تفعيلها' }, lang)
                              : tt({ fr: 'Activer ou désactiver ce module', en: 'Enable or disable this module', pt: 'Ativar ou desativar este módulo', ar: 'تفعيل أو إلغاء تفعيل هذه الوحدة' }, lang)
                            }
                          </div>
                        </div>
                        <Switch checked={selectedModule.isEnabled} onCheckedChange={() => handleToggle(selectedModule)} disabled={selectedModule.isCore} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dependencies warning dialog */}
      <Dialog open={!!showDepsWarning} onOpenChange={() => setShowDepsWarning(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              {tt(labels.warningTitle, lang)}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-muted-foreground mb-3">{tt(labels.warningDesc, lang)}</p>
            <div className="space-y-2">
              {showDepsWarning?.dependents.map((dep, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-destructive/5">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="text-sm font-medium">{dep}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepsWarning(null)}>{tt(labels.cancel, lang)}</Button>
            <Button variant="destructive" onClick={() => showDepsWarning && performToggle(showDepsWarning.module.id)}>{tt(labels.confirm, lang)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ModulesManagement;