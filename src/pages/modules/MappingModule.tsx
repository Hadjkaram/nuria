import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  MapPin, Search, Filter, Building, Baby, Users, Activity, CheckCircle2,
  AlertTriangle, Clock, Eye, ChevronRight, Target, TrendingUp,
  Download, Layers, ZoomIn, ZoomOut, LocateFixed
} from 'lucide-react';

interface Structure {
  id: string;
  name: string;
  type: 'health_center' | 'hospital' | 'camsp' | 'school' | 'community_center' | 'ngo';
  region: string;
  district: string;
  lat: number;
  lng: number;
  status: 'active' | 'inactive' | 'new';
  childrenFollowed: number;
  screened: number;
  professionals: number;
  coverage: number;
  lastActivity: string;
}

const mockStructures: Structure[] = [
  { id: '1', name: 'Centre de Santé Communautaire Abobo', type: 'health_center', region: 'Abidjan', district: 'Abobo', lat: 5.4164, lng: -4.0200, status: 'active', childrenFollowed: 185, screened: 420, professionals: 8, coverage: 72, lastActivity: '2026-03-10' },
  { id: '2', name: 'CHU de Cocody – Pédiatrie', type: 'hospital', region: 'Abidjan', district: 'Cocody', lat: 5.3364, lng: -3.9667, status: 'active', childrenFollowed: 320, screened: 680, professionals: 15, coverage: 85, lastActivity: '2026-03-10' },
  { id: '3', name: 'CAMSP Yopougon', type: 'camsp', region: 'Abidjan', district: 'Yopougon', lat: 5.3167, lng: -4.0833, status: 'active', childrenFollowed: 95, screened: 210, professionals: 6, coverage: 58, lastActivity: '2026-03-09' },
  { id: '4', name: 'École Primaire Les Palmiers', type: 'school', region: 'Abidjan', district: 'Marcory', lat: 5.2967, lng: -3.9867, status: 'active', childrenFollowed: 45, screened: 120, professionals: 3, coverage: 40, lastActivity: '2026-03-08' },
  { id: '5', name: 'Centre communautaire Adjamé', type: 'community_center', region: 'Abidjan', district: 'Adjamé', lat: 5.3500, lng: -4.0167, status: 'active', childrenFollowed: 60, screened: 150, professionals: 4, coverage: 45, lastActivity: '2026-03-07' },
  { id: '6', name: 'ONG Santé Plus – Antenne Bouaké', type: 'ngo', region: 'Bouaké', district: 'Bouaké Centre', lat: 7.6833, lng: -5.0333, status: 'active', childrenFollowed: 110, screened: 280, professionals: 5, coverage: 55, lastActivity: '2026-03-09' },
  { id: '7', name: 'Hôpital Régional de Bouaké', type: 'hospital', region: 'Bouaké', district: 'Bouaké Centre', lat: 7.6900, lng: -5.0300, status: 'active', childrenFollowed: 200, screened: 400, professionals: 10, coverage: 62, lastActivity: '2026-03-10' },
  { id: '8', name: 'Centre de Santé San-Pédro', type: 'health_center', region: 'San-Pédro', district: 'San-Pédro', lat: 4.7500, lng: -6.6333, status: 'active', childrenFollowed: 75, screened: 180, professionals: 4, coverage: 42, lastActivity: '2026-03-06' },
  { id: '9', name: 'Dispensaire rural Korhogo', type: 'health_center', region: 'Korhogo', district: 'Korhogo', lat: 9.4500, lng: -5.6333, status: 'new', childrenFollowed: 20, screened: 45, professionals: 2, coverage: 18, lastActivity: '2026-03-05' },
  { id: '10', name: 'Centre de Santé Daloa', type: 'health_center', region: 'Daloa', district: 'Daloa', lat: 6.8667, lng: -6.4500, status: 'active', childrenFollowed: 88, screened: 190, professionals: 5, coverage: 35, lastActivity: '2026-03-08' },
  { id: '11', name: 'ONG Enfance Protégée – Man', type: 'ngo', region: 'Man', district: 'Man', lat: 7.4000, lng: -7.5500, status: 'inactive', childrenFollowed: 30, screened: 80, professionals: 2, coverage: 20, lastActivity: '2026-02-15' },
  { id: '12', name: 'Maternité de Gagnoa', type: 'hospital', region: 'Gagnoa', district: 'Gagnoa', lat: 6.1333, lng: -5.9500, status: 'new', childrenFollowed: 15, screened: 30, professionals: 2, coverage: 12, lastActivity: '2026-03-04' },
];

