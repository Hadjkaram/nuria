import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  BarChart3, TrendingUp, TrendingDown, Calendar, Baby, FileText,
  Download, Eye, ChevronRight, CheckCircle2, AlertTriangle, Clock,
  Activity, Brain, MessageCircle, Hand, Footprints, Users
} from 'lucide-react';

interface ChildResult {
  id: string;
  childName: string;
  childAge: string;
  avatar: string;
  evaluations: Evaluation[];
}

interface Evaluation {
  id: string;
  name: string;
  date: string;
  status: 'normal' | 'warning' | 'alert';
  globalScore: number;
  maxScore: number;
  riskLevel: string;
  domains: Domain[];
  recommendations: string[];
}

interface Domain {
  name: string;
  score: number;
  maxScore: number;
  icon: React.ElementType;
  status: 'normal' | 'warning' | 'alert';
}

const mockChildren: ChildResult[] = [
  {
    id: '1',
    childName: 'Aminata Diallo',
    childAge: '3 ans 4 mois',
    avatar: 'AD',
    evaluations: [
      {
        id: 'e1',
        name: 'ASQ-3 (36 mois)',
        date: '2026-03-05',
        status: 'warning',
        globalScore: 72,
        maxScore: 100,
        riskLevel: 'Surveillance',
        domains: [
          { name: 'Communication', score: 45, maxScore: 60, icon: MessageCircle, status: 'normal' },
          { name: 'Motricité globale', score: 30, maxScore: 60, icon: Footprints, status: 'warning' },
          { name: 'Motricité fine', score: 50, maxScore: 60, icon: Hand, status: 'normal' },
          { name: 'Résolution problèmes', score: 25, maxScore: 60, icon: Brain, status: 'alert' },
          { name: 'Aptitudes individuelles', score: 40, maxScore: 60, icon: Users, status: 'normal' },
        ],
        recommendations: [
          'Consultation spécialisée recommandée pour la résolution de problèmes',
          'Exercices de motricité globale à intégrer au quotidien',
          'Réévaluation dans 3 mois',
        ],
      },
      {
        id: 'e2',
        name: 'M-CHAT-R/F',
        date: '2026-02-15',
        status: 'normal',
        globalScore: 88,
        maxScore: 100,
        riskLevel: 'Faible',
        domains: [
          { name: 'Attention conjointe', score: 18, maxScore: 20, icon: Eye, status: 'normal' },
          { name: 'Interaction sociale', score: 16, maxScore: 20, icon: Users, status: 'normal' },
          { name: 'Communication', score: 17, maxScore: 20, icon: MessageCircle, status: 'normal' },
          { name: 'Comportements', score: 14, maxScore: 20, icon: Activity, status: 'normal' },
        ],
        recommendations: [
          'Développement dans les normes attendues',
          'Continuer la stimulation quotidienne',
        ],
      },
    ],
  },
  {
    id: '2',
    childName: 'Moussa Konaté',
    childAge: '2 ans 1 mois',
    avatar: 'MK',
    evaluations: [
      {
        id: 'e3',
        name: 'ASQ-3 (24 mois)',
        date: '2026-03-01',
        status: 'alert',
        globalScore: 45,
        maxScore: 100,
        riskLevel: 'Élevé',
        domains: [
          { name: 'Communication', score: 15, maxScore: 60, icon: MessageCircle, status: 'alert' },
          { name: 'Motricité globale', score: 40, maxScore: 60, icon: Footprints, status: 'normal' },
          { name: 'Motricité fine', score: 20, maxScore: 60, icon: Hand, status: 'warning' },
          { name: 'Résolution problèmes', score: 18, maxScore: 60, icon: Brain, status: 'alert' },
          { name: 'Aptitudes individuelles', score: 22, maxScore: 60, icon: Users, status: 'warning' },
        ],
        recommendations: [
          'Orientation urgente vers un spécialiste du neurodéveloppement',
          'Bilan orthophonique recommandé',
          'Mise en place d\'un programme de stimulation précoce',
          'Suivi rapproché toutes les 6 semaines',
        ],
      },
    ],
  },
  {
    id: '3',
    childName: 'Fatou Sow',
    childAge: '4 ans 8 mois',
    avatar: 'FS',
    evaluations: [
      {
        id: 'e4',
        name: 'SNAP-IV (TDAH)',
        date: '2026-02-28',
        status: 'warning',
        globalScore: 62,
        maxScore: 100,
        riskLevel: 'Modéré',
        domains: [
          { name: 'Inattention', score: 14, maxScore: 27, icon: Eye, status: 'warning' },
          { name: 'Hyperactivité', score: 16, maxScore: 27, icon: Activity, status: 'warning' },
          { name: 'Impulsivité', score: 8, maxScore: 18, icon: Brain, status: 'normal' },
        ],
        recommendations: [
          'Observation en milieu scolaire recommandée',
          'Techniques de gestion de l\'attention à mettre en place',
          'Réévaluation dans 2 mois',
        ],
      },
      {
        id: 'e5',
        name: 'ASQ-3 (54 mois)',
        date: '2026-01-10',
        status: 'normal',
        globalScore: 91,
        maxScore: 100,
        riskLevel: 'Faible',
        domains: [
          { name: 'Communication', score: 55, maxScore: 60, icon: MessageCircle, status: 'normal' },
          { name: 'Motricité globale', score: 52, maxScore: 60, icon: Footprints, status: 'normal' },
          { name: 'Motricité fine', score: 48, maxScore: 60, icon: Hand, status: 'normal' },
          { name: 'Résolution problèmes', score: 50, maxScore: 60, icon: Brain, status: 'normal' },
          { name: 'Aptitudes individuelles', score: 54, maxScore: 60, icon: Users, status: 'normal' },
        ],
        recommendations: ['Développement harmonieux, continuer les activités d\'éveil'],
      },
    ],
  },
];

const statusConfig = {
  normal: { label: 'Normal', color: 'text-secondary', bg: 'bg-secondary/10', icon: CheckCircle2 },
  warning: { label: 'Surveillance', color: 'text-accent', bg: 'bg-accent/10', icon: Clock },
  alert: { label: 'Alerte', color: 'text-destructive', bg: 'bg-destructive/10', icon: AlertTriangle },
};

const ResultsModule: React.FC = () => {
  const { t } = useLanguage();
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [selectedEval, setSelectedEval] = useState<string | null>(null);

  const child = mockChildren.find(c => c.id === selectedChild);
  const evaluation = child?.evaluations.find(e => e.id === selectedEval);

  // Stats
  const totalEvals = mockChildren.reduce((a, c) => a + c.evaluations.length, 0);
  const alertCount = mockChildren.reduce((a, c) => a + c.evaluations.filter(e => e.status === 'alert').length, 0);
  const warningCount = mockChildren.reduce((a, c) => a + c.evaluations.filter(e => e.status === 'warning').length, 0);
  const normalCount = totalEvals - alertCount - warningCount;

  // Detail view for a single evaluation
  if (evaluation && child) {
    const sc = statusConfig[evaluation.status];
    const StatusIcon = sc.icon;
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => setSelectedEval(null)}>
            ← Retour aux évaluations
          </Button>

          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {child.avatar}
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">{evaluation.name}</h1>
              <p className="text-muted-foreground">{child.childName} · {child.childAge} · {new Date(evaluation.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${sc.bg} ${sc.color} font-semibold`}>
              <StatusIcon className="h-5 w-5" />
              {evaluation.riskLevel}
            </div>
          </div>

          {/* Global score */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-muted-foreground">Score global</span>
                <span className="text-2xl font-bold">{evaluation.globalScore}%</span>
              </div>
              <Progress value={evaluation.globalScore} className="h-3" />
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </CardContent>
          </Card>

          {/* Domains */}
          <h2 className="text-lg font-semibold mb-4">Résultats par domaine</h2>
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            {evaluation.domains.map(d => {
              const ds = statusConfig[d.status];
              const DIcon = d.icon;
              const pct = Math.round((d.score / d.maxScore) * 100);
              return (
                <Card key={d.name} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`h-10 w-10 rounded-lg ${ds.bg} flex items-center justify-center`}>
                        <DIcon className={`h-5 w-5 ${ds.color}`} />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{d.name}</p>
                        <p className="text-xs text-muted-foreground">{d.score}/{d.maxScore}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ds.bg} ${ds.color}`}>{ds.label}</span>
                    </div>
                    <Progress value={pct} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Recommendations */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Recommandations</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {evaluation.recommendations.map((r, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0 mt-0.5">
                    {i + 1}
                  </div>
                  <p className="text-sm">{r}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button className="flex-1 gap-2"><Download className="h-4 w-4" /> Télécharger le rapport</Button>
            <Button variant="outline" className="flex-1 gap-2"><FileText className="h-4 w-4" /> Partager avec un professionnel</Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Child evaluations list
  if (child) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto">
          <Button variant="ghost" className="mb-4" onClick={() => setSelectedChild(null)}>
            ← Retour aux enfants
          </Button>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
              {child.avatar}
            </div>
            <div>
              <h1 className="text-2xl font-bold">{child.childName}</h1>
              <p className="text-muted-foreground">{child.childAge}</p>
            </div>
          </div>

          <h2 className="font-semibold mb-4">Historique des évaluations ({child.evaluations.length})</h2>
          <div className="space-y-3">
            {child.evaluations.map(ev => {
              const sc = statusConfig[ev.status];
              const StatusIcon = sc.icon;
              return (
                <Card key={ev.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedEval(ev.id)}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`h-12 w-12 rounded-xl ${sc.bg} flex items-center justify-center`}>
                      <StatusIcon className={`h-6 w-6 ${sc.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{ev.name}</p>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(ev.date).toLocaleDateString('fr-FR')}</span>
                        <span>Score: {ev.globalScore}%</span>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-3 py-1.5 rounded-full ${sc.bg} ${sc.color}`}>{ev.riskLevel}</span>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Main overview
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">Résultats & Suivi</h1>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        {[
          { label: 'Total évaluations', value: totalEvals, icon: BarChart3, color: 'text-primary', bg: 'bg-primary/10' },
          { label: 'Résultats normaux', value: normalCount, icon: CheckCircle2, color: 'text-secondary', bg: 'bg-secondary/10' },
          { label: 'En surveillance', value: warningCount, icon: Clock, color: 'text-accent', bg: 'bg-accent/10' },
          { label: 'Alertes', value: alertCount, icon: AlertTriangle, color: 'text-destructive', bg: 'bg-destructive/10' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl ${s.bg} flex items-center justify-center`}>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Children list */}
      <Tabs defaultValue="all">
        <TabsList className="mb-4">
          <TabsTrigger value="all">Tous les enfants</TabsTrigger>
          <TabsTrigger value="alert">Alertes</TabsTrigger>
          <TabsTrigger value="warning">Surveillance</TabsTrigger>
          <TabsTrigger value="normal">Normaux</TabsTrigger>
        </TabsList>

        {['all', 'alert', 'warning', 'normal'].map(tab => (
          <TabsContent key={tab} value={tab}>
            <div className="space-y-3">
              {mockChildren
                .filter(c => tab === 'all' || c.evaluations.some(e => e.status === tab))
                .map(c => {
                  const latestEval = c.evaluations[0];
                  const sc = statusConfig[latestEval.status];
                  const StatusIcon = sc.icon;
                  return (
                    <Card key={c.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setSelectedChild(c.id)}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {c.avatar}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{c.childName}</p>
                          <p className="text-sm text-muted-foreground">{c.childAge} · {c.evaluations.length} évaluation(s)</p>
                        </div>
                        <div className="text-right mr-2">
                          <p className="text-sm font-medium">Dernier : {latestEval.name}</p>
                          <div className="flex items-center gap-1.5 justify-end">
                            <StatusIcon className={`h-3.5 w-3.5 ${sc.color}`} />
                            <span className={`text-xs font-medium ${sc.color}`}>{latestEval.riskLevel}</span>
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  );
                })}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </DashboardLayout>
  );
};

export default ResultsModule;
