import React, { useState } from 'react';
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
  Database, Monitor, Flag, Lock, Unlock, AlertTriangle, Info,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const tt = (map: Record<Lang, string>, lang: Lang) => map[lang] || map.fr;

interface ModuleConfig {
  id: string;
  name: Record<Lang, string>;
  description: Record<Lang, string>;
  icon: React.ElementType;
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

const initialModules: ModuleConfig[] = [
  // Clinical
  { id: 'children', name: { fr: 'Dossier numérique enfant', en: 'Digital child record', pt: 'Prontuário digital da criança', ar: 'السجل الرقمي للطفل' }, description: { fr: 'Gestion complète des dossiers enfants avec données démographiques, médicales et développementales', en: 'Complete child record management with demographic, medical and developmental data', pt: 'Gestão completa de prontuários infantis com dados demográficos, médicos e de desenvolvimento', ar: 'إدارة شاملة لسجلات الأطفال مع البيانات الديموغرافية والطبية والتنموية' }, icon: Baby, category: 'clinical', isEnabled: true, isCore: true, version: '2.1.0', usageCount: 12450, roles: ['parent', 'professional', 'teacher', 'community', 'orgAdmin'], dependencies: [] },
  { id: 'care-plans', name: { fr: 'Plans de prise en charge', en: 'Care plans', pt: 'Planos de cuidado', ar: 'خطط الرعاية' }, description: { fr: 'Création et suivi de plans de soins personnalisés', en: 'Creation and monitoring of personalized care plans', pt: 'Criação e acompanhamento de planos de cuidado personalizados', ar: 'إنشاء ومتابعة خطط الرعاية المخصصة' }, icon: Heart, category: 'clinical', isEnabled: true, isCore: false, version: '1.8.0', usageCount: 3200, roles: ['professional', 'orgAdmin'], dependencies: ['children'] },
  { id: 'appointments', name: { fr: 'Rendez-vous', en: 'Appointments', pt: 'Consultas', ar: 'المواعيد' }, description: { fr: 'Planification et gestion des rendez-vous médicaux', en: 'Medical appointment scheduling and management', pt: 'Agendamento e gestão de consultas médicas', ar: 'جدولة وإدارة المواعيد الطبية' }, icon: Calendar, category: 'clinical', isEnabled: true, isCore: false, version: '1.5.0', usageCount: 8900, roles: ['parent', 'professional', 'orgAdmin'], dependencies: ['children'] },
  { id: 'teleconsultation', name: { fr: 'Téléconsultation', en: 'Teleconsultation', pt: 'Teleconsulta', ar: 'الاستشارة عن بعد' }, description: { fr: 'Consultations vidéo à distance entre professionnels et familles', en: 'Remote video consultations between professionals and families', pt: 'Consultas por vídeo entre profissionais e famílias', ar: 'استشارات الفيديو عن بعد بين المهنيين والعائلات' }, icon: Video, category: 'clinical', isEnabled: true, isCore: false, version: '1.3.0', usageCount: 2100, roles: ['parent', 'professional'], dependencies: ['appointments'] },
  { id: 'documents', name: { fr: 'Documents cliniques', en: 'Clinical documents', pt: 'Documentos clínicos', ar: 'المستندات السريرية' }, description: { fr: 'Gestion des comptes-rendus, certificats et documents médicaux', en: 'Management of reports, certificates and medical documents', pt: 'Gestão de relatórios, certificados e documentos médicos', ar: 'إدارة التقارير والشهادات والمستندات الطبية' }, icon: FileText, category: 'clinical', isEnabled: true, isCore: false, version: '1.4.0', usageCount: 4500, roles: ['professional', 'orgAdmin'], dependencies: ['children'] },
  // Screening
  { id: 'screening', name: { fr: 'Dépistage général', en: 'General screening', pt: 'Triagem geral', ar: 'الفحص العام' }, description: { fr: 'Outils de dépistage développemental standardisés (ASQ, Denver)', en: 'Standardized developmental screening tools (ASQ, Denver)', pt: 'Ferramentas padronizadas de triagem do desenvolvimento (ASQ, Denver)', ar: 'أدوات الفحص التنموي المعيارية (ASQ, Denver)' }, icon: ClipboardList, category: 'screening', isEnabled: true, isCore: true, version: '2.0.0', usageCount: 8320, roles: ['professional', 'teacher', 'community'], dependencies: ['children'] },
  { id: 'adhd', name: { fr: 'Module TDAH', en: 'ADHD module', pt: 'Módulo TDAH', ar: 'وحدة فرط الحركة' }, description: { fr: 'Évaluation spécifique du TDAH avec échelles Conners et SNAP-IV', en: 'Specific ADHD assessment with Conners and SNAP-IV scales', pt: 'Avaliação específica do TDAH com escalas Conners e SNAP-IV', ar: 'تقييم محدد لفرط الحركة مع مقاييس Conners و SNAP-IV' }, icon: Brain, category: 'screening', isEnabled: true, isCore: false, version: '1.6.0', usageCount: 2800, roles: ['professional'], dependencies: ['screening'] },
  { id: 'autism', name: { fr: 'Module Autisme/TND', en: 'Autism/NDD module', pt: 'Módulo Autismo/TND', ar: 'وحدة التوحد' }, description: { fr: 'Dépistage et suivi des troubles du spectre autistique (M-CHAT, ADOS)', en: 'Autism spectrum disorder screening and monitoring (M-CHAT, ADOS)', pt: 'Triagem e monitoramento do espectro autista (M-CHAT, ADOS)', ar: 'فحص ومتابعة اضطرابات طيف التوحد (M-CHAT, ADOS)' }, icon: Puzzle, category: 'screening', isEnabled: true, isCore: false, version: '1.7.0', usageCount: 3100, roles: ['professional'], dependencies: ['screening'] },
  { id: 'questionnaires', name: { fr: 'Questionnaires', en: 'Questionnaires', pt: 'Questionários', ar: 'الاستبيانات' }, description: { fr: 'Questionnaires parentaux et formulaires d\'évaluation personnalisables', en: 'Parental questionnaires and customizable evaluation forms', pt: 'Questionários parentais e formulários de avaliação personalizáveis', ar: 'استبيانات الوالدين ونماذج التقييم القابلة للتخصيص' }, icon: ClipboardList, category: 'screening', isEnabled: true, isCore: false, version: '1.2.0', usageCount: 5600, roles: ['parent', 'professional'], dependencies: ['children'] },
  // Education
  { id: 'observations', name: { fr: 'Observations pédagogiques', en: 'Pedagogical observations', pt: 'Observações pedagógicas', ar: 'الملاحظات التعليمية' }, description: { fr: 'Grilles d\'observation en milieu scolaire', en: 'School environment observation grids', pt: 'Grades de observação em ambiente escolar', ar: 'شبكات الملاحظة في البيئة المدرسية' }, icon: Eye, category: 'education', isEnabled: true, isCore: false, version: '1.1.0', usageCount: 1850, roles: ['teacher'], dependencies: ['children'] },
  { id: 'guidance', name: { fr: 'Guidance parentale', en: 'Parental guidance', pt: 'Orientação parental', ar: 'التوجيه الوالدي' }, description: { fr: 'Programmes de guidance et ressources pour les parents', en: 'Guidance programs and resources for parents', pt: 'Programas de orientação e recursos para pais', ar: 'برامج التوجيه والموارد للوالدين' }, icon: BookHeart, category: 'education', isEnabled: true, isCore: false, version: '1.0.0', usageCount: 3400, roles: ['parent', 'professional'], dependencies: [] },
  { id: 'training', name: { fr: 'Formation', en: 'Training', pt: 'Formação', ar: 'التدريب' }, description: { fr: 'Modules de formation en ligne pour les professionnels', en: 'Online training modules for professionals', pt: 'Módulos de formação online para profissionais', ar: 'وحدات التدريب عبر الإنترنت للمهنيين' }, icon: Award, category: 'education', isEnabled: true, isCore: false, version: '1.3.0', usageCount: 920, roles: ['professional', 'teacher', 'community'], dependencies: [] },
  { id: 'resources', name: { fr: 'Ressources éducatives', en: 'Educational resources', pt: 'Recursos educativos', ar: 'الموارد التعليمية' }, description: { fr: 'Bibliothèque de ressources et guides pratiques', en: 'Resource library and practical guides', pt: 'Biblioteca de recursos e guias práticos', ar: 'مكتبة الموارد والأدلة العملية' }, icon: Heart, category: 'education', isEnabled: true, isCore: false, version: '1.0.0', usageCount: 4200, roles: ['parent', 'teacher', 'community'], dependencies: [] },
  // Community
  { id: 'families', name: { fr: 'Familles suivies', en: 'Followed families', pt: 'Famílias acompanhadas', ar: 'العائلات المتابعة' }, description: { fr: 'Suivi des familles par les agents communautaires', en: 'Family follow-up by community agents', pt: 'Acompanhamento de famílias por agentes comunitários', ar: 'متابعة العائلات بواسطة العاملين المجتمعيين' }, icon: Users, category: 'community', isEnabled: true, isCore: false, version: '1.2.0', usageCount: 1420, roles: ['community', 'orgAdmin'], dependencies: ['children'] },
  { id: 'orientation', name: { fr: 'Orientation & Référencement', en: 'Referral & Orientation', pt: 'Encaminhamento & Orientação', ar: 'الإحالة والتوجيه' }, description: { fr: 'Système d\'orientation des enfants vers les structures adaptées', en: 'Child referral system to appropriate structures', pt: 'Sistema de encaminhamento de crianças para estruturas adequadas', ar: 'نظام إحالة الأطفال إلى الهياكل المناسبة' }, icon: ArrowRightLeft, category: 'community', isEnabled: true, isCore: false, version: '1.4.0', usageCount: 2600, roles: ['professional', 'community', 'program'], dependencies: ['children', 'screening'] },
  { id: 'activities', name: { fr: 'Activités terrain', en: 'Field activities', pt: 'Atividades de campo', ar: 'الأنشطة الميدانية' }, description: { fr: 'Suivi des activités de sensibilisation et terrain', en: 'Monitoring of awareness and field activities', pt: 'Monitoramento de atividades de sensibilização e campo', ar: 'متابعة أنشطة التوعية والميدان' }, icon: Activity, category: 'community', isEnabled: true, isCore: false, version: '1.1.0', usageCount: 1100, roles: ['community', 'orgAdmin', 'program'], dependencies: [] },
  // Admin
  { id: 'users', name: { fr: 'Gestion utilisateurs', en: 'User management', pt: 'Gestão de usuários', ar: 'إدارة المستخدمين' }, description: { fr: 'Création, gestion et supervision des comptes utilisateurs', en: 'User account creation, management and supervision', pt: 'Criação, gestão e supervisão de contas de usuário', ar: 'إنشاء وإدارة ومراقبة حسابات المستخدمين' }, icon: Users, category: 'admin', isEnabled: true, isCore: true, version: '2.0.0', usageCount: 1580, roles: ['orgAdmin', 'superAdmin'], dependencies: [] },
  { id: 'structures', name: { fr: 'Gestion structures', en: 'Structure management', pt: 'Gestão de estruturas', ar: 'إدارة الهياكل' }, description: { fr: 'Gestion des établissements de santé et éducatifs', en: 'Health and educational facility management', pt: 'Gestão de estabelecimentos de saúde e educação', ar: 'إدارة المنشآت الصحية والتعليمية' }, icon: Building, category: 'admin', isEnabled: true, isCore: false, version: '1.5.0', usageCount: 342, roles: ['orgAdmin', 'program', 'superAdmin'], dependencies: [] },
  { id: 'settings', name: { fr: 'Paramètres', en: 'Settings', pt: 'Configurações', ar: 'الإعدادات' }, description: { fr: 'Configuration générale de la plateforme', en: 'General platform configuration', pt: 'Configuração geral da plataforma', ar: 'الإعدادات العامة للمنصة' }, icon: Settings, category: 'admin', isEnabled: true, isCore: true, version: '2.0.0', usageCount: 450, roles: ['orgAdmin', 'program', 'superAdmin'], dependencies: [] },
  // Analytics
  { id: 'reporting', name: { fr: 'Rapports & Statistiques', en: 'Reports & Statistics', pt: 'Relatórios & Estatísticas', ar: 'التقارير والإحصائيات' }, description: { fr: 'Tableaux de bord statistiques et génération de rapports', en: 'Statistical dashboards and report generation', pt: 'Painéis estatísticos e geração de relatórios', ar: 'لوحات المعلومات الإحصائية وإنشاء التقارير' }, icon: BarChart3, category: 'analytics', isEnabled: true, isCore: false, version: '1.8.0', usageCount: 3800, roles: ['orgAdmin', 'program', 'ministry'], dependencies: [] },
  { id: 'indicators', name: { fr: 'Indicateurs nationaux', en: 'National indicators', pt: 'Indicadores nacionais', ar: 'المؤشرات الوطنية' }, description: { fr: 'Suivi des indicateurs stratégiques nationaux', en: 'Monitoring of national strategic indicators', pt: 'Monitoramento de indicadores estratégicos nacionais', ar: 'متابعة المؤشرات الاستراتيجية الوطنية' }, icon: TrendingUp, category: 'analytics', isEnabled: true, isCore: false, version: '1.6.0', usageCount: 2100, roles: ['program', 'ministry'], dependencies: ['reporting'] },
  { id: 'mapping', name: { fr: 'Cartographie', en: 'Mapping', pt: 'Mapeamento', ar: 'الخرائط' }, description: { fr: 'Cartographie interactive des structures et couverture', en: 'Interactive mapping of structures and coverage', pt: 'Mapeamento interativo de estruturas e cobertura', ar: 'الخرائط التفاعلية للهياكل والتغطية' }, icon: MapPin, category: 'analytics', isEnabled: true, isCore: false, version: '1.3.0', usageCount: 1500, roles: ['program', 'ministry'], dependencies: ['structures'] },
  { id: 'export', name: { fr: 'Export de données', en: 'Data export', pt: 'Exportação de dados', ar: 'تصدير البيانات' }, description: { fr: 'Export des données en CSV, Excel, PDF et JSON', en: 'Data export in CSV, Excel, PDF and JSON', pt: 'Exportação de dados em CSV, Excel, PDF e JSON', ar: 'تصدير البيانات بصيغ CSV و Excel و PDF و JSON' }, icon: Database, category: 'analytics', isEnabled: true, isCore: false, version: '1.2.0', usageCount: 890, roles: ['orgAdmin', 'program', 'ministry'], dependencies: ['reporting'] },
];

const ModulesManagement: React.FC = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [modules, setModules] = useState<ModuleConfig[]>(initialModules);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null);
  const [showDepsWarning, setShowDepsWarning] = useState<{ module: ModuleConfig; dependents: string[] } | null>(null);

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

  const performToggle = (moduleId: string) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, isEnabled: !m.isEnabled } : m));
    setSelectedModule(prev => prev?.id === moduleId ? { ...prev, isEnabled: !prev.isEnabled } : prev);
    setShowDepsWarning(null);
    toast({ title: tt({ fr: 'Module mis à jour', en: 'Module updated', pt: 'Módulo atualizado', ar: 'تم تحديث الوحدة' }, lang) });
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
              <Card>
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