const typeConfig: Record<string, { label: Record<string, string>; color: string; bgColor: string }> = {
  health_center: { label: { fr: 'Centre de santé', en: 'Health center', pt: 'Centro de saúde', ar: 'مركز صحي' }, color: 'text-blue-600', bgColor: 'bg-blue-500' },
  hospital: { label: { fr: 'Hôpital', en: 'Hospital', pt: 'Hospital', ar: 'مستشفى' }, color: 'text-emerald-600', bgColor: 'bg-emerald-500' },
  camsp: { label: { fr: 'CAMSP', en: 'CAMSP', pt: 'CAMSP', ar: 'CAMSP' }, color: 'text-violet-600', bgColor: 'bg-violet-500' },
  school: { label: { fr: 'École', en: 'School', pt: 'Escola', ar: 'مدرسة' }, color: 'text-amber-600', bgColor: 'bg-amber-500' },
  community_center: { label: { fr: 'Centre communautaire', en: 'Community center', pt: 'Centro comunitário', ar: 'مركز مجتمعي' }, color: 'text-orange-600', bgColor: 'bg-orange-500' },
  ngo: { label: { fr: 'ONG', en: 'NGO', pt: 'ONG', ar: 'منظمة غير حكومية' }, color: 'text-teal-600', bgColor: 'bg-teal-500' },
};

const statusStyles: Record<string, { label: Record<string, string>; style: string }> = {
  active: { label: { fr: 'Active', en: 'Active', pt: 'Ativa', ar: 'نشط' }, style: 'bg-emerald-100 text-emerald-800' },
  inactive: { label: { fr: 'Inactive', en: 'Inactive', pt: 'Inativa', ar: 'غير نشط' }, style: 'bg-muted text-muted-foreground' },
  new: { label: { fr: 'Nouvelle', en: 'New', pt: 'Nova', ar: 'جديد' }, style: 'bg-blue-100 text-blue-800' },
};

const regions = ['Abidjan', 'Bouaké', 'San-Pédro', 'Korhogo', 'Daloa', 'Man', 'Gagnoa'];

// Simulated map positions (relative % for visual map)
const regionPositions: Record<string, { x: number; y: number }> = {
  'Abidjan': { x: 62, y: 78 },
  'Bouaké': { x: 50, y: 45 },
  'San-Pédro': { x: 35, y: 85 },
  'Korhogo': { x: 48, y: 15 },
  'Daloa': { x: 35, y: 55 },
  'Man': { x: 18, y: 42 },
  'Gagnoa': { x: 40, y: 68 },
};

