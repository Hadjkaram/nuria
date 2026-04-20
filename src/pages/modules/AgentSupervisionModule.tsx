import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Users, Activity, ClipboardList, AlertTriangle, 
  Search, Clock, MapPin, TrendingUp, LogOut, Signal, X, ChevronRight, FileText
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Imports pour la VRAIE carte Leaflet
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const alertIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface AgentStat {
  id: string;
  name: string;
  totalScreenings: number;
  atRiskCount: number;
  lastActive: string | null;
}

interface LiveScreening {
  id: string;
  child_name: string;
  location: string;
  risk_level: string;
  score: number;
  created_at: string;
  agent_name: string;
  latitude: number | null;
  longitude: number | null;
  structure: string | null; // Ajouté pour le filtrage
}

const AgentSupervisionModule: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [agentsStats, setAgentsStats] = useState<AgentStat[]>([]);
  const [liveFeed, setLiveFeed] = useState<LiveScreening[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [todayTotal, setTodayTotal] = useState(0);

  // NOUVEAU : État pour la structure du superviseur
  const [supervisorStructure, setSupervisorStructure] = useState<string | null>(null);

  const [selectedAgent, setSelectedAgent] = useState<AgentStat | null>(null);
  const [agentHistory, setAgentHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  const [selectedScreening, setSelectedScreening] = useState<any | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const defaultCenter: [number, number] = [5.359951, -4.008256];

  const handleLogout = async () => {
    await logout();
    navigate('/login-agent');
  };

  const fetchDashboardData = async () => {
    try {
      if (!user) return;

      // 1. Déterminer la structure du superviseur connecté
      const { data: profileData } = await supabase
        .from('profiles')
        .select('assigned_structure')
        .eq('id', user.id)
        .single();
        
      const myStructure = profileData?.assigned_structure || null;
      setSupervisorStructure(myStructure);

      // 2. Récupérer les profils (Filtrés par structure si le superviseur en a une)
      let profilesQuery = supabase
        .from('profiles')
        .select('id, first_name, last_name, assigned_structure')
        .in('role', ['community', 'professional']);

      if (myStructure) {
        profilesQuery = profilesQuery.eq('assigned_structure', myStructure);
      }

      const { data: profiles, error: profilesError } = await profilesQuery;
      if (profilesError) throw profilesError;

      // 3. Récupérer les screenings (Filtrés par structure si le superviseur en a une)
      let screeningsQuery = supabase
        .from('screenings')
        .select('id, agent_id, risk_level, created_at, child_name, location, score, latitude, longitude, structure')
        .order('created_at', { ascending: false });

      if (myStructure) {
        screeningsQuery = screeningsQuery.eq('structure', myStructure);
      }

      const { data: screenings, error: screeningsError } = await screeningsQuery;
      if (screeningsError) throw screeningsError;

      // 4. Construire les statistiques
      const statsMap = new Map<string, AgentStat>();
      profiles?.forEach(p => {
        statsMap.set(p.id, { id: p.id, name: `${p.first_name} ${p.last_name}`, totalScreenings: 0, atRiskCount: 0, lastActive: null });
      });

      let todayCount = 0;
      const recentFeed: LiveScreening[] = [];

      screenings?.forEach((s, index) => {
        const isToday = new Date(s.created_at).toDateString() === new Date().toDateString();
        if (isToday) todayCount++;

        // Ne compter l'agent que s'il fait partie de la liste autorisée (sa structure)
        if (s.agent_id && statsMap.has(s.agent_id)) {
          const stat = statsMap.get(s.agent_id)!;
          stat.totalScreenings++;
          if (s.risk_level.includes('Risque') || s.score > 0) stat.atRiskCount++;
          if (!stat.lastActive || new Date(s.created_at) > new Date(stat.lastActive)) stat.lastActive = s.created_at;
        }

        if (index < 50) {
          const agentName = s.agent_id && statsMap.has(s.agent_id) ? statsMap.get(s.agent_id)!.name : 'Agent Inconnu';
          recentFeed.push({
            id: s.id, child_name: s.child_name, location: s.location || 'Non spécifié',
            risk_level: s.risk_level, score: s.score, created_at: s.created_at,
            agent_name: agentName, latitude: s.latitude, longitude: s.longitude, structure: s.structure
          });
        }
      });

      setAgentsStats(Array.from(statsMap.values()).sort((a, b) => b.totalScreenings - a.totalScreenings));
      setLiveFeed(recentFeed);
      setTodayTotal(todayCount);
    } catch (error: any) {
      toast({ title: "Erreur", description: "Impossible de charger les données.", variant: "destructive" });
    }
  };

  useEffect(() => {
    fetchDashboardData();
    const channel = supabase.channel('public:screenings')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'screenings' }, () => fetchDashboardData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const openAgentHistory = async (agent: AgentStat) => {
    setSelectedAgent(agent);
    setIsLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from('screenings')
        .select('id, child_name, risk_level, score, created_at, location')
        .eq('agent_id', agent.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setAgentHistory(data || []);
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger l'historique.", variant: "destructive" });
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const openScreeningDetails = async (screeningId: string, agentName: string) => {
    setIsLoadingDetails(true);
    try {
      const { data, error } = await supabase.from('screenings').select('*').eq('id', screeningId).single();
      if (error) throw error;
      setSelectedScreening({ ...data, agent_name: agentName });
    } catch (error) {
      toast({ title: "Erreur", description: "Impossible de charger les détails.", variant: "destructive" });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const renderAnswers = (screening: any) => {
    if (!screening) return null;
    
    if (screening.responses && typeof screening.responses === 'object') {
      return Object.entries(screening.responses).map(([key, value]) => (
        <div key={key} className="flex flex-col sm:flex-row justify-between py-3 border-b border-slate-100 text-sm gap-1 sm:gap-4">
          <span className="text-slate-600 font-medium">{key}</span>
          <span className={`font-bold ${value === 'Oui' || value === true ? 'text-amber-600' : 'text-emerald-600'}`}>
            {value === true ? 'Oui' : value === false ? 'Non' : String(value)}
          </span>
        </div>
      ));
    }

    const metadata = ['id', 'agent_id', 'created_at', 'updated_at', 'child_name', 'location', 'risk_level', 'score', 'latitude', 'longitude', 'structure'];
    const answers = Object.entries(screening).filter(([key, val]) => !metadata.includes(key) && val !== null && key !== 'agent_name');

    if (answers.length === 0) return <p className="text-slate-500 text-center py-4 text-sm">Aucun détail supplémentaire.</p>;

    return answers.map(([key, value]) => (
      <div key={key} className="flex flex-col sm:flex-row justify-between py-3 border-b border-slate-100 text-sm gap-1 sm:gap-4">
        <span className="text-slate-600 font-medium capitalize">{key.replace(/_/g, ' ')}</span>
        <span className="font-bold text-slate-800">{String(value)}</span>
      </div>
    ));
  };

  const filteredAgents = agentsStats.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const timeAgo = (dateString: string | null) => {
    if (!dateString) return 'Jamais';
    const seconds = Math.floor((new Date().getTime() - new Date(dateString).getTime()) / 1000);
    if (seconds < 60) return "À l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col relative">
      {/* EN-TÊTE RESPONSIVE */}
      <header className="bg-[#0056A8] text-white shadow-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-4">
            <img src="/logo-nuria.png" alt="NURIA" className="h-6 sm:h-8 brightness-0 invert" />
            <div className="hidden sm:block w-px h-6 bg-white/20"></div>
            <div className="flex items-center gap-2">
              <Signal className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 animate-pulse" />
              <h1 className="font-bold text-sm sm:text-lg tracking-wide whitespace-nowrap">
                Tour de Contrôle {supervisorStructure ? `• ${supervisorStructure}` : ''}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-right hidden md:block">
              <div className="text-sm font-bold text-white">{user?.firstName} {user?.lastName}</div>
              <div className="text-xs text-blue-200 uppercase tracking-wider font-medium">Superviseur</div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-white hover:bg-white/10 hover:text-white rounded-full px-2 sm:px-4">
              <LogOut className="h-4 w-4 sm:mr-2" />
              <span className="hidden sm:inline">Quitter</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-6">
        
        {/* KPIs (S'adapte sur 1 colonne mobile, 2 tablettes, 3 desktop) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Card className="border-none shadow-sm bg-gradient-to-br from-[#0056A8] to-[#00A3E0] text-white rounded-2xl">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">Recensés Aujourd'hui</p>
                  <p className="text-4xl sm:text-6xl font-black">{todayTotal}</p>
                </div>
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl">
            <CardContent className="p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-[#0056A8]" />
              </div>
              <div>
                <p className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">Agents Déployés</p>
                <p className="text-3xl sm:text-4xl font-black text-slate-800">{agentsStats.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl sm:col-span-2 lg:col-span-1">
            <CardContent className="p-5 sm:p-6 flex items-center gap-4 sm:gap-5">
              <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl bg-amber-50 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-amber-600" />
              </div>
              <div>
                <p className="text-slate-500 text-xs sm:text-sm font-bold uppercase tracking-wider mb-1">Total Cas à Risque</p>
                <p className="text-3xl sm:text-4xl font-black text-slate-800">{agentsStats.reduce((sum, a) => sum + a.atRiskCount, 0)}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          <div className="xl:col-span-2 space-y-6">
            {/* CARTE LEAFLET RESPONSIVE (hauteur variable) */}
            <Card className="border-none shadow-sm rounded-2xl overflow-hidden relative">
              <div className="absolute top-4 left-4 z-[400]">
                <Badge className="bg-white/90 text-slate-800 shadow-md backdrop-blur-md px-2 sm:px-3 py-1 font-bold flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                  <Signal className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-emerald-500 animate-pulse" /> Live Map
                </Badge>
              </div>
              <div className="h-[300px] md:h-[400px] w-full">
                <MapContainer center={defaultCenter} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%', zIndex: 0 }}>
                  <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
                  {liveFeed.map((feed) => {
                    if (!feed.latitude || !feed.longitude) return null;
                    const isRisk = feed.risk_level.includes('Risque') || feed.score >= 3;
                    return (
                      <Marker key={feed.id} position={[feed.latitude, feed.longitude]} icon={isRisk ? alertIcon : L.Icon.Default.prototype as L.Icon}>
                        <Popup>
                          <div className="font-sans min-w-[150px]">
                            <p className="font-bold text-slate-800 m-0 text-base">{feed.child_name}</p>
                            <p className="text-xs text-slate-500 mt-1 mb-2">Par : {feed.agent_name}</p>
                            <Badge variant="outline" className={`text-[10px] mb-3 ${isRisk ? 'text-amber-600 bg-amber-50' : 'text-emerald-600 bg-emerald-50'}`}>
                              {feed.risk_level}
                            </Badge>
                            <Button size="sm" className="w-full text-xs h-7 bg-[#0056A8]" onClick={() => openScreeningDetails(feed.id, feed.agent_name)}>
                              Voir les réponses
                            </Button>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </Card>

            {/* TABLEAU DES AGENTS (Avec overflow-x pour mobile) */}
            <Card className="border-none shadow-sm rounded-2xl">
              <CardHeader className="border-b bg-slate-50/80 p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-4">
                  <CardTitle className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-800">
                    <ClipboardList className="h-5 w-5 text-[#00A3E0]" /> Suivi des Agents
                  </CardTitle>
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input placeholder="Chercher un agent..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9 bg-white rounded-xl h-10 w-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="bg-white border-b text-slate-400 font-bold uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="px-4 sm:px-6 py-4">Nom de l'agent</th>
                        <th className="px-4 sm:px-6 py-4 text-center">Recensés</th>
                        <th className="px-4 sm:px-6 py-4 text-center">À Risque</th>
                        <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredAgents.map((agent) => (
                        <tr key={agent.id} className="hover:bg-blue-50/50 transition-colors cursor-pointer group" onClick={() => openAgentHistory(agent)}>
                          <td className="px-4 sm:px-6 py-4">
                            <div className="font-bold text-slate-800 group-hover:text-[#0056A8] transition-colors">{agent.name}</div>
                            <div className="text-[10px] sm:text-xs text-slate-500 flex items-center gap-1 mt-1">
                              <span className={`h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full ${agent.lastActive && (new Date().getTime() - new Date(agent.lastActive).getTime() < 86400000) ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                              {timeAgo(agent.lastActive)}
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-center">
                            <span className="inline-flex items-center justify-center bg-slate-100 group-hover:bg-white text-slate-800 font-black text-sm h-8 w-10 sm:w-12 rounded-lg">
                              {agent.totalScreenings}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-center">
                            {agent.atRiskCount > 0 ? (
                              <Badge className="bg-amber-100 text-amber-700 font-bold px-2 py-0.5 rounded-md text-[10px] sm:text-xs">
                                {agent.atRiskCount} alertes
                              </Badge>
                            ) : <span className="text-slate-300">-</span>}
                          </td>
                          <td className="px-4 sm:px-6 py-4 text-right">
                            <Button variant="ghost" size="sm" className="text-[#0056A8] bg-blue-50 hover:bg-[#0056A8] hover:text-white px-2 sm:px-3">
                              <span className="hidden sm:inline">Voir liste</span> <ChevronRight className="h-4 w-4 sm:ml-1" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FLUX EN DIRECT : Hauteur fixe sur mobile, collant sur desktop */}
          <div className="xl:col-span-1">
            <Card className="border-none shadow-sm rounded-2xl h-[400px] sm:h-[500px] xl:h-[calc(100vh-12rem)] flex flex-col xl:sticky xl:top-24">
              <CardHeader className="border-b bg-slate-50/80 p-4 shrink-0">
                <CardTitle className="text-base sm:text-lg font-black flex items-center gap-2 text-slate-800">
                  <div className="relative flex h-2.5 w-2.5 sm:h-3 sm:w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
                  </div>
                  Flux de données
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3 sm:p-4 flex-1 overflow-y-auto space-y-3 bg-slate-50/30">
                {liveFeed.length === 0 ? (
                  <div className="text-center py-10 text-slate-500">Aucun flux récent.</div>
                ) : (
                  liveFeed.map((feed) => {
                    const isRisk = feed.risk_level.includes('Risque') || feed.score >= 3;
                    return (
                      <div key={feed.id} onClick={() => openScreeningDetails(feed.id, feed.agent_name)} className="p-3 sm:p-4 rounded-xl bg-white border border-slate-100 shadow-sm hover:border-[#00A3E0] hover:shadow-md transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-2">
                          <Badge variant="outline" className={`text-[9px] sm:text-[10px] font-bold uppercase ${isRisk ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                            {feed.risk_level}
                          </Badge>
                          <span className="text-[9px] sm:text-[10px] text-slate-400 font-bold">{timeAgo(feed.created_at)}</span>
                        </div>
                        <p className="font-black text-slate-800 text-sm mb-2 group-hover:text-[#0056A8] transition-colors line-clamp-1">{feed.child_name}</p>
                        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500">
                          <span className="flex items-center gap-1 font-semibold text-slate-600 truncate max-w-[60%]">
                            <Users className="h-3 w-3 shrink-0" /> <span className="truncate">{feed.agent_name}</span>
                          </span>
                          <span className="text-[#00A3E0] font-medium opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            Détails →
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </main>

      {/* ================= MODALES RESPONSIVES ================= */}
      {selectedAgent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#0056A8] p-4 sm:p-5 flex items-center justify-between text-white shrink-0">
              <div className="truncate pr-4">
                <h2 className="text-lg sm:text-xl font-black flex items-center gap-2 truncate">
                  <Users className="h-5 w-5 shrink-0" /> <span className="truncate">{selectedAgent.name}</span>
                </h2>
                <p className="text-blue-200 text-xs sm:text-sm mt-1">{selectedAgent.totalScreenings} recensés</p>
              </div>
              <button onClick={() => setSelectedAgent(null)} className="h-8 w-8 shrink-0 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-0 bg-slate-50">
              {isLoadingHistory ? (
                <div className="flex justify-center py-20"><Activity className="h-8 w-8 text-[#0056A8] animate-spin" /></div>
              ) : agentHistory.length === 0 ? (
                <div className="text-center py-20 text-slate-500">Aucun historique trouvé.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs sm:text-sm text-left bg-white whitespace-nowrap">
                    <thead className="bg-slate-100 border-b text-slate-500 font-bold uppercase text-[9px] sm:text-[10px] sticky top-0">
                      <tr>
                        <th className="px-4 sm:px-6 py-3">Date</th>
                        <th className="px-4 sm:px-6 py-3">Enfant</th>
                        <th className="px-4 sm:px-6 py-3 hidden sm:table-cell">Localisation</th>
                        <th className="px-4 sm:px-6 py-3 text-right">Résultat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {agentHistory.map(h => {
                        const isRisk = h.risk_level.includes('Risque') || h.score >= 3;
                        return (
                          <tr key={h.id} className="hover:bg-blue-50/50 cursor-pointer" onClick={() => { setSelectedAgent(null); openScreeningDetails(h.id, selectedAgent.name); }}>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-500">{new Date(h.created_at).toLocaleDateString('fr-FR')}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 font-bold text-slate-800">{h.child_name}</td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-slate-600 hidden sm:table-cell"><div className="flex items-center gap-1"><MapPin className="h-3 w-3" />{h.location || '-'}</div></td>
                            <td className="px-4 sm:px-6 py-3 sm:py-4 text-right">
                              <Badge variant="outline" className={isRisk ? 'bg-amber-50 text-amber-700 text-[10px]' : 'bg-emerald-50 text-emerald-700 text-[10px]'}>
                                {h.risk_level}
                              </Badge>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedScreening && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-50 border-b p-4 sm:p-5 flex items-start justify-between shrink-0">
              <div className="flex gap-3 sm:gap-4 items-start pr-4">
                <div className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 rounded-xl bg-[#00A3E0]/10 flex items-center justify-center mt-0.5">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-[#00A3E0]" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-2xl font-black text-slate-800 leading-tight">{selectedScreening.child_name}</h2>
                  <div className="flex flex-col sm:flex-row sm:gap-3 text-xs sm:text-sm font-medium text-slate-500 mt-1 sm:mt-2">
                    <span className="flex items-center gap-1 truncate"><Users className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" /> {selectedScreening.agent_name}</span>
                    <span className="flex items-center gap-1 mt-0.5 sm:mt-0"><Clock className="h-3 w-3 sm:h-4 sm:w-4 shrink-0" /> {new Date(selectedScreening.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedScreening(null)} className="p-1.5 sm:p-2 shrink-0 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-white">
              {isLoadingDetails ? (
                <div className="flex justify-center py-20"><Activity className="h-8 w-8 text-[#00A3E0] animate-spin" /></div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 mb-0.5 sm:mb-1">Diagnostic</p>
                      <p className="font-black text-sm sm:text-lg text-slate-800">{selectedScreening.risk_level}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs uppercase font-bold text-slate-400 mb-0.5 sm:mb-1">Score</p>
                      <span className="inline-block bg-[#0056A8] text-white font-black text-lg sm:text-xl px-3 sm:px-4 py-1 sm:py-1.5 rounded-lg shadow-sm">
                        {selectedScreening.score || 0}
                      </span>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 mb-3 sm:mb-4 border-b pb-2 flex items-center gap-2 text-sm sm:text-base">
                      <ClipboardList className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" /> Détail des réponses
                    </h3>
                    <div className="bg-white rounded-xl text-xs sm:text-sm">
                      {renderAnswers(selectedScreening)}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="p-3 sm:p-4 border-t bg-slate-50 text-right shrink-0">
              <Button size="sm" onClick={() => setSelectedScreening(null)} className="bg-slate-800 hover:bg-slate-700 text-white w-full sm:w-auto">
                Fermer le dossier
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgentSupervisionModule;