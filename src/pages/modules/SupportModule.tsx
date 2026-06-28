import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Monitor, Search, Plus, CheckCircle2, Clock, AlertTriangle, XCircle,
  MessageSquare, Headphones, Server, Cpu, HardDrive, Wifi, Activity,
  RefreshCw, Eye, User, Calendar, ArrowUp, ArrowDown, Minus, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const labels: Record<string, Record<string, string>> = {
  title: { fr: 'Support & Monitoring', en: 'Support & Monitoring', pt: 'Suporte e Monitoramento', ar: 'الدعم والمراقبة' },
  subtitle: { fr: 'Centre de support technique et surveillance système', en: 'Technical support center and system monitoring', pt: 'Central de suporte técnico e monitoramento do sistema', ar: 'مركز الدعم الفني ومراقبة النظام' },
  tabTickets: { fr: 'Tickets', en: 'Tickets', pt: 'Tickets', ar: 'التذاكر' },
  tabMonitoring: { fr: 'Monitoring', en: 'Monitoring', pt: 'Monitoramento', ar: 'المراقبة' },
  tabPerformance: { fr: 'Performance', en: 'Performance', pt: 'Performance', ar: 'الأداء' },
  search: { fr: 'Rechercher...', en: 'Search...', pt: 'Pesquisar...', ar: 'بحث...' },
  newTicket: { fr: 'Nouveau ticket', en: 'New ticket', pt: 'Novo ticket', ar: 'تذكرة جديدة' },
  refresh: { fr: 'Actualiser', en: 'Refresh', pt: 'Atualizar', ar: 'تحديث' },
  open: { fr: 'Ouvert', en: 'Open', pt: 'Aberto', ar: 'مفتوح' },
  inProgress: { fr: 'En cours', en: 'In progress', pt: 'Em andamento', ar: 'قيد التقدم' },
  resolved: { fr: 'Résolu', en: 'Resolved', pt: 'Resolvido', ar: 'تم الحل' },
  closed: { fr: 'Fermé', en: 'Closed', pt: 'Fechado', ar: 'مغلق' },
  critical: { fr: 'Critique', en: 'Critical', pt: 'Crítico', ar: 'حرج' },
  high: { fr: 'Haute', en: 'High', pt: 'Alta', ar: 'عالية' },
  medium: { fr: 'Moyenne', en: 'Medium', pt: 'Média', ar: 'متوسطة' },
  low: { fr: 'Basse', en: 'Low', pt: 'Baixa', ar: 'منخفضة' },
  id: { fr: 'ID', en: 'ID', pt: 'ID', ar: 'المعرف' },
  subject: { fr: 'Sujet', en: 'Subject', pt: 'Assunto', ar: 'الموضوع' },
  priority: { fr: 'Priorité', en: 'Priority', pt: 'Prioridade', ar: 'الأولوية' },
  status: { fr: 'Statut', en: 'Status', pt: 'Status', ar: 'الحالة' },
  reporter: { fr: 'Rapporteur', en: 'Reporter', pt: 'Reportado por', ar: 'المُبلغ' },
  date: { fr: 'Date', en: 'Date', pt: 'Data', ar: 'التاريخ' },
  category: { fr: 'Catégorie', en: 'Category', pt: 'Categoria', ar: 'الفئة' },
  actions: { fr: 'Actions', en: 'Actions', pt: 'Ações', ar: 'الإجراءات' },
  totalTickets: { fr: 'Total tickets', en: 'Total tickets', pt: 'Total de tickets', ar: 'إجمالي التذاكر' },
  openTickets: { fr: 'Tickets ouverts', en: 'Open tickets', pt: 'Tickets abertos', ar: 'تذاكر مفتوحة' },
  avgResponse: { fr: 'Temps réponse moy.', en: 'Avg response time', pt: 'Tempo médio resposta', ar: 'متوسط وقت الاستجابة' },
  satisfaction: { fr: 'Satisfaction', en: 'Satisfaction', pt: 'Satisfação', ar: 'الرضا' },
  uptime: { fr: 'Disponibilité', en: 'Uptime', pt: 'Disponibilidade', ar: 'وقت التشغيل' },
  cpuUsage: { fr: 'Utilisation CPU', en: 'CPU Usage', pt: 'Uso de CPU', ar: 'استخدام المعالج' },
  memoryUsage: { fr: 'Utilisation mémoire', en: 'Memory Usage', pt: 'Uso de memória', ar: 'استخدام الذاكرة' },
  diskUsage: { fr: 'Utilisation disque', en: 'Disk Usage', pt: 'Uso de disco', ar: 'استخدام القرص' },
  networkLatency: { fr: 'Latence réseau', en: 'Network Latency', pt: 'Latência de rede', ar: 'زمن استجابة الشبكة' },
  dbConnections: { fr: 'Connexions DB', en: 'DB Connections', pt: 'Conexões DB', ar: 'اتصالات قاعدة البيانات' },
  activeUsers: { fr: 'Utilisateurs actifs', en: 'Active users', pt: 'Usuários ativos', ar: 'المستخدمون النشطون' },
  requestsPerMin: { fr: 'Requêtes/min', en: 'Requests/min', pt: 'Requisições/min', ar: 'طلبات/دقيقة' },
  description: { fr: 'Description', en: 'Description', pt: 'Descrição', ar: 'الوصف' },
  save: { fr: 'Créer', en: 'Create', pt: 'Criar', ar: 'إنشاء' },
  cancel: { fr: 'Annuler', en: 'Cancel', pt: 'Cancelar', ar: 'إلغاء' },
  healthy: { fr: 'Sain', en: 'Healthy', pt: 'Saudável', ar: 'سليم' },
  degraded: { fr: 'Dégradé', en: 'Degraded', pt: 'Degradado', ar: 'متدهور' },
  down: { fr: 'Hors service', en: 'Down', pt: 'Fora do ar', ar: 'معطل' },
};

