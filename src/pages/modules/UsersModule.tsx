import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Users, Search, Plus, Shield, UserCheck, UserX, Mail, Phone,
  Calendar, Filter, Edit, Trash2, MoreVertical, CheckCircle2,
  Clock, AlertCircle, Building, Activity, Eye, Lock, Unlock, Loader2, UserPlus
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type UserStatus = 'all' | 'active' | 'inactive' | 'pending' | 'suspended';

interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole | string; // Permettre des rôles inconnus sans crasher
  status: UserStatus | string;
  organization: string;
  lastLogin: string;
  createdAt: string;
  isOnline: boolean;
}

const roleLabels: Record<string, Record<string, string>> = {
  parent: { fr: 'Parent', en: 'Parent', pt: 'Pai/Mãe', ar: 'ولي أمر' },
  professional: { fr: 'Professionnel', en: 'Professional', pt: 'Profissional', ar: 'مهني' },
  teacher: { fr: 'Enseignant', en: 'Teacher', pt: 'Professor', ar: 'معلم' },
  community: { fr: 'Agent communautaire', en: 'Community agent', pt: 'Agente comunitário', ar: 'عامل مجتمعي' },
  orgAdmin: { fr: 'Admin organisation', en: 'Org admin', pt: 'Admin organização', ar: 'مدير المنظمة' },
  program: { fr: 'Programme national', en: 'National program', pt: 'Programa nacional', ar: 'البرنامج الوطني' },
  ministry: { fr: 'Ministère', en: 'Ministry', pt: 'Ministério', ar: 'الوزارة' },
  superAdmin: { fr: 'Super Admin', en: 'Super Admin', pt: 'Super Admin', ar: 'المدير العام' },
  supervisor: { fr: 'Superviseur', en: 'Supervisor', pt: 'Supervisor', ar: 'مشرف' }, // Ajout du rôle supervisor !
};

const roleColors: Record<string, string> = {
  parent: 'bg-blue-100 text-blue-800',
  professional: 'bg-emerald-100 text-emerald-800',
  teacher: 'bg-amber-100 text-amber-800',
  community: 'bg-orange-100 text-orange-800',
  orgAdmin: 'bg-violet-100 text-violet-800',
  program: 'bg-teal-100 text-teal-800',
  ministry: 'bg-indigo-100 text-indigo-800',
  superAdmin: 'bg-rose-100 text-rose-800',
  supervisor: 'bg-cyan-100 text-cyan-800',
};

