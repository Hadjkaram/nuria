import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext'; 
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield, Users, Search, Edit, Lock, Settings,
  CheckCircle, XCircle, Baby, Stethoscope, GraduationCap, Heart,
  Building, Flag, Globe, Crown, ChevronRight, Layers, Activity, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

// Fonction de traduction sécurisée (anti-crash)
const tt = (map: Record<string, string> | undefined | null, lang: string) => {
  if (!map) return '---';
  return map[lang] || map.fr || '---';
};

// Mapping textuel des icônes
const iconMap: Record<string, React.ElementType> = {
  Heart, Stethoscope, GraduationCap, Users, Building, Flag, Globe, Crown, Shield
};

interface RoleConfig {
  key: string;
  label: Record<string, string>;
  description: Record<string, string>;
  icon: React.ElementType;
  color: string;
  usersCount: number;
  isSystem: boolean;
  permissions: string[];
}

interface Permission {
  id: string;
  category: string;
  label: Record<string, string>;
  description: Record<string, string>;
}

const permissionCategories: { key: string; label: Record<string, string>; icon: React.ElementType }[] = [
  { key: 'children', label: { fr: 'Enfants / Patients', en: 'Children / Patients', pt: 'Crianças / Pacientes', ar: 'الأطفال / المرضى' }, icon: Baby },
  { key: 'screening', label: { fr: 'Dépistage & Évaluation', en: 'Screening & Evaluation', pt: 'Triagem & Avaliação', ar: 'الفحص والتقييم' }, icon: Activity },
  { key: 'clinical', label: { fr: 'Clinique & Soins', en: 'Clinical & Care', pt: 'Clínico & Cuidados', ar: 'السريري والرعاية' }, icon: Stethoscope },
  { key: 'admin', label: { fr: 'Administration', en: 'Administration', pt: 'Administração', ar: 'الإدارة' }, icon: Settings },
  { key: 'reporting', label: { fr: 'Rapports & Données', en: 'Reports & Data', pt: 'Relatórios & Dados', ar: 'التقارير والبيانات' }, icon: Layers },
  { key: 'system', label: { fr: 'Système', en: 'System', pt: 'Sistema', ar: 'النظام' }, icon: Shield },
];

