import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth, type UserRole } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Users, Search, Plus, Shield, UserCheck, UserX, Mail, Phone,
  Calendar, Filter, Edit, Trash2, MoreVertical, CheckCircle2,
  Clock, AlertCircle, Building, Activity, Eye, Lock, Unlock
} from 'lucide-react';

type UserStatus = 'all' | 'active' | 'inactive' | 'pending' | 'suspended';

interface ManagedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: UserRole;
  status: UserStatus;
  organization: string;
  lastLogin: string;
  createdAt: string;
  isOnline: boolean;
}

const roleLabels: Record<UserRole, Record<string, string>> = {
  parent: { fr: 'Parent', en: 'Parent', pt: 'Pai/Mãe', ar: 'ولي أمر' },
  professional: { fr: 'Professionnel', en: 'Professional', pt: 'Profissional', ar: 'مهني' },
  teacher: { fr: 'Enseignant', en: 'Teacher', pt: 'Professor', ar: 'معلم' },
  community: { fr: 'Agent communautaire', en: 'Community agent', pt: 'Agente comunitário', ar: 'عامل مجتمعي' },
  orgAdmin: { fr: 'Admin organisation', en: 'Org admin', pt: 'Admin organização', ar: 'مدير المنظمة' },
  program: { fr: 'Programme national', en: 'National program', pt: 'Programa nacional', ar: 'البرنامج الوطني' },
  ministry: { fr: 'Ministère', en: 'Ministry', pt: 'Ministério', ar: 'الوزارة' },
  superAdmin: { fr: 'Super Admin', en: 'Super Admin', pt: 'Super Admin', ar: 'المدير العام' },
};

const roleColors: Record<UserRole, string> = {
  parent: 'bg-blue-100 text-blue-800',
  professional: 'bg-emerald-100 text-emerald-800',
  teacher: 'bg-amber-100 text-amber-800',
  community: 'bg-orange-100 text-orange-800',
  orgAdmin: 'bg-violet-100 text-violet-800',
  program: 'bg-teal-100 text-teal-800',
  ministry: 'bg-indigo-100 text-indigo-800',
  superAdmin: 'bg-rose-100 text-rose-800',
};

const statusConfig: Record<string, { label: Record<string, string>; style: string; icon: React.ElementType }> = {
  active: { label: { fr: 'Actif', en: 'Active', pt: 'Ativo', ar: 'نشط' }, style: 'bg-emerald-100 text-emerald-800', icon: CheckCircle2 },
  inactive: { label: { fr: 'Inactif', en: 'Inactive', pt: 'Inativo', ar: 'غير نشط' }, style: 'bg-muted text-muted-foreground', icon: UserX },
  pending: { label: { fr: 'En attente', en: 'Pending', pt: 'Pendente', ar: 'معلق' }, style: 'bg-amber-100 text-amber-800', icon: Clock },
  suspended: { label: { fr: 'Suspendu', en: 'Suspended', pt: 'Suspenso', ar: 'معلق' }, style: 'bg-red-100 text-red-800', icon: AlertCircle },
};