const statusConfig: Record<string, { label: Record<string, string>; style: string; icon: React.ElementType }> = {
  active: { label: { fr: 'Actif', en: 'Active', pt: 'Ativo', ar: 'نشط' }, style: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  inactive: { label: { fr: 'Inactif', en: 'Inactive', pt: 'Inativo', ar: 'غير نشط' }, style: 'bg-muted text-muted-foreground', icon: UserX },
  pending: { label: { fr: 'En attente', en: 'Pending', pt: 'Pendente', ar: 'معلق' }, style: 'bg-amber-100 text-amber-800', icon: Clock },
  suspended: { label: { fr: 'Suspendu', en: 'Suspended', pt: 'Suspenso', ar: 'معلق' }, style: 'bg-red-100 text-red-800', icon: AlertCircle },
};

// Fonction sécurisée pour obtenir le label d'un rôle
const getRoleLabel = (role: string, lang: string) => {
  if (roleLabels[role] && roleLabels[role][lang]) {
    return roleLabels[role][lang];
  }
  return role || 'Inconnu';
};

// Fonction sécurisée pour obtenir le label d'un statut
const getStatusLabel = (status: string, lang: string) => {
  if (statusConfig[status] && statusConfig[status].label[lang]) {
    return statusConfig[status].label[lang];
  }
  return status || 'Inconnu';
};

const UsersModule: React.FC = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);
  
  // États pour l'invitation
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '', firstName: '', lastName: '', role: '', organization: ''
  });

  // --- 1. LECTURE DEPUIS SUPABASE (BLINDÉE) ---
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      if (!currentUser) return;

      // 1. Vérifier la structure de l'admin connecté
      const { data: profileData } = await supabase
        .from('profiles')
        .select('assigned_structure')
        .eq('id', currentUser.id)
        .single();
        
      const myStructure = profileData?.assigned_structure || null;

      // Est-ce un SuperAdmin qui voit tout ?
      const isGeneral = 
        ['program', 'orgAdmin', 'superAdmin'].includes(currentUser?.role || '') || 
        (currentUser?.role === 'supervisor' && (!myStructure || myStructure.trim() === '' || /coordination|général|national|toutes/i.test(myStructure))) ||
        currentUser?.email === 'superviseur1@enuria.net';

      // 2. Récupérer les utilisateurs (Filtrés ou non)
      let query = supabase.from('profiles').select('*').order('created_at', { ascending: false });

      if (!isGeneral && myStructure) {
        query = query.eq('assigned_structure', myStructure);
      }

      const { data, error } = await query;
      if (error) {
         console.warn("Erreur chargement profiles:", error);
         toast({ title: "Erreur partielle", description: "Impossible de charger tous les utilisateurs.", variant: "destructive" });
      }

      if (data) {
        setUsers(data.map(u => ({
          id: u.id || 'N/A',
          firstName: u.first_name || 'Inconnu',
          lastName: u.last_name || '',
          email: u.email || 'Email non fourni',
          phone: u.phone || '-',
          role: u.role || 'inconnu',
          status: u.status || 'inactive',
          organization: u.assigned_structure || u.organization || '-', // Utilise assigned_structure en priorité
          lastLogin: u.last_login ? new Date(u.last_login).toLocaleDateString(lang) : '-',
          createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString(lang) : '-',
          isOnline: u.is_online || false
        })));
      }
    } catch (err: any) {
      console.error("Crash évité dans fetchUsers:", err);
      toast({ title: "Erreur", description: "Problème inattendu lors du chargement.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [lang, currentUser]);

  // --- 2. ACTIONS DE STATUT ---
  const updateUserStatus = async (id: string, status: UserStatus) => {
    setIsActionLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ status }).eq('id', id);
      if (error) throw error;

      setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
      if (selectedUser?.id === id) setSelectedUser(prev => prev ? { ...prev, status } : null);
      toast({ title: "Statut mis à jour", description: `L'utilisateur est maintenant ${status}.` });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsActionLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce profil ?")) return;
    setIsActionLoading(true);
    try {
      const { error } = await supabase.from('profiles').delete().eq('id', id);
      if (error) throw error;

      setUsers(prev => prev.filter(u => u.id !== id));
      if (selectedUser?.id === id) setSelectedUser(null);
      toast({ title: "Profil supprimé" });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsActionLoading(false);
    }
  };

  // --- 3. INVITATION UTILISATEUR ---
  const handleInviteUser = async () => {
    if (!inviteForm.email || !inviteForm.firstName || !inviteForm.role) {
      toast({ title: "Erreur", description: "Veuillez remplir les champs obligatoires.", variant: "destructive" });
      return;
    }

    setIsInviting(true);
    try {
      const fakeId = crypto.randomUUID(); 
      const { error } = await supabase.from('profiles').insert([{
        id: fakeId,
        email: inviteForm.email,
        first_name: inviteForm.firstName,
        last_name: inviteForm.lastName,
        role: inviteForm.role,
        assigned_structure: inviteForm.organization || '-', // Correction du champ BDD
        status: 'pending'
      }]);

      if (error) throw error;

      toast({ title: "Invitation envoyée", description: `Un accès a été préparé pour ${inviteForm.email}` });
      setIsInviteModalOpen(false);
      setInviteForm({ email: '', firstName: '', lastName: '', role: '', organization: '' });
      fetchUsers();
    } catch (error: any) {
      toast({ title: "Erreur d'invitation", description: error.message, variant: "destructive" });
    } finally {
      setIsInviting(false);
    }
  };

  const filtered = users.filter(u => {
    const matchSearch = `${u.firstName} ${u.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.organization.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === 'active').length,
    pending: users.filter(u => u.status === 'pending').length,
    online: users.filter(u => u.isOnline).length,
  };

  const l = {
    fr: { title: 'Gestion des utilisateurs', search: 'Rechercher un utilisateur...', newUser: 'Nouvel utilisateur', total: 'Total', active: 'Actifs', pending: 'En attente', online: 'En ligne', all: 'Tous', allRoles: 'Tous les rôles', details: 'Détails', role: 'Rôle', status: 'Statut', email: 'Email', phone: 'Téléphone', organization: 'Organisation', lastLogin: 'Dernière connexion', memberSince: 'Membre depuis', firstName: 'Prénom', lastName: 'Nom', create: 'Créer', cancel: 'Annuler', noResults: 'Aucun utilisateur trouvé', selectUser: 'Sélectionnez un utilisateur', activate: 'Activer', deactivate: 'Désactiver', suspend: 'Suspendre', delete: 'Supprimer', approve: 'Approuver', actions: 'Actions', edit: 'Modifier', resetPassword: 'Réinitialiser mot de passe' },
    en: { title: 'User management', search: 'Search users...', newUser: 'New user', total: 'Total', active: 'Active', pending: 'Pending', online: 'Online', all: 'All', allRoles: 'All roles', details: 'Details', role: 'Role', status: 'Status', email: 'Email', phone: 'Phone', organization: 'Organization', lastLogin: 'Last login', memberSince: 'Member since', firstName: 'First name', lastName: 'Last name', create: 'Create', cancel: 'Cancel', noResults: 'No users found', selectUser: 'Select a user', activate: 'Activate', deactivate: 'Deactivate', suspend: 'Suspend', delete: 'Delete', approve: 'Approve', actions: 'Actions', edit: 'Edit', resetPassword: 'Reset password' },
  }[lang] || { title: 'Utilisateurs' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{l.title}</h1>
            <p className="text-muted-foreground text-sm">{stats.total} utilisateurs enregistrés</p>
          </div>
          <Button onClick={() => setIsInviteModalOpen(true)} className="bg-primary text-primary-foreground font-bold shadow-md">
            <UserPlus className="h-4 w-4 mr-2" /> Inviter un collaborateur
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: l.total, value: stats.total, icon: Users, color: 'text-primary' },
            { label: l.active, value: stats.active, icon: UserCheck, color: 'text-emerald-500' },
            { label: l.pending, value: stats.pending, icon: Clock, color: 'text-amber-500' },
            { label: l.online, value: stats.online, icon: Activity, color: 'text-blue-500' },
          ].map(s => (
            <Card key={s.label}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${s.color}`}><s.icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{isLoading ? '...' : s.value}</p>
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
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48"><Shield className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.allRoles}</SelectItem>
              {Object.keys(roleLabels).map(r => (
                <SelectItem key={r} value={r}>{roleLabels[r][lang] || r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as UserStatus)}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.all}</SelectItem>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label[lang] || key}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-2">
              {filtered.length === 0 ? (
                <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun utilisateur trouvé.</CardContent></Card>
              ) : filtered.map(u => (
                <Card
                  key={u.id}
                  className={`cursor-pointer transition-all hover:shadow-md ${selectedUser?.id === u.id ? 'ring-2 ring-primary' : ''}`}
                  onClick={() => setSelectedUser(u)}
                >
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground uppercase">
                        {u.firstName[0] || ''}{u.lastName[0] || ''}
                      </div>
                      {u.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className={`text-[10px] ${roleColors[u.role] || 'bg-slate-100 text-slate-800'}`}>
                        {getRoleLabel(u.role, lang)}
                      </Badge>
                      <Badge className={`text-[10px] ${statusConfig[u.status]?.style || 'bg-slate-100 text-slate-800'}`}>
                        {getStatusLabel(u.status, lang)}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Detail panel */}
            <div>
              {selectedUser ? (
                <Card className="sticky top-24">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-foreground uppercase">
                        {selectedUser.firstName[0] || ''}{selectedUser.lastName[0] || ''}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{selectedUser.firstName} {selectedUser.lastName}</CardTitle>
                        <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      <Badge className={roleColors[selectedUser.role] || 'bg-slate-100'}>
                        {getRoleLabel(selectedUser.role, lang)}
                      </Badge>
                      <Badge className={statusConfig[selectedUser.status]?.style || 'bg-slate-100'}>
                        {getStatusLabel(selectedUser.status, lang)}
                      </Badge>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span>{selectedUser.email}</span></div>
                      <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span>{selectedUser.phone || '-'}</span></div>
                      <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /><span>{selectedUser.organization}</span></div>
                      <div className="flex justify-between border-t pt-2 mt-2"><span className="text-muted-foreground">{l.lastLogin}</span><span>{selectedUser.lastLogin}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">{l.memberSince}</span><span>{selectedUser.createdAt}</span></div>
                    </div>

                    <div className="border-t border-border pt-4 space-y-2">
                      <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">{l.actions}</p>
                      <div className="grid grid-cols-1 gap-2">
                        {selectedUser.status === 'pending' && (
                          <Button disabled={isActionLoading} size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => updateUserStatus(selectedUser.id, 'active')}>
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />{l.approve}
                          </Button>
                        )}
                        {selectedUser.status === 'active' && (
                          <Button disabled={isActionLoading} size="sm" variant="outline" className="w-full text-amber-600 border-amber-200 hover:bg-amber-50" onClick={() => updateUserStatus(selectedUser.id, 'suspended')}>
                            <Lock className="h-3.5 w-3.5 mr-1" />{l.suspend}
                          </Button>
                        )}
                        {(selectedUser.status === 'suspended' || selectedUser.status === 'inactive') && (
                          <Button disabled={isActionLoading} size="sm" variant="outline" className="w-full text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => updateUserStatus(selectedUser.id, 'active')}>
                            <Unlock className="h-3.5 w-3.5 mr-1" />{l.activate}
                          </Button>
                        )}
                        <Button disabled={isActionLoading} size="sm" variant="destructive" className="w-full" onClick={() => deleteUser(selectedUser.id)}>
                          <Trash2 className="h-3.5 w-3.5 mr-1" />{l.delete}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center text-muted-foreground border-dashed border-2">
                    <Users className="h-16 w-16 mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-medium">{l.selectUser}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* MODAL INVITATION */}
        <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
          <DialogContent className="max-w-md rounded-2xl p-6">
            <DialogHeader className="mb-4">
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-primary" /> Inviter un utilisateur
              </DialogTitle>
              <DialogDescription className="mt-1">
                Préparez un accès sécurisé pour un nouveau collaborateur NURIA.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Prénom <span className="text-red-500">*</span></Label>
                  <Input placeholder="Ex: Jean" value={inviteForm.firstName} onChange={e => setInviteForm({...inviteForm, firstName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase font-bold text-muted-foreground">Nom</Label>
                  <Input placeholder="Ex: Koffi" value={inviteForm.lastName} onChange={e => setInviteForm({...inviteForm, lastName: e.target.value})} />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Adresse Email <span className="text-red-500">*</span></Label>
                <Input type="email" placeholder="jean.koffi@hopital.ci" value={inviteForm.email} onChange={e => setInviteForm({...inviteForm, email: e.target.value})} />
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Rôle assigné <span className="text-red-500">*</span></Label>
                <Select onValueChange={v => setInviteForm({...inviteForm, role: v})} value={inviteForm.role}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(roleLabels).map(r => (
                      <SelectItem key={r} value={r}>{roleLabels[r][lang] || r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase font-bold text-muted-foreground">Organisation / Structure</Label>
                <Input placeholder="Ex: CHU de Cocody, ONG locale..." value={inviteForm.organization} onChange={e => setInviteForm({...inviteForm, organization: e.target.value})} />
                <p className="text-[10px] text-muted-foreground">Laissez vide si l'utilisateur appartient au niveau national.</p>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setIsInviteModalOpen(false)}>Annuler</Button>
              <Button className="flex-1 bg-primary" onClick={handleInviteUser} disabled={isInviting}>
                {isInviting ? <Loader2 className="animate-spin h-4 w-4" /> : "Envoyer l'invitation"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      </div>
    </DashboardLayout>
  );
};

export default UsersModule;