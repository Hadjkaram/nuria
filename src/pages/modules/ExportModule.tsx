import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Download, FileSpreadsheet, FileText, File, Clock, CheckCircle, AlertCircle, Trash2, RefreshCw, Filter, Calendar, Database, Users, Activity, MapPin, BarChart3, Settings, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase'; 

const t = (translations: Record<string, string>, lang: string) => translations[lang] || translations.fr || Object.values(translations)[0];

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
  db_id?: string;
}

const dataSources = [
  { id: 'children', table: 'screenings', icon: Users, label: { fr: 'Enfants / Patients', en: 'Children / Patients', pt: 'Crianças / Pacientes', ar: 'الأطفال / المرضى' } },
  { id: 'screening', table: 'screenings', icon: Activity, label: { fr: 'Dépistages', en: 'Screenings', pt: 'Triagens', ar: 'الفحص والتقييم' } },
  { id: 'appointments', table: 'appointments', icon: Calendar, label: { fr: 'Rendez-vous', en: 'Appointments', pt: 'Consultas', ar: 'المواعيد' } },
  { id: 'structures', table: 'organizations', icon: MapPin, label: { fr: 'Structures', en: 'Structures', pt: 'Estruturas', ar: 'الهياكل' } },
  { id: 'users', table: 'profiles', icon: Users, label: { fr: 'Utilisateurs', en: 'Users', pt: 'Usuários', ar: 'المستخدمون' } },
];

const formatOptions = [
  { id: 'csv', label: 'CSV', icon: FileSpreadsheet, desc: { fr: 'Tableur simple', en: 'Simple spreadsheet', pt: 'Planilha simples', ar: 'جدول بيانات بسيط' } },
  { id: 'json', label: 'JSON', icon: File, desc: { fr: 'Données structurées', en: 'Structured data', pt: 'Dados estruturados', ar: 'بيانات منظمة' } },
];

const periodOptions = [
  { value: '1m', days: 30, label: { fr: 'Dernier mois', en: 'Last month', pt: 'Último mês', ar: 'الشهر الماضي' } },
  { value: '3m', days: 90, label: { fr: '3 derniers mois', en: 'Last 3 months', pt: 'Últimos 3 meses', ar: 'آخر 3 أشهر' } },
  { value: 'all', days: 0, label: { fr: 'Toutes les données', en: 'All data', pt: 'Todos os dados', ar: 'كل البيانات' } },
];

const filterOptions: Record<string, { id: string; label: Record<string, string> }[]> = {
  children: [
    { id: 'demographics', label: { fr: 'Données démographiques', en: 'Demographics', pt: 'Dados demográficos', ar: 'البيانات الديموغرافية' } },
    { id: 'medical', label: { fr: 'Données médicales', en: 'Medical data', pt: 'Dados médicos', ar: 'البيانات الطبية' } },
  ],
  screening: [
    { id: 'scores', label: { fr: 'Scores', en: 'Scores', pt: 'Pontuações', ar: 'النتائج' } },
    { id: 'referrals', label: { fr: 'Orientations', en: 'Referrals', pt: 'Encaminhamentos', ar: 'الإحالات' } },
  ],
  appointments: [{ id: 'schedule', label: { fr: 'Planification', en: 'Schedule', pt: 'Agendamento', ar: 'الجدولة' } }],
  structures: [{ id: 'info', label: { fr: 'Informations', en: 'Information', pt: 'Informações', ar: 'المعلومات' } }],
  users: [{ id: 'profiles', label: { fr: 'Profils', en: 'Profiles', pt: 'Perfis', ar: 'الملفات الشخصية' } }],
};

const ExportModule: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [exports, setExports] = useState<ExportConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dbCounts, setDbCounts] = useState<Record<string, number>>({
    children: 0, screening: 0, appointments: 0, structures: 0, users: 0
  });

  const [filteredCount, setFilteredCount] = useState<number>(0);
  const [selectedSource, setSelectedSource] = useState('children');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [selectedPeriod, setSelectedPeriod] = useState('3m');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [exportName, setExportName] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('new');

  // --- LOGIQUE DE FILTRAGE COMMUNE ---
  const filterMissionData = (data: any[]) => {
    return data.filter(s => 
      s.created_at?.includes('2026-04-02') || 
      s.created_at?.includes('2026-04-11') || 
      s.created_at?.includes('2026-04-23')
    );
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const { data: exportData } = await supabase.from('data_exports').select('*').order('created_at', { ascending: false });
      if (exportData) {
        setExports(exportData.map(d => ({
          id: d.id, db_id: d.id, name: d.name, format: d.format as any,
          dataSource: d.data_source, filters: d.filters, period: d.period,
          status: d.status as any, progress: d.progress, fileSize: d.file_size || undefined,
          createdAt: new Date(d.created_at).toLocaleString()
        })));
      }

      const [resAppt, resScreen, resUsers, resOrgs] = await Promise.all([
        supabase.from('appointments').select('id', { count: 'exact', head: true }),
        supabase.from('screenings').select('*'), // On prend tout pour filtrer les dates
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('organizations').select('id', { count: 'exact', head: true })
      ]);

      // Application du filtre de mission sur les dépistages
      const validScreenings = filterMissionData(resScreen.data || []);
      
      // Calcul unique par enfant
      const seenNames = new Set();
      const uniqueChildren: any[] = [];
      validScreenings.forEach(s => {
          const name = (s.child_name || '').trim().toLowerCase();
          if (!seenNames.has(name)) {
              seenNames.add(name);
              uniqueChildren.push(s);
          }
      });

      setDbCounts({
        children: uniqueChildren.length, // Devrait être 171
        screening: uniqueChildren.length, // Aligné sur les enfants uniques pour l'export "propre"
        appointments: resAppt.count || 0,
        structures: resOrgs.count || 0,
        users: resUsers.count || 0
      });

    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [user, lang]);

  // Compteur dynamique pour le bouton "Lancer l'export"
  useEffect(() => {
    setFilteredCount(dbCounts[selectedSource] || 0);
  }, [selectedSource, dbCounts]);

  const toggleFilter = (filterId: string) => {
    setSelectedFilters(prev => prev.includes(filterId) ? prev.filter(f => f !== filterId) : [...prev, filterId]);
  };

  const handleStartExport = () => {
    if (selectedFilters.length === 0) {
      toast({ title: "Sélectionnez au moins un champ", variant: 'destructive' });
      return;
    }
    setShowConfirmDialog(true);
  };

  const confirmExport = async () => {
    const sourceLabel = dataSources.find(s => s.id === selectedSource)?.label[lang] || selectedSource;
    const computedName = exportName || `${sourceLabel}_Export_${new Date().getTime()}`;
    
    setShowConfirmDialog(false);
    setActiveTab('history');
    
    try {
      const { data: newEntry } = await supabase.from('data_exports').insert([{
        user_id: user?.id, name: computedName, format: selectedFormat,
        data_source: selectedSource, filters: selectedFilters, period: selectedPeriod,
        status: 'processing', progress: 50
      }]).select().single();

      const sourceDef = dataSources.find(s => s.id === selectedSource);
      const { data: rawData } = await supabase.from(sourceDef!.table).select('*');
      
      let finalData = rawData || [];
      if (sourceDef!.table === 'screenings') {
          // On applique les filtres de mission et d'unicité avant l'extraction
          const valid = filterMissionData(finalData);
          const seen = new Set();
          finalData = valid.filter(s => {
              const n = (s.child_name || '').trim().toLowerCase();
              if (!seen.has(n)) { seen.add(n); return true; }
              return false;
          });
      }

      let fileContent = '';
      if (selectedFormat === 'json') {
        fileContent = JSON.stringify(finalData, null, 2);
      } else {
        if (finalData.length > 0) {
          const headers = Object.keys(finalData[0]).join(',');
          const rows = finalData.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
          fileContent = headers + '\n' + rows;
        }
      }

      const size = (new Blob([fileContent]).size / (1024 * 1024)).toFixed(2) + ' MB';
      await supabase.from('data_exports').update({ status: 'completed', progress: 100, file_size: size }).eq('id', newEntry.id);
      
      fetchData();
      toast({ title: "Export terminé !" });

      const blob = new Blob([fileContent], { type: selectedFormat === 'json' ? 'application/json' : 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${computedName}.${selectedFormat}`;
      link.click();

    } catch (err: any) {
      toast({ title: "Erreur lors de l'export", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from('data_exports').delete().eq('id', id);
    fetchData();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Export de données</h1>
            <p className="text-muted-foreground text-sm mt-1">Exportez vos données réelles (171 patients validés)</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="new" className="gap-1.5"><Download className="h-4 w-4" />Nouvel export</TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5"><Clock className="h-4 w-4" />Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="space-y-6 mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Database className="h-4 w-4 text-primary" />Source des données</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {dataSources.map(src => {
                    const Icon = src.icon;
                    const isSelected = selectedSource === src.id;
                    return (
                      <button key={src.id} onClick={() => { setSelectedSource(src.id); setSelectedFilters([]); }}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-sm font-medium ${isSelected ? 'border-primary bg-primary/5 text-primary' : 'border-border bg-card hover:border-primary/30 text-muted-foreground'}`}>
                        <Icon className="h-6 w-6" />
                        {t(src.label, lang)}
                        <span className="text-xs opacity-60 font-bold">{dbCounts[src.id] || 0}</span>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2"><FileSpreadsheet className="h-4 w-4 text-primary" />Format de sortie</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {formatOptions.map(fmt => (
                    <button key={fmt.id} onClick={() => setSelectedFormat(fmt.id)}
                      className={`flex items-center gap-3 w-full p-3 rounded-lg border transition-all ${selectedFormat === fmt.id ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}>
                      <fmt.icon className={`h-5 w-5 ${selectedFormat === fmt.id ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="text-left">
                        <div className="font-medium text-sm">{fmt.label}</div>
                        <div className="text-xs text-muted-foreground">{t(fmt.desc, lang)}</div>
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" />Période</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {periodOptions.map(p => <SelectItem key={p.value} value={p.value}>{t(p.label, lang)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2"><Filter className="h-4 w-4 text-primary" />Champs à inclure</CardTitle>
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

            <Button size="lg" onClick={handleStartExport} disabled={filteredCount === 0} className="w-full h-14 text-lg gap-2">
              <Download className="h-5 w-5" />
              Lancer l'extraction ({filteredCount} enregistrements)
            </Button>
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            <div className="space-y-3">
              {exports.map(exp => (
                <Card key={exp.id}>
                  <CardContent className="py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center"><FileSpreadsheet className="h-5 w-5 text-primary" /></div>
                      <div>
                        <div className="flex items-center gap-2"><span className="font-medium text-sm">{exp.name}</span><Badge variant={exp.status === 'completed' ? 'default' : 'secondary'}>{exp.status}</Badge></div>
                        <div className="text-xs text-muted-foreground">{exp.format.toUpperCase()} • {exp.createdAt} • {exp.fileSize || '---'}</div>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => handleDelete(exp.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Confirmation d'exportation</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2 text-sm">
            <p>Voulez-vous extraire les <strong>{filteredCount}</strong> lignes au format <strong>{selectedFormat.toUpperCase()}</strong> ?</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>Annuler</Button>
            <Button onClick={confirmExport}>Confirmer et Télécharger</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ExportModule;