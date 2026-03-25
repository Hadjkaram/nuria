import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download, FileSpreadsheet, FileText, File, Clock, CheckCircle, AlertCircle, Trash2, RefreshCw, Filter, Calendar, Database, Users, Activity, MapPin, BarChart3, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Lang = 'fr' | 'en' | 'pt' | 'ar';

const t = (translations: Record<Lang, string>, lang: Lang) => translations[lang] || translations.fr;

interface ExportConfig {
  id: string;
  name: string;
  format: 'csv' | 'excel' | 'pdf' | 'json';
  dataSource: string;
  filters: string[];
  period: string;
  status: 'ready' | 'processing' | 'completed' | 'error';
  progress: number;
  createdAt: string;
  fileSize?: string;
}

const dataSources = [
  { id: 'children', icon: Users, label: { fr: 'Enfants / Patients', en: 'Children / Patients', pt: 'Crianças / Pacientes', ar: 'الأطفال / المرضى' } },
  { id: 'screening', icon: Activity, label: { fr: 'Dépistages', en: 'Screenings', pt: 'Triagens', ar: 'الفحوصات' } },
  { id: 'appointments', icon: Calendar, label: { fr: 'Rendez-vous', en: 'Appointments', pt: 'Consultas', ar: 'المواعيد' } },
  { id: 'structures', icon: MapPin, label: { fr: 'Structures', en: 'Structures', pt: 'Estruturas', ar: 'الهياكل' } },
  { id: 'indicators', icon: BarChart3, label: { fr: 'Indicateurs', en: 'Indicators', pt: 'Indicadores', ar: 'المؤشرات' } },
  { id: 'users', icon: Users, label: { fr: 'Utilisateurs', en: 'Users', pt: 'Usuários', ar: 'المستخدمون' } },
];

const formatOptions = [
  { id: 'csv', label: 'CSV', icon: FileSpreadsheet, desc: { fr: 'Tableur simple', en: 'Simple spreadsheet', pt: 'Planilha simples', ar: 'جدول بيانات بسيط' } },
  { id: 'excel', label: 'Excel (.xlsx)', icon: FileSpreadsheet, desc: { fr: 'Microsoft Excel', en: 'Microsoft Excel', pt: 'Microsoft Excel', ar: 'مايكروسوفت إكسل' } },
  { id: 'pdf', label: 'PDF', icon: FileText, desc: { fr: 'Document formaté', en: 'Formatted document', pt: 'Documento formatado', ar: 'مستند منسق' } },
  { id: 'json', label: 'JSON', icon: File, desc: { fr: 'Données structurées', en: 'Structured data', pt: 'Dados estruturados', ar: 'بيانات منظمة' } },
];

const periodOptions = [
  { value: '1m', label: { fr: 'Dernier mois', en: 'Last month', pt: 'Último mês', ar: 'الشهر الماضي' } },
  { value: '3m', label: { fr: '3 derniers mois', en: 'Last 3 months', pt: 'Últimos 3 meses', ar: 'آخر 3 أشهر' } },
  { value: '6m', label: { fr: '6 derniers mois', en: 'Last 6 months', pt: 'Últimos 6 meses', ar: 'آخر 6 أشهر' } },
  { value: '1y', label: { fr: 'Dernière année', en: 'Last year', pt: 'Último ano', ar: 'السنة الماضية' } },
  { value: 'all', label: { fr: 'Toutes les données', en: 'All data', pt: 'Todos os dados', ar: 'كل البيانات' } },
];

const filterOptions: Record<string, { id: string; label: Record<Lang, string> }[]> = {
  children: [
    { id: 'demographics', label: { fr: 'Données démographiques', en: 'Demographics', pt: 'Dados demográficos', ar: 'البيانات الديموغرافية' } },
    { id: 'medical', label: { fr: 'Données médicales', en: 'Medical data', pt: 'Dados médicos', ar: 'البيانات الطبية' } },
    { id: 'screening_results', label: { fr: 'Résultats dépistage', en: 'Screening results', pt: 'Resultados de triagem', ar: 'نتائج الفحص' } },
    { id: 'care_plans', label: { fr: 'Plans de soins', en: 'Care plans', pt: 'Planos de cuidado', ar: 'خطط الرعاية' } },
  ],
  screening: [
    { id: 'scores', label: { fr: 'Scores', en: 'Scores', pt: 'Pontuações', ar: 'النتائج' } },
    { id: 'tools', label: { fr: 'Outils utilisés', en: 'Tools used', pt: 'Ferramentas utilizadas', ar: 'الأدوات المستخدمة' } },
    { id: 'referrals', label: { fr: 'Orientations', en: 'Referrals', pt: 'Encaminhamentos', ar: 'الإحالات' } },
  ],
  appointments: [
    { id: 'schedule', label: { fr: 'Planification', en: 'Schedule', pt: 'Agendamento', ar: 'الجدولة' } },
    { id: 'attendance', label: { fr: 'Présences', en: 'Attendance', pt: 'Presenças', ar: 'الحضور' } },
    { id: 'notes', label: { fr: 'Notes cliniques', en: 'Clinical notes', pt: 'Notas clínicas', ar: 'الملاحظات السريرية' } },
  ],
  structures: [
    { id: 'info', label: { fr: 'Informations', en: 'Information', pt: 'Informações', ar: 'المعلومات' } },
    { id: 'staff', label: { fr: 'Personnel', en: 'Staff', pt: 'Equipe', ar: 'الموظفون' } },
    { id: 'capacity', label: { fr: 'Capacité', en: 'Capacity', pt: 'Capacidade', ar: 'السعة' } },
  ],
  indicators: [
    { id: 'kpi', label: { fr: 'KPIs', en: 'KPIs', pt: 'KPIs', ar: 'مؤشرات الأداء' } },
    { id: 'trends', label: { fr: 'Tendances', en: 'Trends', pt: 'Tendências', ar: 'الاتجاهات' } },
    { id: 'regional', label: { fr: 'Par région', en: 'By region', pt: 'Por região', ar: 'حسب المنطقة' } },
  ],
  users: [
    { id: 'profiles', label: { fr: 'Profils', en: 'Profiles', pt: 'Perfis', ar: 'الملفات الشخصية' } },
    { id: 'roles', label: { fr: 'Rôles', en: 'Roles', pt: 'Funções', ar: 'الأدوار' } },
    { id: 'activity_log', label: { fr: 'Journal d\'activité', en: 'Activity log', pt: 'Log de atividades', ar: 'سجل النشاط' } },
  ],
};

const initialExports: ExportConfig[] = [
  { id: '1', name: 'Export Enfants - Mars 2026', format: 'excel', dataSource: 'children', filters: ['demographics', 'medical'], period: '1m', status: 'completed', progress: 100, createdAt: '2026-03-09 14:30', fileSize: '2.4 MB' },
  { id: '2', name: 'Indicateurs Q1 2026', format: 'pdf', dataSource: 'indicators', filters: ['kpi', 'trends'], period: '3m', status: 'completed', progress: 100, createdAt: '2026-03-08 09:15', fileSize: '1.1 MB' },
  { id: '3', name: 'Dépistages Février', format: 'csv', dataSource: 'screening', filters: ['scores', 'referrals'], period: '1m', status: 'processing', progress: 67, createdAt: '2026-03-10 08:00' },
  { id: '4', name: 'Structures nationales', format: 'json', dataSource: 'structures', filters: ['info', 'capacity'], period: 'all', status: 'error', progress: 0, createdAt: '2026-03-07 16:45' },
];

