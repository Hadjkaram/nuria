import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import {
  Database, Search, Download, RefreshCw, Shield, AlertTriangle, Info,
  CheckCircle2, XCircle, User, Clock, Filter, Eye, Activity,
  LogIn, LogOut, Edit, Trash2, Plus, Settings, FileText, Globe, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const labels: Record<string, Record<string, string>> = {
  title: { fr: 'Logs & Audit', en: 'Logs & Audit', pt: 'Logs e Auditoria', ar: 'السجلات والتدقيق' },
  subtitle: { fr: 'Surveillance des activités et journal d\'audit système', en: 'Activity monitoring and system audit trail', pt: 'Monitoramento de atividades e trilha de auditoria', ar: 'مراقبة الأنشطة وسجل التدقيق' },
  tabActivity: { fr: 'Activités', en: 'Activities', pt: 'Atividades', ar: 'الأنشطة' },
  tabSecurity: { fr: 'Sécurité', en: 'Security', pt: 'Segurança', ar: 'الأمان' },
  tabSystem: { fr: 'Système', en: 'System', pt: 'Sistema', ar: 'النظام' },
  search: { fr: 'Rechercher dans les logs...', en: 'Search logs...', pt: 'Pesquisar nos logs...', ar: 'البحث في السجلات...' },
  export: { fr: 'Exporter', en: 'Export', pt: 'Exportar', ar: 'تصدير' },
  refresh: { fr: 'Actualiser', en: 'Refresh', pt: 'Atualizar', ar: 'تحديث' },
  timestamp: { fr: 'Horodatage', en: 'Timestamp', pt: 'Data/Hora', ar: 'الوقت' },
  user: { fr: 'Utilisateur', en: 'User', pt: 'Usuário', ar: 'المستخدم' },
  action: { fr: 'Action', en: 'Action', pt: 'Ação', ar: 'الإجراء' },
  resource: { fr: 'Ressource', en: 'Resource', pt: 'Recurso', ar: 'المورد' },
  details: { fr: 'Détails', en: 'Details', pt: 'Detalhes', ar: 'التفاصيل' },
  severity: { fr: 'Sévérité', en: 'Severity', pt: 'Severidade', ar: 'الخطورة' },
  ip: { fr: 'Adresse IP', en: 'IP Address', pt: 'Endereço IP', ar: 'عنوان IP' },
  status: { fr: 'Statut', en: 'Status', pt: 'Status', ar: 'الحالة' },
  allActions: { fr: 'Toutes les actions', en: 'All actions', pt: 'Todas as ações', ar: 'كل الإجراءات' },
  allUsers: { fr: 'Tous les utilisateurs', en: 'All users', pt: 'Todos os usuários', ar: 'كل المستخدمين' },
  totalEvents: { fr: 'Événements totaux', en: 'Total events', pt: 'Eventos totais', ar: 'إجمالي الأحداث' },
  securityAlerts: { fr: 'Alertes sécurité', en: 'Security alerts', pt: 'Alertas de segurança', ar: 'تنبيهات الأمان' },
  loginAttempts: { fr: 'Tentatives connexion', en: 'Login attempts', pt: 'Tentativas de login', ar: 'محاولات الدخول' },
  errors: { fr: 'Erreurs', en: 'Errors', pt: 'Erros', ar: 'الأخطاء' },
  success: { fr: 'Succès', en: 'Success', pt: 'Sucesso', ar: 'نجاح' },
  warning: { fr: 'Avertissement', en: 'Warning', pt: 'Aviso', ar: 'تحذير' },
  error: { fr: 'Erreur', en: 'Error', pt: 'Erro', ar: 'خطأ' },
  critical: { fr: 'Critique', en: 'Critical', pt: 'Crítico', ar: 'حرج' },
  info: { fr: 'Info', en: 'Info', pt: 'Info', ar: 'معلومة' },
};

type Severity = 'info' | 'success' | 'warning' | 'error' | 'critical';
type ActionType = 'login' | 'logout' | 'create' | 'update' | 'delete' | 'view' | 'export' | 'config';

interface LogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: string;
  action: ActionType;
  resource: string;
  details: string;
  severity: Severity;
  ip: string;
  status: 'success' | 'failure';
  category: 'activity' | 'security' | 'system';
}