const MappingModule: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [mapView, setMapView] = useState<'map' | 'list'>('map');

  const filtered = mockStructures.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.district.toLowerCase().includes(search.toLowerCase());
    const matchType = typeFilter === 'all' || s.type === typeFilter;
    const matchRegion = regionFilter === 'all' || s.region === regionFilter;
    return matchSearch && matchType && matchRegion;
  });

  const regionStats = regions.map(r => {
    const structures = mockStructures.filter(s => s.region === r);
    return {
      region: r,
      count: structures.length,
      children: structures.reduce((s, st) => s + st.childrenFollowed, 0),
      coverage: structures.length > 0 ? Math.round(structures.reduce((s, st) => s + st.coverage, 0) / structures.length) : 0,
    };
  }).sort((a, b) => b.children - a.children);

  const stats = {
    total: mockStructures.length,
    active: mockStructures.filter(s => s.status === 'active').length,
    children: mockStructures.reduce((s, st) => s + st.childrenFollowed, 0),
    professionals: mockStructures.reduce((s, st) => s + st.professionals, 0),
  };

  const l = {
    fr: {
      title: user?.role === 'ministry' ? 'Cartographie nationale' : 'Cartographie', subtitle: 'Répartition géographique des structures et couverture',
      map: 'Carte', list: 'Liste', all: 'Tous', allTypes: 'Tous les types', allRegions: 'Toutes les régions',
      search: 'Rechercher une structure...', totalStructures: 'Structures', active: 'Actives', childrenFollowed: 'Enfants suivis', professionals: 'Professionnels',
      details: 'Détails', type: 'Type', region: 'Région', district: 'District', status: 'Statut', coverage: 'Couverture', screened: 'Dépistés', lastActivity: 'Dernière activité',
      export: 'Exporter', selectStructure: 'Sélectionnez une structure', legend: 'Légende', regionOverview: 'Aperçu par région',
    },
    en: {
      title: user?.role === 'ministry' ? 'National map' : 'Mapping', subtitle: 'Geographic distribution of structures and coverage',
      map: 'Map', list: 'List', all: 'All', allTypes: 'All types', allRegions: 'All regions',
      search: 'Search structures...', totalStructures: 'Structures', active: 'Active', childrenFollowed: 'Children followed', professionals: 'Professionals',
      details: 'Details', type: 'Type', region: 'Region', district: 'District', status: 'Status', coverage: 'Coverage', screened: 'Screened', lastActivity: 'Last activity',
      export: 'Export', selectStructure: 'Select a structure', legend: 'Legend', regionOverview: 'Region overview',
    },
    pt: {
      title: user?.role === 'ministry' ? 'Mapa nacional' : 'Mapeamento', subtitle: 'Distribuição geográfica das estruturas e cobertura',
      map: 'Mapa', list: 'Lista', all: 'Todos', allTypes: 'Todos os tipos', allRegions: 'Todas as regiões',
      search: 'Pesquisar estruturas...', totalStructures: 'Estruturas', active: 'Ativas', childrenFollowed: 'Crianças seguidas', professionals: 'Profissionais',
      details: 'Detalhes', type: 'Tipo', region: 'Região', district: 'Distrito', status: 'Status', coverage: 'Cobertura', screened: 'Triados', lastActivity: 'Última atividade',
      export: 'Exportar', selectStructure: 'Selecione uma estrutura', legend: 'Legenda', regionOverview: 'Visão por região',
    },
    ar: {
      title: user?.role === 'ministry' ? 'الخريطة الوطنية' : 'الخرائط', subtitle: 'التوزيع الجغرافي للهياكل والتغطية',
      map: 'خريطة', list: 'قائمة', all: 'الكل', allTypes: 'جميع الأنواع', allRegions: 'جميع المناطق',
      search: 'البحث عن هيكل...', totalStructures: 'الهياكل', active: 'نشطة', childrenFollowed: 'أطفال متابعون', professionals: 'مهنيون',
      details: 'التفاصيل', type: 'النوع', region: 'المنطقة', district: 'المقاطعة', status: 'الحالة', coverage: 'التغطية', screened: 'مفحوصون', lastActivity: 'آخر نشاط',
      export: 'تصدير', selectStructure: 'اختر هيكلاً', legend: 'مفتاح', regionOverview: 'نظرة إقليمية',
    },
  }[lang] || {
    title: 'Cartographie', subtitle: 'Structures et couverture', map: 'Carte', list: 'Liste', all: 'Tous', allTypes: 'Types', allRegions: 'Régions',
    search: 'Rechercher...', totalStructures: 'Structures', active: 'Actives', childrenFollowed: 'Enfants', professionals: 'Professionnels',
    details: 'Détails', type: 'Type', region: 'Région', district: 'District', status: 'Statut', coverage: 'Couverture', screened: 'Dépistés', lastActivity: 'Activité',
    export: 'Exporter', selectStructure: 'Sélectionner', legend: 'Légende', regionOverview: 'Par région',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{l.title}</h1>
            <p className="text-muted-foreground text-sm">{l.subtitle}</p>
          </div>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />{l.export}</Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: l.totalStructures, value: stats.total, icon: Building, color: 'text-primary' },
            { label: l.active, value: stats.active, icon: CheckCircle2, color: 'text-emerald-500' },
            { label: l.childrenFollowed, value: stats.children.toLocaleString(), icon: Baby, color: 'text-blue-500' },
            { label: l.professionals, value: stats.professionals, icon: Users, color: 'text-violet-500' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={l.search} className="pl-10" />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.allTypes}</SelectItem>
              {Object.entries(typeConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label[lang]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-full sm:w-44"><MapPin className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.allRegions}</SelectItem>
              {regions.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button onClick={() => setMapView('map')} className={`px-3 py-2 text-sm ${mapView === 'map' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'}`}>
              <MapPin className="h-4 w-4" />
            </button>
            <button onClick={() => setMapView('list')} className={`px-3 py-2 text-sm ${mapView === 'list' ? 'bg-primary text-primary-foreground' : 'bg-background text-foreground hover:bg-muted'}`}>
              <Layers className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map / List */}
          <div className="lg:col-span-2">
            {mapView === 'map' ? (
              <Card>
                <CardContent className="p-0">
                  {/* Visual map of Côte d'Ivoire */}
                  <div className="relative bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-emerald-950/20 dark:to-blue-950/20 rounded-lg overflow-hidden" style={{ height: 480 }}>
                    {/* Country outline (simplified SVG shape) */}
                    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-10">
                      <path d="M15,10 L55,5 L65,8 L70,15 L72,30 L75,45 L80,60 L78,75 L70,88 L55,92 L40,90 L25,85 L15,75 L10,55 L8,35 L12,20 Z" fill="currentColor" className="text-primary" />
                    </svg>

                    {/* Region dots with data */}
                    {regionStats.map(rs => {
                      const pos = regionPositions[rs.region];
                      if (!pos) return null;
                      const isFiltered = regionFilter !== 'all' && regionFilter !== rs.region;
                      const size = Math.max(24, Math.min(48, rs.children / 15));

                      return (
                        <button
                          key={rs.region}
                          onClick={() => setRegionFilter(rs.region === regionFilter ? 'all' : rs.region)}
                          className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group ${isFiltered ? 'opacity-30 scale-75' : 'opacity-100'}`}
                          style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                        >
                          {/* Pulse ring */}
                          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" style={{ width: size, height: size }} />
                          {/* Dot */}
                          <div
                            className="relative rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer"
                            style={{ width: size, height: size }}
                          >
                            {rs.count}
                          </div>
                          {/* Label */}
                          <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 bg-card border border-border rounded px-2 py-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            <p className="text-xs font-bold text-foreground">{rs.region}</p>
                            <p className="text-xs text-muted-foreground">{rs.children} enfants • {rs.coverage}%</p>
                          </div>
                        </button>
                      );
                    })}

                    {/* Structure pins for selected region */}
                    {regionFilter !== 'all' && filtered.map((s, i) => {
                      const basePos = regionPositions[s.region];
                      if (!basePos) return null;
                      const offset = { x: (i % 3 - 1) * 5, y: Math.floor(i / 3) * 5 - 3 };
                      return (
                        <button
                          key={s.id}
                          onClick={() => setSelectedStructure(s)}
                          className={`absolute transform -translate-x-1/2 -translate-y-full transition-all z-20 ${selectedStructure?.id === s.id ? 'scale-125' : 'hover:scale-110'}`}
                          style={{ left: `${basePos.x + offset.x}%`, top: `${basePos.y + offset.y}%` }}
                        >
                          <div className={`w-6 h-6 rounded-full ${typeConfig[s.type]?.bgColor || 'bg-primary'} text-white flex items-center justify-center shadow-md border-2 border-white`}>
                            <MapPin className="h-3 w-3" />
                          </div>
                        </button>
                      );
                    })}

                    {/* Legend */}
                    <div className="absolute bottom-3 left-3 bg-card/90 backdrop-blur border border-border rounded-lg p-3 shadow-sm">
                      <p className="text-xs font-semibold text-foreground mb-2">{l.legend}</p>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                        {Object.entries(typeConfig).map(([key, cfg]) => (
                          <div key={key} className="flex items-center gap-1.5">
                            <div className={`w-2.5 h-2.5 rounded-full ${cfg.bgColor}`} />
                            <span className="text-xs text-muted-foreground">{cfg.label[lang]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              /* List view */
              <div className="space-y-2">
                {filtered.length === 0 ? (
                  <Card><CardContent className="p-8 text-center text-muted-foreground"><Building className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>Aucune structure trouvée</p></CardContent></Card>
                ) : filtered.map(s => (
                  <Card
                    key={s.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${selectedStructure?.id === s.id ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => setSelectedStructure(s)}
                  >
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className={`p-2 rounded-lg bg-muted ${typeConfig[s.type]?.color || 'text-primary'}`}>
                        <Building className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{s.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span>{s.region} • {s.district}</span>
                          <span>•</span>
                          <span>{s.childrenFollowed} enfants</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className="text-right">
                          <div className="flex items-center gap-1">
                            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div className="h-full bg-primary rounded-full" style={{ width: `${s.coverage}%` }} />
                            </div>
                            <span className="text-xs font-bold text-foreground">{s.coverage}%</span>
                          </div>
                        </div>
                        <Badge className={`text-xs ${statusStyles[s.status]?.style}`}>{statusStyles[s.status]?.label[lang]}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Region overview */}
            <Card className="mt-6">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{l.regionOverview}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regionStats.map(rs => (
                    <div key={rs.region} className="flex items-center gap-4">
                      <button onClick={() => setRegionFilter(rs.region === regionFilter ? 'all' : rs.region)} className="w-20 text-sm font-medium text-foreground text-left hover:text-primary transition-colors">
                        {rs.region}
                      </button>
                      <div className="flex-1">
                        <div className="h-6 bg-muted rounded-full overflow-hidden relative">
                          <div className="h-full bg-primary/80 rounded-full transition-all" style={{ width: `${rs.coverage}%` }} />
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-foreground">{rs.coverage}% • {rs.children} enfants • {rs.count} struct.</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detail panel */}
          <div>
            {selectedStructure ? (
              <Card className="sticky top-20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-2 rounded-lg bg-muted ${typeConfig[selectedStructure.type]?.color}`}>
                      <Building className="h-5 w-5" />
                    </div>
                    <Badge variant="outline" className="text-xs">{typeConfig[selectedStructure.type]?.label[lang]}</Badge>
                    <Badge className={`text-xs ${statusStyles[selectedStructure.status]?.style}`}>{statusStyles[selectedStructure.status]?.label[lang]}</Badge>
                  </div>
                  <CardTitle className="text-lg">{selectedStructure.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{l.region}</span><span className="font-medium text-foreground">{selectedStructure.region}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{l.district}</span><span className="font-medium text-foreground">{selectedStructure.district}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{l.lastActivity}</span><span className="text-foreground">{selectedStructure.lastActivity}</span></div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-foreground">{selectedStructure.childrenFollowed}</p>
                      <p className="text-xs text-muted-foreground">{l.childrenFollowed}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-foreground">{selectedStructure.screened}</p>
                      <p className="text-xs text-muted-foreground">{l.screened}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <p className="text-xl font-bold text-foreground">{selectedStructure.professionals}</p>
                      <p className="text-xs text-muted-foreground">{l.professionals}</p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3 text-center">
                      <div className="relative inline-flex items-center justify-center w-12 h-12 mb-1">
                        <svg className="w-12 h-12 -rotate-90">
                          <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--muted))" strokeWidth="4" />
                          <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--primary))" strokeWidth="4"
                            strokeDasharray={`${(selectedStructure.coverage / 100) * 125.6} 125.6`} strokeLinecap="round" />
                        </svg>
                        <span className="absolute text-xs font-bold text-foreground">{selectedStructure.coverage}%</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{l.coverage}</p>
                    </div>
                  </div>

                  {/* Coordinates */}
                  <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-2">
                    <LocateFixed className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground font-mono">{selectedStructure.lat.toFixed(4)}°N, {Math.abs(selectedStructure.lng).toFixed(4)}°W</span>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <MapPin className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>{l.selectStructure}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MappingModule;