const ExportModule: React.FC = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();

  const [exports, setExports] = useState<ExportConfig[]>(initialExports);
  const [selectedSource, setSelectedSource] = useState('children');
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [selectedPeriod, setSelectedPeriod] = useState('3m');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [exportName, setExportName] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('new');

  const labels = {
    title: { fr: 'Export de données', en: 'Data Export', pt: 'Exportação de dados', ar: 'تصدير البيانات' },
    newExport: { fr: 'Nouvel export', en: 'New export', pt: 'Nova exportação', ar: 'تصدير جديد' },
    history: { fr: 'Historique', en: 'History', pt: 'Histórico', ar: 'السجل' },
    templates: { fr: 'Modèles', en: 'Templates', pt: 'Modelos', ar: 'القوالب' },
    selectSource: { fr: 'Source des données', en: 'Data source', pt: 'Fonte dos dados', ar: 'مصدر البيانات' },
    selectFormat: { fr: 'Format de sortie', en: 'Output format', pt: 'Formato de saída', ar: 'تنسيق الإخراج' },
    selectPeriod: { fr: 'Période', en: 'Period', pt: 'Período', ar: 'الفترة' },
    selectFields: { fr: 'Champs à inclure', en: 'Fields to include', pt: 'Campos a incluir', ar: 'الحقول المضمنة' },
    exportName: { fr: 'Nom de l\'export', en: 'Export name', pt: 'Nome da exportação', ar: 'اسم التصدير' },
    startExport: { fr: 'Lancer l\'export', en: 'Start export', pt: 'Iniciar exportação', ar: 'بدء التصدير' },
    download: { fr: 'Télécharger', en: 'Download', pt: 'Baixar', ar: 'تحميل' },
    retry: { fr: 'Réessayer', en: 'Retry', pt: 'Tentar novamente', ar: 'إعادة المحاولة' },
    delete: { fr: 'Supprimer', en: 'Delete', pt: 'Excluir', ar: 'حذف' },
    processing: { fr: 'En cours...', en: 'Processing...', pt: 'Processando...', ar: 'جاري المعالجة...' },
    completed: { fr: 'Terminé', en: 'Completed', pt: 'Concluído', ar: 'مكتمل' },
    error: { fr: 'Erreur', en: 'Error', pt: 'Erro', ar: 'خطأ' },
    ready: { fr: 'Prêt', en: 'Ready', pt: 'Pronto', ar: 'جاهز' },
    confirmTitle: { fr: 'Confirmer l\'export', en: 'Confirm export', pt: 'Confirmar exportação', ar: 'تأكيد التصدير' },
    confirmDesc: { fr: 'Voulez-vous lancer cet export ?', en: 'Do you want to start this export?', pt: 'Deseja iniciar esta exportação?', ar: 'هل تريد بدء هذا التصدير؟' },
    confirm: { fr: 'Confirmer', en: 'Confirm', pt: 'Confirmar', ar: 'تأكيد' },
    cancel: { fr: 'Annuler', en: 'Cancel', pt: 'Cancelar', ar: 'إلغاء' },
    noExports: { fr: 'Aucun export récent', en: 'No recent exports', pt: 'Nenhuma exportação recente', ar: 'لا توجد عمليات تصدير حديثة' },
    selectAll: { fr: 'Tout sélectionner', en: 'Select all', pt: 'Selecionar tudo', ar: 'تحديد الكل' },
    records: { fr: 'enregistrements estimés', en: 'estimated records', pt: 'registros estimados', ar: 'سجلات مقدرة' },
    quickExport: { fr: 'Export rapide', en: 'Quick export', pt: 'Exportação rápida', ar: 'تصدير سريع' },
    customExport: { fr: 'Export personnalisé', en: 'Custom export', pt: 'Exportação personalizada', ar: 'تصدير مخصص' },
  };

  const estimatedRecords: Record<string, number> = {
    children: 12450, screening: 8320, appointments: 15680,
    structures: 342, indicators: 2100, users: 1580,
  };

  const templateExports = [
    { name: { fr: 'Rapport mensuel complet', en: 'Full monthly report', pt: 'Relatório mensal completo', ar: 'تقرير شهري كامل' }, source: 'indicators', format: 'pdf', period: '1m', filters: ['kpi', 'trends', 'regional'] },
    { name: { fr: 'Liste des enfants actifs', en: 'Active children list', pt: 'Lista de crianças ativas', ar: 'قائمة الأطفال النشطين' }, source: 'children', format: 'excel', period: 'all', filters: ['demographics', 'medical'] },
    { name: { fr: 'Données dépistage trimestriel', en: 'Quarterly screening data', pt: 'Dados trimestrais de triagem', ar: 'بيانات الفحص الفصلية' }, source: 'screening', format: 'csv', period: '3m', filters: ['scores', 'tools', 'referrals'] },
    { name: { fr: 'Annuaire des structures', en: 'Structures directory', pt: 'Diretório de estruturas', ar: 'دليل الهياكل' }, source: 'structures', format: 'excel', period: 'all', filters: ['info', 'staff', 'capacity'] },
  ];

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev =>
      prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]
    );
  };

  const selectAllFilters = () => {
    const available = filterOptions[selectedSource]?.map(f => f.id) || [];
    setSelectedFilters(prev =>
      prev.length === available.length ? [] : available
    );
  };

  const handleStartExport = () => {
    if (selectedFilters.length === 0) {
      toast({ title: t({ fr: 'Sélectionnez au moins un champ', en: 'Select at least one field', pt: 'Selecione pelo menos um campo', ar: 'حدد حقلاً واحداً على الأقل' }, lang), variant: 'destructive' });
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmExport = () => {
    const sourceLabel = dataSources.find(s => s.id === selectedSource)?.label[lang] || selectedSource;
    const newExport: ExportConfig = {
      id: Date.now().toString(),
      name: exportName || `${sourceLabel} - ${new Date().toLocaleDateString(lang === 'ar' ? 'ar-SA' : lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'fr-FR')}`,
      format: selectedFormat as ExportConfig['format'],
      dataSource: selectedSource,
      filters: [...selectedFilters],
      period: selectedPeriod,
      status: 'processing',
      progress: 0,
      createdAt: new Date().toLocaleString(lang === 'ar' ? 'ar-SA' : lang === 'pt' ? 'pt-BR' : lang === 'en' ? 'en-US' : 'fr-FR'),
    };

    setExports(prev => [newExport, ...prev]);
    setShowConfirmDialog(false);
    setActiveTab('history');
    setExportName('');
    setSelectedFilters([]);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setExports(prev => prev.map(e => e.id === newExport.id ? { ...e, status: 'completed', progress: 100, fileSize: `${(Math.random() * 4 + 0.5).toFixed(1)} MB` } : e));
        toast({ title: t({ fr: 'Export terminé !', en: 'Export completed!', pt: 'Exportação concluída!', ar: 'اكتمل التصدير!' }, lang) });
      }
      setExports(prev => prev.map(e => e.id === newExport.id && e.status === 'processing' ? { ...e, progress: Math.min(progress, 99) } : e));
    }, 800);
  };

  const handleDelete = (id: string) => {
    setExports(prev => prev.filter(e => e.id !== id));
    toast({ title: t({ fr: 'Export supprimé', en: 'Export deleted', pt: 'Exportação excluída', ar: 'تم حذف التصدير' }, lang) });
  };

  const handleRetry = (id: string) => {
    setExports(prev => prev.map(e => e.id === id ? { ...e, status: 'processing', progress: 0 } : e));
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 30;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setExports(prev => prev.map(e => e.id === id ? { ...e, status: 'completed', progress: 100, fileSize: `${(Math.random() * 4 + 0.5).toFixed(1)} MB` } : e));
        toast({ title: t({ fr: 'Export terminé !', en: 'Export completed!', pt: 'Exportação concluída!', ar: 'اكتمل التصدير!' }, lang) });
      }
      setExports(prev => prev.map(e => e.id === id && e.status === 'processing' ? { ...e, progress: Math.min(progress, 99) } : e));
    }, 600);
  };

  const handleDownload = (exp: ExportConfig) => {
    toast({ title: t({ fr: `Téléchargement de "${exp.name}"`, en: `Downloading "${exp.name}"`, pt: `Baixando "${exp.name}"`, ar: `جاري تحميل "${exp.name}"` }, lang) });
  };

  const handleTemplateExport = (template: typeof templateExports[0]) => {
    setSelectedSource(template.source);
    setSelectedFormat(template.format);
    setSelectedPeriod(template.period);
    setSelectedFilters(template.filters);
    setExportName(template.name[lang]);
    setActiveTab('new');
    toast({ title: t({ fr: 'Modèle chargé', en: 'Template loaded', pt: 'Modelo carregado', ar: 'تم تحميل القالب' }, lang) });
  };

  const getStatusBadge = (status: ExportConfig['status']) => {
    const config = {
      ready: { variant: 'outline' as const, icon: Clock, label: t(labels.ready, lang) },
      processing: { variant: 'secondary' as const, icon: RefreshCw, label: t(labels.processing, lang) },
      completed: { variant: 'default' as const, icon: CheckCircle, label: t(labels.completed, lang) },
      error: { variant: 'destructive' as const, icon: AlertCircle, label: t(labels.error, lang) },
    };
    const c = config[status];
    return (
      <Badge variant={c.variant} className="gap-1">
        <c.icon className={`h-3 w-3 ${status === 'processing' ? 'animate-spin' : ''}`} />
        {c.label}
      </Badge>
    );
  };

  const getFormatIcon = (format: string) => {
    const f = formatOptions.find(fo => fo.id === format);
    return f ? f.icon : File;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{t(labels.title, lang)}</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {t({ fr: 'Exportez vos données dans différents formats', en: 'Export your data in various formats', pt: 'Exporte seus dados em vários formatos', ar: 'صدّر بياناتك بتنسيقات مختلفة' }, lang)}
            </p>
          </div>
          <Badge variant="outline" className="gap-1">
            <Database className="h-3.5 w-3.5" />
            {exports.filter(e => e.status === 'completed').length} {t({ fr: 'exports disponibles', en: 'exports available', pt: 'exportações disponíveis', ar: 'عمليات تصدير متاحة' }, lang)}
          </Badge>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="new" className="gap-1.5"><Download className="h-4 w-4" />{t(labels.newExport, lang)}</TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5"><Clock className="h-4 w-4" />{t(labels.history, lang)}</TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5"><Settings className="h-4 w-4" />{t(labels.templates, lang)}</TabsTrigger>
          </TabsList>

          {/* NEW EXPORT */}
          <TabsContent value="new" className="space-y-6 mt-4">
            {/* Data Source */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4 text-primary" />{t(labels.selectSource, lang)}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {dataSources.map(src => {
                    const Icon = src.icon;
                    const isSelected = selectedSource === src.id;
                    return (
                      <button key={src.id} onClick={() => { setSelectedSource(src.id); setSelectedFilters([]); }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium ${isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:border-primary/30 text-muted-foreground hover:text-foreground'}`}>
                        <Icon className="h-6 w-6" />
                        {t(src.label, lang)}
                        <span className="text-xs opacity-60">{estimatedRecords[src.id]?.toLocaleString()}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Format */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-primary" />{t(labels.selectFormat, lang)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {formatOptions.map(fmt => {
                    const Icon = fmt.icon;
                    const isSelected = selectedFormat === fmt.id;
                    return (
                      <button key={fmt.id} onClick={() => setSelectedFormat(fmt.id)}
                        className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                        <Icon className={`h-5 w-5 ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div className="text-left">
                          <div className="font-medium text-sm">{fmt.label}</div>
                          <div className="text-xs text-muted-foreground">{t(fmt.desc, lang)}</div>
                        </div>
                      </button>
                    );
                  })}
                </CardContent>
              </Card>

              {/* Period + Fields */}
              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />{t(labels.selectPeriod, lang)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {periodOptions.map(p => <SelectItem key={p.value} value={p.value}>{t(p.label, lang)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-2">~{estimatedRecords[selectedSource]?.toLocaleString()} {t(labels.records, lang)}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2"><Filter className="h-4 w-4 text-primary" />{t(labels.selectFields, lang)}</CardTitle>
                      <Button variant="ghost" size="sm" onClick={selectAllFilters} className="text-xs h-7">{t(labels.selectAll, lang)}</Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {filterOptions[selectedSource]?.map(filter => (
                      <div key={filter.id} className="flex items-center gap-2">
                        <Checkbox id={filter.id} checked={selectedFilters.includes(filter.id)} onCheckedChange={() => toggleFilter(filter.id)} />
                        <Label htmlFor={filter.id} className="text-sm cursor-pointer">{t(filter.label, lang)}</Label>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Export name + action */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="flex-1 w-full">
                    <Label className="text-sm mb-1.5 block">{t(labels.exportName, lang)}</Label>
                    <input
                      type="text"
                      value={exportName}
                      onChange={e => setExportName(e.target.value)}
                      placeholder={t({ fr: 'Nom optionnel...', en: 'Optional name...', pt: 'Nome opcional...', ar: 'اسم اختياري...' }, lang)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <Button size="lg" onClick={handleStartExport} className="gap-2 shrink-0">
                    <Download className="h-4 w-4" />
                    {t(labels.startExport, lang)}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* HISTORY */}
          <TabsContent value="history" className="mt-4">
            {exports.length === 0 ? (
              <Card><CardContent className="py-12 text-center text-muted-foreground">{t(labels.noExports, lang)}</CardContent></Card>
            ) : (
              <div className="space-y-3">
                {exports.map(exp => {
                  const FormatIcon = getFormatIcon(exp.format);
                  return (
                    <Card key={exp.id}>
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FormatIcon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-sm truncate">{exp.name}</span>
                              {getStatusBadge(exp.status)}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <span>{exp.format.toUpperCase()}</span>
                              <span>•</span>
                              <span>{exp.createdAt}</span>
                              {exp.fileSize && <><span>•</span><span>{exp.fileSize}</span></>}
                            </div>
                            {exp.status === 'processing' && (
                              <Progress value={exp.progress} className="h-1.5 mt-2" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {exp.status === 'completed' && (
                              <Button size="sm" variant="default" className="gap-1" onClick={() => handleDownload(exp)}>
                                <Download className="h-3.5 w-3.5" />{t(labels.download, lang)}
                              </Button>
                            )}
                            {exp.status === 'error' && (
                              <Button size="sm" variant="outline" className="gap-1" onClick={() => handleRetry(exp.id)}>
                                <RefreshCw className="h-3.5 w-3.5" />{t(labels.retry, lang)}
                              </Button>
                            )}
                            <Button size="sm" variant="ghost" onClick={() => handleDelete(exp.id)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* TEMPLATES */}
          <TabsContent value="templates" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {templateExports.map((tpl, i) => {
                const Icon = getFormatIcon(tpl.format);
                return (
                  <Card key={i} className="hover:border-primary/30 transition-colors cursor-pointer" onClick={() => handleTemplateExport(tpl)}>
                    <CardContent className="py-5">
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium text-sm">{t(tpl.name, lang)}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {tpl.format.toUpperCase()} • {t(periodOptions.find(p => p.value === tpl.period)?.label || { fr: '', en: '', pt: '', ar: '' }, lang)} • {tpl.filters.length} {t({ fr: 'champs', en: 'fields', pt: 'campos', ar: 'حقول' }, lang)}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t(labels.confirmTitle, lang)}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <p className="text-sm text-muted-foreground">{t(labels.confirmDesc, lang)}</p>
            <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{t(labels.selectSource, lang)}</span><span className="font-medium">{t(dataSources.find(s => s.id === selectedSource)?.label || { fr: '', en: '', pt: '', ar: '' }, lang)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t(labels.selectFormat, lang)}</span><span className="font-medium">{selectedFormat.toUpperCase()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t(labels.selectPeriod, lang)}</span><span className="font-medium">{t(periodOptions.find(p => p.value === selectedPeriod)?.label || { fr: '', en: '', pt: '', ar: '' }, lang)}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">{t(labels.selectFields, lang)}</span><span className="font-medium">{selectedFilters.length}</span></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>{t(labels.cancel, lang)}</Button>
            <Button onClick={confirmExport} className="gap-1"><Download className="h-4 w-4" />{t(labels.confirm, lang)}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ExportModule;