const mockUsers: ManagedUser[] = [
  { id: '1', firstName: 'Dr. Jean', lastName: 'Mbeki', email: 'pro@nuria.app', phone: '+225 07 11 22 33', role: 'professional', status: 'active', organization: 'Centre de santé Abobo', lastLogin: '2026-03-10', createdAt: '2025-06-15', isOnline: true },
  { id: '2', firstName: 'Fatou', lastName: 'Diallo', email: 'teacher@nuria.app', phone: '+225 05 44 55 66', role: 'teacher', status: 'active', organization: 'École primaire Cocody', lastLogin: '2026-03-09', createdAt: '2025-08-20', isOnline: false },
  { id: '3', firstName: 'Moussa', lastName: 'Traoré', email: 'community@nuria.app', phone: '+225 01 77 88 99', role: 'community', status: 'active', organization: 'ONG Santé Plus', lastLogin: '2026-03-10', createdAt: '2025-09-01', isOnline: true },
  { id: '4', firstName: 'Aminata', lastName: 'Koné', email: 'parent@nuria.app', phone: '+225 07 12 34 56', role: 'parent', status: 'active', organization: '-', lastLogin: '2026-03-08', createdAt: '2025-11-10', isOnline: false },
  { id: '5', firstName: 'Mariam', lastName: 'Cissé', email: 'mariam@nuria.app', phone: '+225 05 22 33 44', role: 'professional', status: 'pending', organization: 'Hôpital Cocody', lastLogin: '-', createdAt: '2026-03-05', isOnline: false },
  { id: '6', firstName: 'Kouadio', lastName: 'Assi', email: 'kouadio@nuria.app', phone: '+225 07 55 66 77', role: 'teacher', status: 'inactive', organization: 'Lycée Yopougon', lastLogin: '2026-01-15', createdAt: '2025-07-10', isOnline: false },
  { id: '7', firstName: 'Aïcha', lastName: 'Sow', email: 'aicha@nuria.app', phone: '+225 01 88 99 00', role: 'community', status: 'active', organization: 'ONG Santé Plus', lastLogin: '2026-03-10', createdAt: '2025-10-15', isOnline: true },
  { id: '8', firstName: 'Bakary', lastName: 'Sanogo', email: 'bakary@nuria.app', phone: '+225 05 11 00 99', role: 'professional', status: 'suspended', organization: 'Centre de santé Abobo', lastLogin: '2026-02-20', createdAt: '2025-05-01', isOnline: false },
  { id: '9', firstName: 'Ibrahim', lastName: 'Coulibaly', email: 'program@nuria.app', phone: '+225 07 33 22 11', role: 'program', status: 'active', organization: 'Ministère de la Santé', lastLogin: '2026-03-09', createdAt: '2025-04-01', isOnline: false },
  { id: '10', firstName: 'Rokia', lastName: 'Bamba', email: 'rokia@nuria.app', phone: '+225 01 44 55 66', role: 'parent', status: 'active', organization: '-', lastLogin: '2026-03-07', createdAt: '2026-01-20', isOnline: false },
];