const actionIcons: Record<string, React.ReactNode> = {
  login: <LogIn className="h-4 w-4" />,
  logout: <LogOut className="h-4 w-4" />,
  create: <Plus className="h-4 w-4" />,
  update: <Edit className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  view: <Eye className="h-4 w-4" />,
  export: <Download className="h-4 w-4" />,
  config: <Settings className="h-4 w-4" />,
};

const severityConfig: Record<Severity, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
  info: { variant: 'outline', icon: <Info className="h-3 w-3" /> },
  success: { variant: 'default', icon: <CheckCircle2 className="h-3 w-3" /> },
  warning: { variant: 'secondary', icon: <AlertTriangle className="h-3 w-3" /> },
  error: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
  critical: { variant: 'destructive', icon: <Shield className="h-3 w-3" /> },
};

const LogsModule: React.FC = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.['fr'] || key;

  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- 1. LECTURE DEPUIS SUPABASE (GÉNÉRATION DYNAMIQUE) ---
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      // On essaie d'abord la table des logs
      const { data, error } = await supabase.from('system_logs').select('*').order('timestamp', { ascending: false }).limit(500);

      if (data && data.length > 0 && !error) {
        const formattedLogs: LogEntry[] = data.map((d: any) => ({
          id: d.id, timestamp: new Date(d.timestamp).toLocaleString(), user: d.user_name, role: d.role, action: d.action as ActionType,
          resource: d.resource, details: d.details, severity: d.severity as Severity, ip: d.ip || '0.0.0.0', status: d.status as 'success' | 'failure',
          category: d.category as 'activity' | 'security' | 'system'
        }));
        setLogs(formattedLogs);
      } else {
        // --- LOGIQUE INTELLIGENTE : On crée les logs à partir des vraies actions des autres tables ---
        const [profilesRes, screeningsRes] = await Promise.all([
          supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(100),
          supabase.from('screenings').select('*').order('created_at', { ascending: false }).limit(100)
        ]);

        const virtualLogs: LogEntry[] = [];

        // 1. Logs de sécurité (Nouveaux comptes créés)
        if (profilesRes.data) {
          profilesRes.data.forEach((p: any) => {
            if (p.created_at) {
              virtualLogs.push({
                id: `log-sec-${p.id}`, timestamp: new Date(p.created_at).toLocaleString(),
                user: p.first_name ? `${p.first_name} ${p.last_name || ''}` : 'Système',
                role: p.role || 'admin', action: 'create', resource: 'Profil Utilisateur',
                details: `Création du compte utilisateur pour le rôle : ${p.role}`,
                severity: 'info', ip: '127.0.0.1', status: 'success', category: 'security'
              });
            }
          });
        }

        // 2. Logs d'activité (Dépistages effectués)
        if (screeningsRes.data) {
          screeningsRes.data.forEach((s: any) => {
            if (s.created_at) {
              virtualLogs.push({
                id: `log-act-${s.id}`, timestamp: new Date(s.created_at).toLocaleString(),
                user: s.created_by || 'Agent Terrain', role: 'professional', action: 'create',
                resource: 'Dépistage NURIA', details: `Dépistage effectué pour l'enfant : ${s.child_name || 'Anonyme'} (Risque: ${s.risk_level})`,
                severity: 'success', ip: '127.0.0.1', status: 'success', category: 'activity'
              });
            }
          });
        }

        // Tri chronologique des logs virtuels créés
        virtualLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setLogs(virtualLogs);
      }
    } catch (err: any) {
      toast({ title: "Info", description: "Chargement de l'audit trail virtuel en cours.", variant: "default" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [lang]);

  const filterLogs = (category: string) => {
    return logs.filter(log => {
      const matchCategory = category === 'all' || log.category === category;
      const matchSearch = searchTerm === '' ||
        log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.resource.toLowerCase().includes(searchTerm.toLowerCase());
      const matchAction = filterAction === 'all' || log.action === filterAction;
      const matchSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
      return matchCategory && matchSearch && matchAction && matchSeverity;
    });
  };

  const stats = {
    total: logs.length,
    security: logs.filter(l => l.category === 'security').length,
    logins: logs.filter(l => l.action === 'login').length,
    errors: logs.filter(l => l.severity === 'error' || l.severity === 'critical').length,
  };

  const LogTable = ({ displayLogs }: { displayLogs: LogEntry[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{t('timestamp')}</TableHead>
          <TableHead>{t('severity')}</TableHead>
          <TableHead>{t('user')}</TableHead>
          <TableHead>{t('action')}</TableHead>
          <TableHead>{t('resource')}</TableHead>
          <TableHead>{t('status')}</TableHead>
          <TableHead>{t('details')}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {displayLogs.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">Aucun log trouvé.</TableCell>
          </TableRow>
        ) : displayLogs.map(log => (
          <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedLog(log)}>
            <TableCell className="font-mono text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</TableCell>
            <TableCell>
              <Badge variant={severityConfig[log.severity]?.variant || 'outline'} className="gap-1">
                {severityConfig[log.severity]?.icon}
                {t(log.severity)}
              </Badge>
            </TableCell>
            <TableCell className="text-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3 text-muted-foreground" />
                <span className="text-sm">{log.user}</span>
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-foreground">
                {actionIcons[log.action] || <Activity className="h-4 w-4" />}
                <span className="text-sm capitalize">{log.action}</span>
              </div>
            </TableCell>
            <TableCell className="text-sm text-foreground">{log.resource}</TableCell>
            <TableCell>
              {log.status === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
            </TableCell>
            <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{log.details}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Database className="h-7 w-7 text-primary" />
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchLogs} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> {t('refresh')}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> {t('export')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Activity className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">{t('totalEvents')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Shield className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.security}</p>
              <p className="text-xs text-muted-foreground">{t('securityAlerts')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <LogIn className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.logins}</p>
              <p className="text-xs text-muted-foreground">{t('loginAttempts')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <XCircle className="h-8 w-8 mx-auto text-destructive mb-2" />
              <p className="text-2xl font-bold text-foreground">{stats.errors}</p>
              <p className="text-xs text-muted-foreground">{t('errors')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center gap-2 flex-1">
                <Search className="h-4 w-4 text-muted-foreground" />
                <Input placeholder={t('search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
              <Select value={filterAction} onValueChange={setFilterAction}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('allActions')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('allActions')}</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="view">View</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="config">Config</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterSeverity} onValueChange={setFilterSeverity}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder={t('severity')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('severity')} (All)</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">{t('success')}</SelectItem>
                  <SelectItem value="warning">{t('warning')}</SelectItem>
                  <SelectItem value="error">{t('error')}</SelectItem>
                  <SelectItem value="critical">{t('critical')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <Tabs defaultValue="activity">
            <TabsList>
              <TabsTrigger value="activity">{t('tabActivity')}</TabsTrigger>
              <TabsTrigger value="security">{t('tabSecurity')}</TabsTrigger>
              <TabsTrigger value="system">{t('tabSystem')}</TabsTrigger>
            </TabsList>
            <TabsContent value="activity">
              <Card><CardContent className="p-0"><LogTable displayLogs={filterLogs('activity')} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="security">
              <Card><CardContent className="p-0"><LogTable displayLogs={filterLogs('security')} /></CardContent></Card>
            </TabsContent>
            <TabsContent value="system">
              <Card><CardContent className="p-0"><LogTable displayLogs={filterLogs('system')} /></CardContent></Card>
            </TabsContent>
          </Tabs>
        )}

        {/* Detail Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {selectedLog && (actionIcons[selectedLog.action] || <Activity className="h-4 w-4" />)}
                {t('details')}
              </DialogTitle>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('timestamp')}</p>
                    <p className="text-sm font-mono text-foreground">{selectedLog.timestamp}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('severity')}</p>
                    <Badge variant={severityConfig[selectedLog.severity]?.variant || 'outline'} className="gap-1">
                      {severityConfig[selectedLog.severity]?.icon} {t(selectedLog.severity)}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('user')}</p>
                    <p className="text-sm text-foreground">{selectedLog.user}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rôle</p>
                    <p className="text-sm text-foreground">{selectedLog.role}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('action')}</p>
                    <p className="text-sm text-foreground capitalize">{selectedLog.action}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('resource')}</p>
                    <p className="text-sm text-foreground">{selectedLog.resource}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('ip')}</p>
                    <p className="text-sm font-mono text-foreground">{selectedLog.ip}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('status')}</p>
                    <Badge variant={selectedLog.status === 'success' ? 'default' : 'destructive'}>
                      {selectedLog.status}
                    </Badge>
                  </div>
                </div>
                <Separator />
                <div>
                  <p className="text-xs text-muted-foreground mb-1">{t('details')}</p>
                  <p className="text-sm text-foreground bg-muted p-3 rounded-lg">{selectedLog.details}</p>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default LogsModule;