type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
type Priority = 'critical' | 'high' | 'medium' | 'low';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  priority: Priority;
  status: TicketStatus;
  category: string;
  reporter: string;
  organization: string;
  date: string;
  lastUpdate: string;
}

interface ServiceStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  latency: number;
  icon: React.ReactNode;
}

const SupportModule: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const t = (key: string) => labels[key]?.[lang] || labels[key]?.['fr'] || key;

  const [tickets, setTickets] = useState<Ticket[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);

  const [newTicket, setNewTicket] = useState({ subject: '', priority: 'medium' as Priority, category: 'bug', description: '' });

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      if (!user) return;

      const { data, error } = await supabase.from('support_tickets').select('*').order('created_at', { ascending: false });
      
      if (error && error.code !== '42P01') throw error;

      if (data && data.length > 0) {
        const formatted: Ticket[] = data.map(tk => ({
          id: tk.id || `TK-${Math.floor(Math.random() * 1000)}`,
          subject: tk.subject || 'Sujet inconnu',
          description: tk.description || '',
          priority: (tk.priority || 'medium') as Priority,
          status: (tk.status || 'open') as TicketStatus,
          category: tk.category || 'bug',
          reporter: tk.reporter_name || 'Utilisateur',
          organization: tk.organization || '-',
          date: tk.created_at ? new Date(tk.created_at).toLocaleDateString() : '-',
          lastUpdate: tk.updated_at ? new Date(tk.updated_at).toLocaleString() : '-'
        }));
        setTickets(formatted);
      } else {
        setTickets([]); 
      }
    } catch (err: any) {
      // Ignorer l'erreur pour la demo
      setTickets([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [lang, user]);

  // --- 2. CRÉATION (AVEC UPDATE LOCAL SI DB MANQUANTE) ---
  const handleCreateTicket = async () => {
    if (!newTicket.subject.trim() || !newTicket.description.trim()) {
      toast({ title: "Attention", description: "Veuillez remplir le sujet et la description.", variant: "destructive" });
      return;
    }
    
    setIsSubmitting(true);
    const tkId = `TK-${Math.floor(100 + Math.random() * 900)}`;

    const payload = {
      id: tkId,
      subject: newTicket.subject,
      description: newTicket.description,
      priority: newTicket.priority,
      status: 'open',
      category: newTicket.category,
      reporter_id: user?.id,
      reporter_name: user?.firstName ? `${user.firstName} ${user.lastName}` : 'Utilisateur',
      organization: 'NURIA'
    };

    try {
      const { error } = await supabase.from('support_tickets').insert([payload]);
      
      if (error && error.code !== '42P01') throw error;
      
      // Update local (optimistic UI)
      setTickets(prev => [{
        id: payload.id, subject: payload.subject, description: payload.description,
        priority: payload.priority as Priority, status: payload.status as TicketStatus,
        category: payload.category, reporter: payload.reporter_name, organization: payload.organization,
        date: new Date().toLocaleDateString(), lastUpdate: new Date().toLocaleString()
      }, ...prev]);

      toast({ title: "Succès", description: "Votre ticket a été créé." });
      setNewTicket({ subject: '', priority: 'medium', category: 'bug', description: '' });
      setShowNewTicket(false);

    } catch (err: any) {
      toast({ title: "Erreur", description: err.message || "Impossible de créer le ticket.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const services: ServiceStatus[] = [
    { name: 'API Gateway', status: 'healthy', uptime: 99.98, latency: 45, icon: <Server className="h-5 w-5" /> },
    { name: 'Database', status: 'healthy', uptime: 99.95, latency: 12, icon: <HardDrive className="h-5 w-5" /> },
    { name: 'Auth Service', status: 'healthy', uptime: 99.99, latency: 30, icon: <CheckCircle2 className="h-5 w-5" /> },
    { name: 'File Storage', status: 'degraded', uptime: 98.5, latency: 250, icon: <HardDrive className="h-5 w-5" /> },
    { name: 'Email Service', status: 'healthy', uptime: 99.7, latency: 180, icon: <MessageSquare className="h-5 w-5" /> },
    { name: 'CDN', status: 'healthy', uptime: 99.99, latency: 8, icon: <Wifi className="h-5 w-5" /> },
  ];

  const performanceMetrics = [
    { label: t('cpuUsage'), value: 34, max: 100, unit: '%', icon: <Cpu className="h-5 w-5" />, trend: 'down' },
    { label: t('memoryUsage'), value: 62, max: 100, unit: '%', icon: <Activity className="h-5 w-5" />, trend: 'up' },
    { label: t('diskUsage'), value: 45, max: 100, unit: '%', icon: <HardDrive className="h-5 w-5" />, trend: 'stable' },
    { label: t('networkLatency'), value: 45, max: 500, unit: 'ms', icon: <Wifi className="h-5 w-5" />, trend: 'down' },
    { label: t('dbConnections'), value: 28, max: 100, unit: '', icon: <Server className="h-5 w-5" />, trend: 'stable' },
    { label: t('activeUsers'), value: 156, max: 500, unit: '', icon: <User className="h-5 w-5" />, trend: 'up' },
    { label: t('requestsPerMin'), value: 342, max: 1000, unit: '', icon: <Activity className="h-5 w-5" />, trend: 'up' },
  ];

  const filteredTickets = tickets.filter(ticket => {
    const matchSearch = searchTerm === '' ||
      ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.reporter.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    return matchSearch && matchStatus && matchPriority;
  });

  const priorityConfig: Record<Priority, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
    critical: { variant: 'destructive', icon: <XCircle className="h-3 w-3" /> },
    high: { variant: 'destructive', icon: <ArrowUp className="h-3 w-3" /> },
    medium: { variant: 'secondary', icon: <Minus className="h-3 w-3" /> },
    low: { variant: 'outline', icon: <ArrowDown className="h-3 w-3" /> },
  };

  const statusConfig: Record<TicketStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    open: { variant: 'destructive' },
    in_progress: { variant: 'secondary' },
    resolved: { variant: 'default' },
    closed: { variant: 'outline' },
  };

  const statusLabels: Record<TicketStatus, string> = {
    open: t('open'),
    in_progress: t('inProgress'),
    resolved: t('resolved'),
    closed: t('closed'),
  };

  const serviceStatusConfig: Record<string, { color: string; label: string }> = {
    healthy: { color: 'text-green-600', label: t('healthy') },
    degraded: { color: 'text-yellow-600', label: t('degraded') },
    down: { color: 'text-destructive', label: t('down') },
  };

  const trendIcon = (trend: string) => {
    if (trend === 'up') return <ArrowUp className="h-3 w-3 text-yellow-600" />;
    if (trend === 'down') return <ArrowDown className="h-3 w-3 text-green-600" />;
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Headphones className="h-7 w-7 text-primary" />
              {t('title')}
            </h1>
            <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={fetchTickets} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} /> {t('refresh')}
            </Button>
            <Button size="sm" onClick={() => setShowNewTicket(true)}>
              <Plus className="h-4 w-4 mr-1" /> {t('newTicket')}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <MessageSquare className="h-8 w-8 mx-auto text-primary mb-2" />
              <p className="text-2xl font-bold text-foreground">{isLoading ? '...' : tickets.length}</p>
              <p className="text-xs text-muted-foreground">{t('totalTickets')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto text-yellow-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">{isLoading ? '...' : tickets.filter(t => t.status === 'open').length}</p>
              <p className="text-xs text-muted-foreground">{t('openTickets')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-8 w-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">2.4h</p>
              <p className="text-xs text-muted-foreground">{t('avgResponse')}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-foreground">94%</p>
              <p className="text-xs text-muted-foreground">{t('satisfaction')}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="tickets">
          <TabsList>
            <TabsTrigger value="tickets">{t('tabTickets')}</TabsTrigger>
            <TabsTrigger value="monitoring">{t('tabMonitoring')}</TabsTrigger>
            <TabsTrigger value="performance">{t('tabPerformance')}</TabsTrigger>
          </TabsList>

          {/* Tickets Tab */}
          <TabsContent value="tickets">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input placeholder={t('search')} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-36"><SelectValue placeholder={t('status')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('status')} (All)</SelectItem>
                      <SelectItem value="open">{t('open')}</SelectItem>
                      <SelectItem value="in_progress">{t('inProgress')}</SelectItem>
                      <SelectItem value="resolved">{t('resolved')}</SelectItem>
                      <SelectItem value="closed">{t('closed')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterPriority} onValueChange={setFilterPriority}>
                    <SelectTrigger className="w-36"><SelectValue placeholder={t('priority')} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('priority')} (All)</SelectItem>
                      <SelectItem value="critical">{t('critical')}</SelectItem>
                      <SelectItem value="high">{t('high')}</SelectItem>
                      <SelectItem value="medium">{t('medium')}</SelectItem>
                      <SelectItem value="low">{t('low')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{t('id')}</TableHead>
                        <TableHead>{t('subject')}</TableHead>
                        <TableHead>{t('priority')}</TableHead>
                        <TableHead>{t('status')}</TableHead>
                        <TableHead>{t('category')}</TableHead>
                        <TableHead>{t('reporter')}</TableHead>
                        <TableHead>{t('date')}</TableHead>
                        <TableHead>{t('actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredTickets.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">Aucun ticket trouvé.</TableCell>
                        </TableRow>
                      ) : filteredTickets.map(ticket => (
                        <TableRow key={ticket.id} className="cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
                          <TableCell className="font-mono font-bold text-foreground">{ticket.id}</TableCell>
                          <TableCell className="text-foreground max-w-[200px] truncate">{ticket.subject}</TableCell>
                          <TableCell>
                            <Badge variant={priorityConfig[ticket.priority].variant} className="gap-1">
                              {priorityConfig[ticket.priority].icon}
                              {t(ticket.priority)}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusConfig[ticket.status].variant}>
                              {statusLabels[ticket.status]}
                            </Badge>
                          </TableCell>
                          <TableCell><Badge variant="outline">{ticket.category}</Badge></TableCell>
                          <TableCell className="text-sm text-muted-foreground">{ticket.reporter}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">{ticket.date}</TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monitoring Tab */}
          <TabsContent value="monitoring">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.map(service => (
                <Card key={service.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">{service.icon}</span>
                        <span className="font-semibold text-foreground">{service.name}</span>
                      </div>
                      <Badge variant={service.status === 'healthy' ? 'default' : service.status === 'degraded' ? 'secondary' : 'destructive'}>
                        {serviceStatusConfig[service.status].label}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('uptime')}</span>
                        <span className={`font-bold ${service.uptime >= 99.9 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {service.uptime}%
                        </span>
                      </div>
                      <Progress value={service.uptime} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{t('networkLatency')}</span>
                        <span className={`font-mono ${service.latency < 100 ? 'text-green-600' : 'text-yellow-600'}`}>
                          {service.latency}ms
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {performanceMetrics.map(metric => (
                <Card key={metric.label}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        {metric.icon}
                        <span className="text-sm font-medium">{metric.label}</span>
                      </div>
                      {trendIcon(metric.trend)}
                    </div>
                    <div className="flex items-end gap-1 mb-2">
                      <span className="text-3xl font-bold text-foreground">{metric.value}</span>
                      <span className="text-sm text-muted-foreground mb-1">{metric.unit}</span>
                    </div>
                    {metric.max <= 100 && <Progress value={metric.value} className="h-2" />}
                    {metric.max > 100 && <Progress value={(metric.value / metric.max) * 100} className="h-2" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* New Ticket Dialog */}
        <Dialog open={showNewTicket} onOpenChange={setShowNewTicket}>
          <DialogContent>
            <DialogHeader><DialogTitle>{t('newTicket')}</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>{t('subject')}</Label>
                <Input value={newTicket.subject} onChange={e => setNewTicket({...newTicket, subject: e.target.value})} />
              </div>
              <div>
                <Label>{t('priority')}</Label>
                <Select value={newTicket.priority} onValueChange={v => setNewTicket({...newTicket, priority: v as Priority})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">{t('critical')}</SelectItem>
                    <SelectItem value="high">{t('high')}</SelectItem>
                    <SelectItem value="medium">{t('medium')}</SelectItem>
                    <SelectItem value="low">{t('low')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('category')}</Label>
                <Select value={newTicket.category} onValueChange={v => setNewTicket({...newTicket, category: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="question">Question</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>{t('description')}</Label>
                <Textarea rows={4} value={newTicket.description} onChange={e => setNewTicket({...newTicket, description: e.target.value})} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewTicket(false)}>{t('cancel')}</Button>
              <Button onClick={handleCreateTicket} disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {t('save')}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Ticket Detail Dialog */}
        <Dialog open={!!selectedTicket} onOpenChange={(open) => !open && setSelectedTicket(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <span className="font-mono">{selectedTicket?.id}</span>
                {selectedTicket && <Badge variant={priorityConfig[selectedTicket.priority].variant}>{t(selectedTicket.priority)}</Badge>}
              </DialogTitle>
            </DialogHeader>
            {selectedTicket && (
              <div className="space-y-4">
                <div>
                  <p className="font-semibold text-foreground">{selectedTicket.subject}</p>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTicket.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{t('status')}</p>
                    <Badge variant={statusConfig[selectedTicket.status].variant}>{statusLabels[selectedTicket.status]}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('category')}</p>
                    <Badge variant="outline">{selectedTicket.category}</Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('reporter')}</p>
                    <p className="text-sm text-foreground">{selectedTicket.reporter}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{t('date')}</p>
                    <p className="text-sm text-foreground">{selectedTicket.date}</p>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default SupportModule;