const UsersModule: React.FC = () => {
  const { lang } = useLanguage();
  const { user: currentUser } = useAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus>('all');
  const [users, setUsers] = useState<ManagedUser[]>(mockUsers);
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [newUser, setNewUser] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'professional' as UserRole, organization: '' });

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

  const handleCreate = () => {
    if (!newUser.firstName.trim() || !newUser.email.trim()) return;
    const user: ManagedUser = {
      id: Date.now().toString(), firstName: newUser.firstName, lastName: newUser.lastName,
      email: newUser.email, phone: newUser.phone, role: newUser.role, status: 'pending',
      organization: newUser.organization, lastLogin: '-',
      createdAt: new Date().toISOString().split('T')[0], isOnline: false,
    };
    setUsers(prev => [user, ...prev]);
    setNewUser({ firstName: '', lastName: '', email: '', phone: '', role: 'professional', organization: '' });
    setShowCreate(false);
  };

  const updateUserStatus = (id: string, status: UserStatus) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
    if (selectedUser?.id === id) setSelectedUser(prev => prev ? { ...prev, status } : null);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    if (selectedUser?.id === id) setSelectedUser(null);
  };

  const l = {
    fr: { title: 'Gestion des utilisateurs', search: 'Rechercher un utilisateur...', newUser: 'Nouvel utilisateur', total: 'Total', active: 'Actifs', pending: 'En attente', online: 'En ligne', all: 'Tous', allRoles: 'Tous les rôles', details: 'Détails', role: 'Rôle', status: 'Statut', email: 'Email', phone: 'Téléphone', organization: 'Organisation', lastLogin: 'Dernière connexion', memberSince: 'Membre depuis', firstName: 'Prénom', lastName: 'Nom', create: 'Créer', cancel: 'Annuler', noResults: 'Aucun utilisateur trouvé', selectUser: 'Sélectionnez un utilisateur', activate: 'Activer', deactivate: 'Désactiver', suspend: 'Suspendre', delete: 'Supprimer', approve: 'Approuver', actions: 'Actions', edit: 'Modifier', resetPassword: 'Réinitialiser mot de passe' },
    en: { title: 'User management', search: 'Search users...', newUser: 'New user', total: 'Total', active: 'Active', pending: 'Pending', online: 'Online', all: 'All', allRoles: 'All roles', details: 'Details', role: 'Role', status: 'Status', email: 'Email', phone: 'Phone', organization: 'Organization', lastLogin: 'Last login', memberSince: 'Member since', firstName: 'First name', lastName: 'Last name', create: 'Create', cancel: 'Cancel', noResults: 'No users found', selectUser: 'Select a user', activate: 'Activate', deactivate: 'Deactivate', suspend: 'Suspend', delete: 'Delete', approve: 'Approve', actions: 'Actions', edit: 'Edit', resetPassword: 'Reset password' },
    pt: { title: 'Gestão de usuários', search: 'Pesquisar usuários...', newUser: 'Novo usuário', total: 'Total', active: 'Ativos', pending: 'Pendentes', online: 'Online', all: 'Todos', allRoles: 'Todas as funções', details: 'Detalhes', role: 'Função', status: 'Status', email: 'Email', phone: 'Telefone', organization: 'Organização', lastLogin: 'Último acesso', memberSince: 'Membro desde', firstName: 'Nome', lastName: 'Sobrenome', create: 'Criar', cancel: 'Cancelar', noResults: 'Nenhum usuário encontrado', selectUser: 'Selecione um usuário', activate: 'Ativar', deactivate: 'Desativar', suspend: 'Suspender', delete: 'Excluir', approve: 'Aprovar', actions: 'Ações', edit: 'Editar', resetPassword: 'Redefinir senha' },
    ar: { title: 'إدارة المستخدمين', search: 'البحث عن مستخدم...', newUser: 'مستخدم جديد', total: 'الإجمالي', active: 'نشطون', pending: 'قيد الانتظار', online: 'متصلون', all: 'الكل', allRoles: 'جميع الأدوار', details: 'التفاصيل', role: 'الدور', status: 'الحالة', email: 'البريد', phone: 'الهاتف', organization: 'المنظمة', lastLogin: 'آخر دخول', memberSince: 'عضو منذ', firstName: 'الاسم', lastName: 'اللقب', create: 'إنشاء', cancel: 'إلغاء', noResults: 'لا يوجد مستخدمون', selectUser: 'اختر مستخدمًا', activate: 'تفعيل', deactivate: 'تعطيل', suspend: 'تعليق', delete: 'حذف', approve: 'موافقة', actions: 'إجراءات', edit: 'تعديل', resetPassword: 'إعادة تعيين كلمة المرور' },
  }[lang] || { title: 'Utilisateurs', search: 'Rechercher...', newUser: 'Nouveau', total: 'Total', active: 'Actifs', pending: 'En attente', online: 'En ligne', all: 'Tous', allRoles: 'Tous', details: 'Détails', role: 'Rôle', status: 'Statut', email: 'Email', phone: 'Tél', organization: 'Org', lastLogin: 'Dernière co.', memberSince: 'Depuis', firstName: 'Prénom', lastName: 'Nom', create: 'Créer', cancel: 'Annuler', noResults: 'Aucun', selectUser: 'Sélectionner', activate: 'Activer', deactivate: 'Désactiver', suspend: 'Suspendre', delete: 'Supprimer', approve: 'Approuver', actions: 'Actions', edit: 'Modifier', resetPassword: 'Réinit. MDP' };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{l.title}</h1>
            <p className="text-muted-foreground text-sm">{stats.total} utilisateurs</p>
          </div>
          <Dialog open={showCreate} onOpenChange={setShowCreate}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{l.newUser}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5" />{l.newUser}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{l.firstName} *</Label><Input value={newUser.firstName} onChange={e => setNewUser(p => ({ ...p, firstName: e.target.value }))} className="mt-1" /></div>
                  <div><Label>{l.lastName}</Label><Input value={newUser.lastName} onChange={e => setNewUser(p => ({ ...p, lastName: e.target.value }))} className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>{l.email} *</Label><Input type="email" value={newUser.email} onChange={e => setNewUser(p => ({ ...p, email: e.target.value }))} className="mt-1" /></div>
                  <div><Label>{l.phone}</Label><Input value={newUser.phone} onChange={e => setNewUser(p => ({ ...p, phone: e.target.value }))} placeholder="+225..." className="mt-1" /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{l.role}</Label>
                    <Select value={newUser.role} onValueChange={v => setNewUser(p => ({ ...p, role: v as UserRole }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {(Object.keys(roleLabels) as UserRole[]).map(r => (
                          <SelectItem key={r} value={r}>{roleLabels[r][lang]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>{l.organization}</Label><Input value={newUser.organization} onChange={e => setNewUser(p => ({ ...p, organization: e.target.value }))} className="mt-1" /></div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowCreate(false)}>{l.cancel}</Button>
                  <Button onClick={handleCreate}>{l.create}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-48"><Shield className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.allRoles}</SelectItem>
              {(Object.keys(roleLabels) as UserRole[]).map(r => (
                <SelectItem key={r} value={r}>{roleLabels[r][lang]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as UserStatus)}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{l.all}</SelectItem>
              {Object.entries(statusConfig).map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label[lang]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User list */}
          <div className="lg:col-span-2 space-y-2">
            {filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground"><Users className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{l.noResults}</p></CardContent></Card>
            ) : filtered.map(u => (
              <Card
                key={u.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedUser?.id === u.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedUser(u)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-sm font-bold text-foreground">
                      {u.firstName[0]}{u.lastName[0]}
                    </div>
                    {u.isOnline && <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-card" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{u.firstName} {u.lastName}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    <p className="text-xs text-muted-foreground">{u.organization}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`text-xs ${roleColors[u.role]}`}>{roleLabels[u.role][lang]}</Badge>
                    <Badge className={`text-xs ${statusConfig[u.status]?.style || ''}`}>{statusConfig[u.status]?.label[lang]}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detail panel */}
          <div>
            {selectedUser ? (
              <Card className="sticky top-20">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-lg font-bold text-foreground">
                        {selectedUser.firstName[0]}{selectedUser.lastName[0]}
                      </div>
                      {selectedUser.isOnline && <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-emerald-500 border-2 border-card" />}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{selectedUser.firstName} {selectedUser.lastName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={roleColors[selectedUser.role]}>{roleLabels[selectedUser.role][lang]}</Badge>
                    <Badge className={statusConfig[selectedUser.status]?.style}>{statusConfig[selectedUser.status]?.label[lang]}</Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{selectedUser.email}</span></div>
                    <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{selectedUser.phone}</span></div>
                    <div className="flex items-center gap-2"><Building className="h-4 w-4 text-muted-foreground" /><span className="text-foreground">{selectedUser.organization}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{l.lastLogin}</span><span className="text-foreground">{selectedUser.lastLogin}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{l.memberSince}</span><span className="text-foreground">{selectedUser.createdAt}</span></div>
                  </div>

                  {/* Role-specific permissions summary */}
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase mb-2">{l.role}</p>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-foreground">{roleLabels[selectedUser.role][lang]}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">{l.actions}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedUser.status === 'pending' && (
                        <Button size="sm" className="text-xs" onClick={() => updateUserStatus(selectedUser.id, 'active')}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" />{l.approve}
                        </Button>
                      )}
                      {selectedUser.status === 'active' && (
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => updateUserStatus(selectedUser.id, 'suspended')}>
                          <Lock className="h-3.5 w-3.5 mr-1" />{l.suspend}
                        </Button>
                      )}
                      {(selectedUser.status === 'suspended' || selectedUser.status === 'inactive') && (
                        <Button size="sm" className="text-xs" onClick={() => updateUserStatus(selectedUser.id, 'active')}>
                          <Unlock className="h-3.5 w-3.5 mr-1" />{l.activate}
                        </Button>
                      )}
                      {selectedUser.status === 'active' && (
                        <Button size="sm" variant="outline" className="text-xs" onClick={() => updateUserStatus(selectedUser.id, 'inactive')}>
                          <UserX className="h-3.5 w-3.5 mr-1" />{l.deactivate}
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="text-xs">
                        <Lock className="h-3.5 w-3.5 mr-1" />{l.resetPassword}
                      </Button>
                      <Button size="sm" variant="destructive" className="text-xs" onClick={() => deleteUser(selectedUser.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />{l.delete}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-12 text-center text-muted-foreground">
                  <Users className="h-16 w-16 mx-auto mb-4 opacity-20" />
                  <p>{l.selectUser}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default UsersModule;