const allPermissions: Permission[] = [
  { id: 'children.view', category: 'children', label: { fr: 'Voir les enfants', en: 'View children', pt: 'Ver crianças', ar: 'عرض الأطفال' }, description: { fr: 'Consulter les fiches enfants', en: 'View child records', pt: 'Consultar fichas de crianças', ar: 'عرض سجلات الأطفال' } },
  { id: 'children.create', category: 'children', label: { fr: 'Créer un enfant', en: 'Create child', pt: 'Criar criança', ar: 'إنشاء طفل' }, description: { fr: 'Ajouter un nouvel enfant', en: 'Add new child', pt: 'Adicionar nova criança', ar: 'إضافة طفل جديد' } },
  { id: 'children.edit', category: 'children', label: { fr: 'Modifier un enfant', en: 'Edit child', pt: 'Editar criança', ar: 'تعديل طفل' }, description: { fr: 'Modifier les informations', en: 'Edit information', pt: 'Editar informações', ar: 'تعديل المعلومات' } },
  { id: 'children.delete', category: 'children', label: { fr: 'Supprimer un enfant', en: 'Delete child', pt: 'Excluir criança', ar: 'حذف طفل' }, description: { fr: 'Supprimer définitivement', en: 'Delete permanently', pt: 'Excluir permanentemente', ar: 'حذف نهائي' } },
  { id: 'screening.view', category: 'screening', label: { fr: 'Voir les dépistages', en: 'View screenings', pt: 'Ver triagens', ar: 'عرض الفحوصات' }, description: { fr: 'Consulter les résultats', en: 'View results', pt: 'Consultar resultados', ar: 'عرض النتائج' } },
  { id: 'screening.conduct', category: 'screening', label: { fr: 'Effectuer un dépistage', en: 'Conduct screening', pt: 'Realizar triagem', ar: 'إجراء فحص' }, description: { fr: 'Réaliser des évaluations', en: 'Perform evaluations', pt: 'Realizar avaliações', ar: 'إجراء تقييمات' } },
  { id: 'screening.validate', category: 'screening', label: { fr: 'Valider les résultats', en: 'Validate results', pt: 'Validar resultados', ar: 'التحقق من النتائج' }, description: { fr: 'Approuver les évaluations', en: 'Approve evaluations', pt: 'Aprovar avaliações', ar: 'الموافقة على التقييمات' } },
  { id: 'clinical.care_plans', category: 'clinical', label: { fr: 'Plans de soins', en: 'Care plans', pt: 'Planos de cuidado', ar: 'خطط الرعاية' }, description: { fr: 'Gérer les plans de prise en charge', en: 'Manage care plans', pt: 'Gerenciar planos de cuidado', ar: 'إدارة خطط الرعاية' } },
  { id: 'clinical.appointments', category: 'clinical', label: { fr: 'Rendez-vous', en: 'Appointments', pt: 'Consultas', ar: 'المواعيد' }, description: { fr: 'Gérer les rendez-vous', en: 'Manage appointments', pt: 'Gerenciar consultas', ar: 'إدارة المواعيد' } },
  { id: 'clinical.teleconsultation', category: 'clinical', label: { fr: 'Téléconsultation', en: 'Teleconsultation', pt: 'Teleconsulta', ar: 'الاستشارة عن بعد' }, description: { fr: 'Accéder à la téléconsultation', en: 'Access teleconsultation', pt: 'Acessar teleconsulta', ar: 'الوصول للاستشارة عن بعد' } },
  { id: 'clinical.documents', category: 'clinical', label: { fr: 'Documents cliniques', en: 'Clinical documents', pt: 'Documentos clínicos', ar: 'المستندات السريرية' }, description: { fr: 'Gérer les documents', en: 'Manage documents', pt: 'Gerenciar documentos', ar: 'إدارة المستندات' } },
  { id: 'admin.users', category: 'admin', label: { fr: 'Gestion utilisateurs', en: 'User management', pt: 'Gestão de usuários', ar: 'إدارة المستخدمين' }, description: { fr: 'Créer et gérer les utilisateurs', en: 'Create and manage users', pt: 'Criar e gerenciar usuários', ar: 'إنشاء وإدارة المستخدمين' } },
  { id: 'admin.structures', category: 'admin', label: { fr: 'Gestion structures', en: 'Structure management', pt: 'Gestão de estruturas', ar: 'إدارة الهياكل' }, description: { fr: 'Gérer les structures', en: 'Manage structures', pt: 'Gerenciar estruturas', ar: 'إدارة الهياكل' } },
  { id: 'admin.organizations', category: 'admin', label: { fr: 'Gestion organisations', en: 'Organization management', pt: 'Gestão de organizações', ar: 'إدارة المنظمات' }, description: { fr: 'Gérer les organisations', en: 'Manage organizations', pt: 'Gerenciar organizações', ar: 'إدارة المنظمات' } },
  { id: 'admin.settings', category: 'admin', label: { fr: 'Paramètres', en: 'Settings', pt: 'Configurações', ar: 'الإعدادات' }, description: { fr: 'Configurer la plateforme', en: 'Configure platform', pt: 'Configurar plataforma', ar: 'تكوين المنصة' } },
  { id: 'reporting.view', category: 'reporting', label: { fr: 'Voir les rapports', en: 'View reports', pt: 'Ver relatórios', ar: 'عرض التقارير' }, description: { fr: 'Consulter les statistiques', en: 'View statistics', pt: 'Consultar estatísticas', ar: 'عرض الإحصائيات' } },
  { id: 'reporting.export', category: 'reporting', label: { fr: 'Exporter les données', en: 'Export data', pt: 'Exportar dados', ar: 'تصدير البيانات' }, description: { fr: 'Télécharger les exports', en: 'Download exports', pt: 'Baixar exportações', ar: 'تحميل التصديرات' } },
  { id: 'reporting.indicators', category: 'reporting', label: { fr: 'Indicateurs nationaux', en: 'National indicators', pt: 'Indicadores nacionais', ar: 'المؤشرات الوطنية' }, description: { fr: 'Accéder aux indicateurs', en: 'Access indicators', pt: 'Acessar indicadores', ar: 'الوصول للمؤشرات' } },
  { id: 'reporting.mapping', category: 'reporting', label: { fr: 'Cartographie', en: 'Mapping', pt: 'Mapeamento', ar: 'الخرائط' }, description: { fr: 'Voir la cartographie', en: 'View mapping', pt: 'Ver mapeamento', ar: 'عرض الخرائط' } },
  { id: 'system.roles', category: 'system', label: { fr: 'Gestion des rôles', en: 'Role management', pt: 'Gestão de funções', ar: 'إدارة الأدوار' }, description: { fr: 'Configurer rôles et permissions', en: 'Configure roles and permissions', pt: 'Configurar funções e permissões', ar: 'تكوين الأدوار والصلاحيات' } },
  { id: 'system.countries', category: 'system', label: { fr: 'Gestion des pays', en: 'Country management', pt: 'Gestão de países', ar: 'إدارة الدول' }, description: { fr: 'Gérer les pays', en: 'Manage countries', pt: 'Gerenciar países', ar: 'إدارة الدول' } },
  { id: 'system.audit', category: 'system', label: { fr: 'Audit & Logs', en: 'Audit & Logs', pt: 'Auditoria & Logs', ar: 'التدقيق والسجلات' }, description: { fr: 'Consulter les journaux', en: 'View audit logs', pt: 'Consultar registros', ar: 'عرض سجلات التدقيق' } },
  { id: 'system.modules', category: 'system', label: { fr: 'Gestion modules', en: 'Module management', pt: 'Gestão de módulos', ar: 'إدارة الوحدات' }, description: { fr: 'Activer/désactiver les modules', en: 'Enable/disable modules', pt: 'Ativar/desativar módulos', ar: 'تفعيل/إلغاء تفعيل الوحدات' } },
];

