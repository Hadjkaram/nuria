import React, { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import type { Lang } from '@/i18n/translations';
import type { UserRole } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Shield, Users, Search, Eye, Edit, Lock, Unlock, Settings,
  CheckCircle, XCircle, Baby, Stethoscope, GraduationCap, Heart,
  Building, Flag, Globe, Crown, ChevronRight, Layers, Activity,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const tt = (map: Record<Lang, string>, lang: Lang) => map[lang] || map.fr;

interface RoleConfig {
  key: UserRole;
  label: Record<Lang, string>;
  description: Record<Lang, string>;
  icon: React.ElementType;
  color: string;
  usersCount: number;
  isSystem: boolean;
  permissions: string[];
}

interface Permission {
  id: string;
  category: string;
  label: Record<Lang, string>;
  description: Record<Lang, string>;
}

const permissionCategories: { key: string; label: Record<Lang, string>; icon: React.ElementType }[] = [
  { key: 'children', label: { fr: 'Enfants / Patients', en: 'Children / Patients', pt: 'Crianças / Pacientes', ar: 'الأطفال / المرضى' }, icon: Baby },
  { key: 'screening', label: { fr: 'Dépistage & Évaluation', en: 'Screening & Evaluation', pt: 'Triagem & Avaliação', ar: 'الفحص والتقييم' }, icon: Activity },
  { key: 'clinical', label: { fr: 'Clinique & Soins', en: 'Clinical & Care', pt: 'Clínico & Cuidados', ar: 'السريري والرعاية' }, icon: Stethoscope },
  { key: 'admin', label: { fr: 'Administration', en: 'Administration', pt: 'Administração', ar: 'الإدارة' }, icon: Settings },
  { key: 'reporting', label: { fr: 'Rapports & Données', en: 'Reports & Data', pt: 'Relatórios & Dados', ar: 'التقارير والبيانات' }, icon: Layers },
  { key: 'system', label: { fr: 'Système', en: 'System', pt: 'Sistema', ar: 'النظام' }, icon: Shield },
];

const allPermissions: Permission[] = [
  // Children
  { id: 'children.view', category: 'children', label: { fr: 'Voir les enfants', en: 'View children', pt: 'Ver crianças', ar: 'عرض الأطفال' }, description: { fr: 'Consulter les fiches enfants', en: 'View child records', pt: 'Consultar fichas de crianças', ar: 'عرض سجلات الأطفال' } },
  { id: 'children.create', category: 'children', label: { fr: 'Créer un enfant', en: 'Create child', pt: 'Criar criança', ar: 'إنشاء طفل' }, description: { fr: 'Ajouter un nouvel enfant', en: 'Add new child', pt: 'Adicionar nova criança', ar: 'إضافة طفل جديد' } },
  { id: 'children.edit', category: 'children', label: { fr: 'Modifier un enfant', en: 'Edit child', pt: 'Editar criança', ar: 'تعديل طفل' }, description: { fr: 'Modifier les informations', en: 'Edit information', pt: 'Editar informações', ar: 'تعديل المعلومات' } },
  { id: 'children.delete', category: 'children', label: { fr: 'Supprimer un enfant', en: 'Delete child', pt: 'Excluir criança', ar: 'حذف طفل' }, description: { fr: 'Supprimer définitivement', en: 'Delete permanently', pt: 'Excluir permanentemente', ar: 'حذف نهائي' } },
  // Screening
  { id: 'screening.view', category: 'screening', label: { fr: 'Voir les dépistages', en: 'View screenings', pt: 'Ver triagens', ar: 'عرض الفحوصات' }, description: { fr: 'Consulter les résultats', en: 'View results', pt: 'Consultar resultados', ar: 'عرض النتائج' } },
  { id: 'screening.conduct', category: 'screening', label: { fr: 'Effectuer un dépistage', en: 'Conduct screening', pt: 'Realizar triagem', ar: 'إجراء فحص' }, description: { fr: 'Réaliser des évaluations', en: 'Perform evaluations', pt: 'Realizar avaliações', ar: 'إجراء تقييمات' } },
  { id: 'screening.validate', category: 'screening', label: { fr: 'Valider les résultats', en: 'Validate results', pt: 'Validar resultados', ar: 'التحقق من النتائج' }, description: { fr: 'Approuver les évaluations', en: 'Approve evaluations', pt: 'Aprovar avaliações', ar: 'الموافقة على التقييمات' } },
  // Clinical
  { id: 'clinical.care_plans', category: 'clinical', label: { fr: 'Plans de soins', en: 'Care plans', pt: 'Planos de cuidado', ar: 'خطط الرعاية' }, description: { fr: 'Gérer les plans de prise en charge', en: 'Manage care plans', pt: 'Gerenciar planos de cuidado', ar: 'إدارة خطط الرعاية' } },
  { id: 'clinical.appointments', category: 'clinical', label: { fr: 'Rendez-vous', en: 'Appointments', pt: 'Consultas', ar: 'المواعيد' }, description: { fr: 'Gérer les rendez-vous', en: 'Manage appointments', pt: 'Gerenciar consultas', ar: 'إدارة المواعيد' } },
  { id: 'clinical.teleconsultation', category: 'clinical', label: { fr: 'Téléconsultation', en: 'Teleconsultation', pt: 'Teleconsulta', ar: 'الاستشارة عن بعد' }, description: { fr: 'Accéder à la téléconsultation', en: 'Access teleconsultation', pt: 'Acessar teleconsulta', ar: 'الوصول للاستشارة عن بعد' } },
  { id: 'clinical.documents', category: 'clinical', label: { fr: 'Documents cliniques', en: 'Clinical documents', pt: 'Documentos clínicos', ar: 'المستندات السريرية' }, description: { fr: 'Gérer les documents', en: 'Manage documents', pt: 'Gerenciar documentos', ar: 'إدارة المستندات' } },
  // Admin
  { id: 'admin.users', category: 'admin', label: { fr: 'Gestion utilisateurs', en: 'User management', pt: 'Gestão de usuários', ar: 'إدارة المستخدمين' }, description: { fr: 'Créer et gérer les utilisateurs', en: 'Create and manage users', pt: 'Criar e gerenciar usuários', ar: 'إنشاء وإدارة المستخدمين' } },
  { id: 'admin.structures', category: 'admin', label: { fr: 'Gestion structures', en: 'Structure management', pt: 'Gestão de estruturas', ar: 'إدارة الهياكل' }, description: { fr: 'Gérer les structures', en: 'Manage structures', pt: 'Gerenciar estruturas', ar: 'إدارة الهياكل' } },
  { id: 'admin.organizations', category: 'admin', label: { fr: 'Gestion organisations', en: 'Organization management', pt: 'Gestão de organizações', ar: 'إدارة المنظمات' }, description: { fr: 'Gérer les organisations', en: 'Manage organizations', pt: 'Gerenciar organizações', ar: 'إدارة المنظمات' } },
  { id: 'admin.settings', category: 'admin', label: { fr: 'Paramètres', en: 'Settings', pt: 'Configurações', ar: 'الإعدادات' }, description: { fr: 'Configurer la plateforme', en: 'Configure platform', pt: 'Configurar plataforma', ar: 'تكوين المنصة' } },
  // Reporting
  { id: 'reporting.view', category: 'reporting', label: { fr: 'Voir les rapports', en: 'View reports', pt: 'Ver relatórios', ar: 'عرض التقارير' }, description: { fr: 'Consulter les statistiques', en: 'View statistics', pt: 'Consultar estatísticas', ar: 'عرض الإحصائيات' } },
  { id: 'reporting.export', category: 'reporting', label: { fr: 'Exporter les données', en: 'Export data', pt: 'Exportar dados', ar: 'تصدير البيانات' }, description: { fr: 'Télécharger les exports', en: 'Download exports', pt: 'Baixar exportações', ar: 'تحميل التصديرات' } },
  { id: 'reporting.indicators', category: 'reporting', label: { fr: 'Indicateurs nationaux', en: 'National indicators', pt: 'Indicadores nacionais', ar: 'المؤشرات الوطنية' }, description: { fr: 'Accéder aux indicateurs', en: 'Access indicators', pt: 'Acessar indicadores', ar: 'الوصول للمؤشرات' } },
  { id: 'reporting.mapping', category: 'reporting', label: { fr: 'Cartographie', en: 'Mapping', pt: 'Mapeamento', ar: 'الخرائط' }, description: { fr: 'Voir la cartographie', en: 'View mapping', pt: 'Ver mapeamento', ar: 'عرض الخرائط' } },
  // System
  { id: 'system.roles', category: 'system', label: { fr: 'Gestion des rôles', en: 'Role management', pt: 'Gestão de funções', ar: 'إدارة الأدوار' }, description: { fr: 'Configurer rôles et permissions', en: 'Configure roles and permissions', pt: 'Configurar funções e permissões', ar: 'تكوين الأدوار والصلاحيات' } },
  { id: 'system.countries', category: 'system', label: { fr: 'Gestion des pays', en: 'Country management', pt: 'Gestão de países', ar: 'إدارة الدول' }, description: { fr: 'Gérer les pays', en: 'Manage countries', pt: 'Gerenciar países', ar: 'إدارة الدول' } },
  { id: 'system.audit', category: 'system', label: { fr: 'Audit & Logs', en: 'Audit & Logs', pt: 'Auditoria & Logs', ar: 'التدقيق والسجلات' }, description: { fr: 'Consulter les journaux', en: 'View audit logs', pt: 'Consultar registros', ar: 'عرض سجلات التدقيق' } },
  { id: 'system.modules', category: 'system', label: { fr: 'Gestion modules', en: 'Module management', pt: 'Gestão de módulos', ar: 'إدارة الوحدات' }, description: { fr: 'Activer/désactiver les modules', en: 'Enable/disable modules', pt: 'Ativar/desativar módulos', ar: 'تفعيل/إلغاء تفعيل الوحدات' } },
];

const initialRoles: RoleConfig[] = [
  { key: 'parent', label: { fr: 'Parent', en: 'Parent', pt: 'Pai/Mãe', ar: 'ولي أمر' }, description: { fr: 'Parents et tuteurs d\'enfants suivis', en: 'Parents and guardians of followed children', pt: 'Pais e responsáveis por crianças acompanhadas', ar: 'أولياء أمور الأطفال المتابعين' }, icon: Heart, color: '#ec4899', usersCount: 4250, isSystem: true, permissions: ['children.view', 'screening.view', 'clinical.appointments', 'clinical.teleconsultation'] },
  { key: 'professional', label: { fr: 'Professionnel de santé', en: 'Health professional', pt: 'Profissional de saúde', ar: 'مهني صحي' }, description: { fr: 'Médecins, psychologues, orthophonistes', en: 'Doctors, psychologists, speech therapists', pt: 'Médicos, psicólogos, fonoaudiólogos', ar: 'أطباء، أخصائيون نفسيون، معالجون' }, icon: Stethoscope, color: '#3b82f6', usersCount: 320, isSystem: true, permissions: ['children.view', 'children.create', 'children.edit', 'screening.view', 'screening.conduct', 'screening.validate', 'clinical.care_plans', 'clinical.appointments', 'clinical.teleconsultation', 'clinical.documents', 'reporting.view'] },
  { key: 'teacher', label: { fr: 'Enseignant', en: 'Teacher', pt: 'Professor', ar: 'معلم' }, description: { fr: 'Enseignants et éducateurs scolaires', en: 'Teachers and school educators', pt: 'Professores e educadores escolares', ar: 'المعلمون والمربون' }, icon: GraduationCap, color: '#f59e0b', usersCount: 185, isSystem: true, permissions: ['children.view', 'screening.view', 'screening.conduct', 'reporting.view'] },
  { key: 'community', label: { fr: 'Agent communautaire', en: 'Community agent', pt: 'Agente comunitário', ar: 'عامل مجتمعي' }, description: { fr: 'Agents de terrain et relais communautaires', en: 'Field agents and community workers', pt: 'Agentes de campo e trabalhadores comunitários', ar: 'العاملون الميدانيون والمجتمعيون' }, icon: Users, color: '#10b981', usersCount: 142, isSystem: true, permissions: ['children.view', 'children.create', 'screening.view', 'screening.conduct'] },
  { key: 'orgAdmin', label: { fr: 'Admin. organisation', en: 'Org. admin', pt: 'Admin. organização', ar: 'مدير منظمة' }, description: { fr: 'Administrateurs d\'organisations partenaires', en: 'Partner organization administrators', pt: 'Administradores de organizações parceiras', ar: 'مديرو المنظمات الشريكة' }, icon: Building, color: '#8b5cf6', usersCount: 28, isSystem: true, permissions: ['children.view', 'children.create', 'children.edit', 'screening.view', 'clinical.appointments', 'admin.users', 'admin.structures', 'admin.settings', 'reporting.view', 'reporting.export'] },
  { key: 'program', label: { fr: 'Programme national', en: 'National program', pt: 'Programa nacional', ar: 'البرنامج الوطني' }, description: { fr: 'Gestionnaires de programmes nationaux', en: 'National program managers', pt: 'Gestores de programas nacionais', ar: 'مديرو البرامج الوطنية' }, icon: Flag, color: '#0ea5e9', usersCount: 12, isSystem: true, permissions: ['children.view', 'screening.view', 'admin.structures', 'admin.organizations', 'reporting.view', 'reporting.export', 'reporting.indicators', 'reporting.mapping'] },
  { key: 'ministry', label: { fr: 'Ministère', en: 'Ministry', pt: 'Ministério', ar: 'الوزارة' }, description: { fr: 'Décideurs et cadres ministériels', en: 'Ministry decision-makers', pt: 'Tomadores de decisão ministeriais', ar: 'صانعو القرار في الوزارة' }, icon: Globe, color: '#6366f1', usersCount: 8, isSystem: true, permissions: ['reporting.view', 'reporting.export', 'reporting.indicators', 'reporting.mapping'] },
  { key: 'superAdmin', label: { fr: 'Super Administrateur', en: 'Super Admin', pt: 'Super Administrador', ar: 'المدير الأعلى' }, description: { fr: 'Accès complet à toute la plateforme', en: 'Full platform access', pt: 'Acesso completo à plataforma', ar: 'وصول كامل للمنصة' }, icon: Crown, color: '#dc2626', usersCount: 3, isSystem: true, permissions: allPermissions.map(p => p.id) },
];

const RolesModule: React.FC = () => {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const [roles, setRoles] = useState<RoleConfig[]>(initialRoles);
  const [selectedRole, setSelectedRole] = useState<RoleConfig | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingPermissions, setEditingPermissions] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [compareRoles, setCompareRoles] = useState<UserRole[]>([]);

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
    selectAll: { fr: 'Tout sélectionner', en: 'Select all', pt: 'Selecionar tudo', ar: 'تحديد الكل' },
    deselectAll: { fr: 'Tout désélectionner', en: 'Deselect all', pt: 'Desmarcar tudo', ar: 'إلغاء تحديد الكل' },
    permissionsCount: { fr: 'permissions', en: 'permissions', pt: 'permissões', ar: 'صلاحيات' },
    compare: { fr: 'Comparer', en: 'Compare', pt: 'Comparar', ar: 'مقارنة' },
    granted: { fr: 'Accordée', en: 'Granted', pt: 'Concedida', ar: 'ممنوحة' },
    denied: { fr: 'Refusée', en: 'Denied', pt: 'Negada', ar: 'مرفوضة' },
  };

  const totalUsers = roles.reduce((a, r) => a + r.usersCount, 0);
  const totalPerms = allPermissions.length;

  const handleStartEdit = (role: RoleConfig) => {
    setEditingPermissions([...role.permissions]);
    setIsEditing(true);
  };

  const handleSavePermissions = () => {
    if (!selectedRole) return;
    setRoles(prev => prev.map(r => r.key === selectedRole.key ? { ...r, permissions: editingPermissions } : r));
    setSelectedRole(prev => prev ? { ...prev, permissions: editingPermissions } : null);
    setIsEditing(false);
    toast({ title: tt({ fr: 'Permissions mises à jour', en: 'Permissions updated', pt: 'Permissões atualizadas', ar: 'تم تحديث الصلاحيات' }, lang) });
  };

  const togglePermission = (permId: string) => {
    setEditingPermissions(prev => prev.includes(permId) ? prev.filter(p => p !== permId) : [...prev, permId]);
  };

  const toggleCompareRole = (roleKey: UserRole) => {
    setCompareRoles(prev => prev.includes(roleKey) ? prev.filter(r => r !== roleKey) : prev.length < 4 ? [...prev, roleKey] : prev);
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
            <div className="flex gap-6">
              {/* Role cards */}
              <div className={`space-y-3 transition-all ${selectedRole ? 'w-2/5' : 'w-full'}`}>
                {roles.map(role => {
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
                              <Button size="sm" onClick={handleSavePermissions}>{tt(labels.save, lang)}</Button>
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
          </TabsContent>

          {/* MATRIX */}
          <TabsContent value="matrix" className="mt-4">
            <Card>
              <CardContent className="pt-6 overflow-x-auto">
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
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default RolesModule;