const RolesModule: React.FC = () => {
  const { lang } = useLanguage() as { lang: string };
  const { toast } = useToast();
  
  const [roles, setRoles] = useState<RoleConfig[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // --- 1. LECTURE DEPUIS SUPABASE AVEC GÉNÉRATION DYNAMIQUE ---
  const fetchRoles = async () => {
    setIsLoading(true);
    try {
      const [rolesRes, profilesRes] = await Promise.all([
        supabase.from('roles_config').select('*').order('created_at', { ascending: true }),
        supabase.from('profiles').select('id, role')
      ]);
      
      const profiles = profilesRes.data || [];
      let configData = rolesRes.data || [];
      
      // Si la table de configuration des rôles est vide, on les génère depuis les profils
      if (configData.length === 0) {
         const uniqueRoles = Array.from(new Set(profiles.map(p => p.role).filter(Boolean)));
         configData = uniqueRoles.map(r => ({
           id: r,
           label: { fr: String(r).toUpperCase(), en: String(r).toUpperCase(), pt: String(r).toUpperCase(), ar: String(r).toUpperCase() },
           description: { fr: `Rôle assigné (${r})`, en: 'Assigned Role', pt: 'Papel atribuído', ar: 'دور مخصص' },
           icon_name: 'Users',
           color: '#3b82f6',
           is_system: true,
           permissions: []
         }));
      }
      
      if (configData.length > 0) {
        const formatted: RoleConfig[] = configData.map(r => {
          // On calcule le nombre réel d'utilisateurs qui ont ce rôle
          const realUserCount = profiles.filter(p => String(p.role).toLowerCase() === String(r.id).toLowerCase()).length;
          
          return {
            key: r.id || `temp_${Math.random()}`,
            label: r.label || { fr: r.id, en: r.id, pt: r.id, ar: r.id }, 
            description: r.description || { fr: '', en: '', pt: '', ar: '' },
            icon: iconMap[r.icon_name] || Users, // Fallback sur Users par defaut
            color: r.color || '#94a3b8',
            usersCount: realUserCount > 0 ? realUserCount : (r.users_count || 0), // La vraie donnée prime
            isSystem: r.is_system !== undefined ? r.is_system : true,
            permissions: Array.isArray(r.permissions) ? r.permissions : []
          };
        });
        setRoles(formatted);
      } else {
        setRoles([]);
      }
    } catch (err: any) {
      console.error("Crash évité dans fetchRoles:", err);
      toast({ title: "Info", description: "Le module de gestion des rôles charge partiellement.", variant: "default" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const labels = {
    title: { fr: 'Rôles & Permissions', en: 'Roles & Permissions', pt: 'Funções & Permissões', ar: 'الأدوار والصلاحيات' },
    subtitle: { fr: 'Configuration du contrôle d\'accès (RBAC)', en: 'Access control configuration (RBAC)', pt: 'Configuração de controle de acesso (RBAC)', ar: 'تكوين التحكم في الوصول (RBAC)' },
    roles: { fr: 'Rôles', en: 'Roles', pt: 'Funções', ar: 'الأدوار' },
    matrix: { fr: 'Matrice', en: 'Matrix', pt: 'Matriz', ar: 'المصفوفة' },
    search: { fr: 'Rechercher une permission...', en: 'Search permission...', pt: 'Buscar permissão...', ar: 'البحث عن صلاحية...' },
    permissions: { fr: 'Permissions', en: 'Permissions', pt: 'Permissões', ar: 'الصلاحيات' },
    users: { fr: 'Utilisateurs', en: 'Users', pt: 'Usuários', ar: 'المستخدمون' },
    systemRole: { fr: 'Rôle système', en: 'System role', pt: 'Função do sistema', ar: 'دور النظام' },
    editPermissions: { fr: 'Modifier les permissions', en: 'Edit permissions', pt: 'Editar permissões', ar: 'تعديل الصلاحيات' },
    save: { fr: 'Enregistrer', en: 'Save', pt: 'Salvar', ar: 'حفظ' },
    cancel: { fr: 'Annuler', en: 'Cancel', pt: 'Cancelar', ar: 'إلغاء' },
    permissionsCount: { fr: 'permissions', en: 'permissions', pt: 'permissões', ar: 'صلاحيات' },
  };

  const totalUsers = roles.reduce((a, r) => a + r.usersCount, 0);
  const totalPerms = allPermissions.length;

  const handleStartEdit = (role: RoleConfig) => {
    setEditingPermissions([...role.permissions]);
    setIsEditing(true);
  };

  // --- 2. SAUVEGARDE EN BASE DE DONNÉES (BLINDÉE) ---
  const handleSavePermissions = async () => {
    if (!selectedRole) return;
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('roles_config').update({ 
        permissions: editingPermissions,
        updated_at: new Date().toISOString()
      }).eq('id', selectedRole.key);

      if (error) {
         if (error.code === '42P01') {
            throw new Error("La table 'roles_config' n'est pas encore créée. Modification temporaire locale appliquée.");
         }
         throw error;
      }

      setRoles(prev => prev.map(r => r.key === selectedRole.key ? { ...r, permissions: editingPermissions } : r));
      setSelectedRole(prev => prev ? { ...prev, permissions: editingPermissions } : null);
      setIsEditing(false);
      toast({ title: "Succès", description: tt({ fr: 'Permissions mises à jour', en: 'Permissions updated', pt: 'Permissões atualizadas', ar: 'تم تحديث الصلاحيات' }, lang) });
    } catch (err: any) {
      // Même en cas d'erreur BDD on applique la modif localement pour le rendu
      setRoles(prev => prev.map(r => r.key === selectedRole.key ? { ...r, permissions: editingPermissions } : r));
      setSelectedRole(prev => prev ? { ...prev, permissions: editingPermissions } : null);
      setIsEditing(false);
      toast({ title: "Info", description: err.message, variant: "default" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (permId: string) => {
    setEditingPermissions(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
  };

  const filteredPermissions = allPermissions.filter(p =>
    searchQuery === '' || tt(p.label, lang).toLowerCase().includes(searchQuery.toLowerCase()) || p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{tt(labels.title, lang)}</h1>
            <p className="text-sm text-muted-foreground mt-1">{tt(labels.subtitle, lang)}</p>
          </div>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Badge variant="outline" className="gap-1"><Shield className="h-3.5 w-3.5" />{roles.length} {tt(labels.roles, lang)}</Badge>
            <Badge variant="outline" className="gap-1"><Lock className="h-3.5 w-3.5" />{totalPerms} {tt(labels.permissions, lang)}</Badge>
            <Badge variant="outline" className="gap-1"><Users className="h-3.5 w-3.5" />{totalUsers.toLocaleString()} {tt(labels.users, lang)}</Badge>
          </div>
        </div>

        <Tabs defaultValue="roles">
          <TabsList>
            <TabsTrigger value="roles" className="gap-1.5"><Shield className="h-4 w-4" />{tt(labels.roles, lang)}</TabsTrigger>
            <TabsTrigger value="matrix" className="gap-1.5"><Layers className="h-4 w-4" />{tt(labels.matrix, lang)}</TabsTrigger>
          </TabsList>

          {/* ROLES LIST */}
          <TabsContent value="roles" className="mt-4">
            {isLoading ? (
               <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
              <div className="flex gap-6">
                {/* Role cards */}
                <div className={`space-y-3 transition-all ${selectedRole ? 'w-2/5' : 'w-full'}`}>
                  {roles.length === 0 ? (
                    <Card><CardContent className="p-8 text-center text-muted-foreground">Aucun rôle trouvé dans les profils ou la base.</CardContent></Card>
                  ) : roles.map(role => {
                    const Icon = role.icon;
                    const isSelected = selectedRole?.key === role.key;
                    return (
                      <Card key={role.key} className={`cursor-pointer transition-all hover:border-primary/30 ${isSelected ? 'border-primary ring-1 ring-primary/20' : ''}`} onClick={() => { setSelectedRole(role); setIsEditing(false); }}>
                        <CardContent className="py-4">
                          <div className="flex items-center gap-4">
                            <div className="h-11 w-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${role.color}15` }}>
                              <Icon className="h-5 w-5" style={{ color: role.color }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <span className="font-semibold text-sm">{tt(role.label, lang)}</span>
                                {role.isSystem && <Badge variant="outline" className="text-[9px] h-4">{tt(labels.systemRole, lang)}</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{tt(role.description, lang)}</p>
                              <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1"><Users className="h-3 w-3" />{role.usersCount}</span>
                                <span className="flex items-center gap-1"><Lock className="h-3 w-3" />{role.permissions.length} {tt(labels.permissionsCount, lang)}</span>
                              </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Detail panel */}
                {selectedRole && (
                  <div className="w-3/5 space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedRole.color}15` }}>
                              <selectedRole.icon className="h-6 w-6" style={{ color: selectedRole.color }} />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{tt(selectedRole.label, lang)}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5">{tt(selectedRole.description, lang)}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {!isEditing ? (
                              <Button size="sm" variant="outline" onClick={() => handleStartEdit(selectedRole)} className="gap-1">
                                <Edit className="h-3.5 w-3.5" />{tt(labels.editPermissions, lang)}
                              </Button>
                            ) : (
                              <>
                                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>{tt(labels.cancel, lang)}</Button>
                                <Button size="sm" onClick={handleSavePermissions} disabled={isSubmitting}>
                                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                  {tt(labels.save, lang)}
                                </Button>
                              </>
                            )}
                            <Button variant="ghost" size="icon" onClick={() => { setSelectedRole(null); setIsEditing(false); }}><XCircle className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <Badge variant="outline" className="gap-1"><Users className="h-3.5 w-3.5" />{selectedRole.usersCount} {tt(labels.users, lang)}</Badge>
                          <Badge variant="outline" className="gap-1"><Lock className="h-3.5 w-3.5" />{isEditing ? editingPermissions.length : selectedRole.permissions.length}/{totalPerms} {tt(labels.permissionsCount, lang)}</Badge>
                        </div>

                        {isEditing && (
                          <div className="relative mb-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input placeholder={tt(labels.search, lang)} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9" />
                          </div>
                        )}

                        <div className="space-y-5 max-h-[500px] overflow-y-auto pr-1">
                          {permissionCategories.map(cat => {
                            const catPerms = (isEditing ? filteredPermissions : allPermissions).filter(p => p.category === cat.key);
                            if (catPerms.length === 0) return null;
                            const CatIcon = cat.icon;
                            const currentPerms = isEditing ? editingPermissions : selectedRole.permissions;
                            const catGranted = catPerms.filter(p => currentPerms.includes(p.id)).length;

                            return (
                              <div key={cat.key}>
                                <div className="flex items-center gap-2 mb-2">
                                  <CatIcon className="h-4 w-4 text-primary" />
                                  <span className="text-sm font-semibold">{tt(cat.label, lang)}</span>
                                  <Badge variant={catGranted === catPerms.length ? 'default' : catGranted > 0 ? 'secondary' : 'outline'} className="text-[10px] ml-auto">
                                    {catGranted}/{catPerms.length}
                                  </Badge>
                                </div>
                                <div className="space-y-1.5 ml-6">
                                  {catPerms.map(perm => {
                                    const granted = currentPerms.includes(perm.id);
                                    return (
                                      <div key={perm.id} className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isEditing ? 'hover:bg-muted/50 cursor-pointer' : ''} ${granted ? 'bg-muted/30' : ''}`}
                                        onClick={isEditing ? () => togglePermission(perm.id) : undefined}>
                                        {isEditing ? (
                                          <Checkbox checked={granted} onCheckedChange={() => togglePermission(perm.id)} />
                                        ) : (
                                          granted ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-muted-foreground/40 shrink-0" />
                                        )}
                                        <div className="flex-1">
                                          <div className="text-sm font-medium">{tt(perm.label, lang)}</div>
                                          <div className="text-[11px] text-muted-foreground">{tt(perm.description, lang)}</div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* MATRIX */}
          <TabsContent value="matrix" className="mt-4">
            <Card>
              <CardContent className="pt-6 overflow-x-auto">
                {isLoading ? (
                  <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
                ) : roles.length === 0 ? (
                  <div className="text-center py-10 text-muted-foreground">La matrice des rôles est indisponible.</div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-semibold text-muted-foreground min-w-[200px]">{tt(labels.permissions, lang)}</th>
                        {roles.map(role => {
                          const Icon = role.icon;
                          return (
                            <th key={role.key} className="text-center py-2 px-2 min-w-[80px]">
                              <div className="flex flex-col items-center gap-1">
                                <Icon className="h-4 w-4" style={{ color: role.color }} />
                                <span className="text-[10px] font-medium leading-tight">{tt(role.label, lang)}</span>
                              </div>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {permissionCategories.map(cat => {
                        const catPerms = allPermissions.filter(p => p.category === cat.key);
                        return (
                          <React.Fragment key={cat.key}>
                            <tr>
                              <td colSpan={roles.length + 1} className="pt-4 pb-1">
                                <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                                  <cat.icon className="h-3.5 w-3.5" />
                                  {tt(cat.label, lang)}
                                </div>
                              </td>
                            </tr>
                            {catPerms.map(perm => (
                              <tr key={perm.id} className="border-b border-border/50 hover:bg-muted/20">
                                <td className="py-2 pr-4 text-xs">{tt(perm.label, lang)}</td>
                                {roles.map(role => {
                                  const has = role.permissions.includes(perm.id);
                                  return (
                                    <td key={role.key} className="text-center py-2 px-2">
                                      {has ? (
                                        <CheckCircle className="h-4 w-4 text-emerald-500 mx-auto" />
                                      ) : (
                                        <span className="inline-block h-4 w-4 rounded-full bg-muted/50 mx-auto" />
                                      )}
                                    </td>
                                  );
                                })}
                              </tr>
                            ))}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RolesModule;