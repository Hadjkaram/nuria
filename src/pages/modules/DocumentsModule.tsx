import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext'; // <-- AJOUT
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  FileText, Search, Plus, Download, Eye, Trash2, Clock, FolderOpen,
  Upload, File, FileImage, FileSpreadsheet, Filter, SortAsc, Share2,
  CheckCircle2, AlertCircle, Archive, Star, StarOff, Loader2 // <-- AJOUT Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // <-- AJOUT
import { useToast } from '@/hooks/use-toast'; // <-- AJOUT

type DocCategory = 'all' | 'clinical' | 'administrative' | 'report' | 'template' | 'consent';
type DocStatus = 'all' | 'draft' | 'final' | 'archived' | 'pending_signature';

interface Document {
  id: string;
  title: string;
  category: DocCategory;
  status: DocStatus;
  type: string;
  size: string;
  author: string;
  patient?: string;
  createdAt: string;
  updatedAt: string;
  starred: boolean;
  tags: string[];
}

const categoryLabels: Record<string, Record<string, string>> = {
  all: { fr: 'Tous', en: 'All', pt: 'Todos', ar: 'الكل' },
  clinical: { fr: 'Clinique', en: 'Clinical', pt: 'Clínico', ar: 'سريري' },
  administrative: { fr: 'Administratif', en: 'Administrative', pt: 'Administrativo', ar: 'إداري' },
  report: { fr: 'Rapport', en: 'Report', pt: 'Relatório', ar: 'تقرير' },
  template: { fr: 'Modèle', en: 'Template', pt: 'Modelo', ar: 'نموذج' },
  consent: { fr: 'Consentement', en: 'Consent', pt: 'Consentimento', ar: 'موافقة' },
};

const statusLabels: Record<string, Record<string, string>> = {
  all: { fr: 'Tous', en: 'All', pt: 'Todos', ar: 'الكل' },
  draft: { fr: 'Brouillon', en: 'Draft', pt: 'Rascunho', ar: 'مسودة' },
  final: { fr: 'Finalisé', en: 'Final', pt: 'Finalizado', ar: 'نهائي' },
  archived: { fr: 'Archivé', en: 'Archived', pt: 'Arquivado', ar: 'مؤرشف' },
  pending_signature: { fr: 'En attente signature', en: 'Pending signature', pt: 'Aguardando assinatura', ar: 'بانتظار التوقيع' },
};

const statusStyles: Record<string, string> = {
  draft: 'bg-amber-100 text-amber-800 border-amber-200',
  final: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  archived: 'bg-muted text-muted-foreground border-border',
  pending_signature: 'bg-blue-100 text-blue-800 border-blue-200',
};

const fileIcons: Record<string, React.ReactNode> = {
  PDF: <File className="h-5 w-5 text-red-500" />,
  DOCX: <FileText className="h-5 w-5 text-blue-500" />,
  XLSX: <FileSpreadsheet className="h-5 w-5 text-emerald-500" />,
  IMG: <FileImage className="h-5 w-5 text-purple-500" />,
};

const DocumentsModule: React.FC = () => {
  const { lang } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocCategory>('all');
  const [statusFilter, setStatusFilter] = useState<DocStatus>('all');
  const [documents, setDocuments] = useState<Document[]>([]); // <-- Vide au lieu des fausses données
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newDoc, setNewDoc] = useState({ title: '', category: 'clinical' as DocCategory, description: '', patient: '' });

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      
      if (data) {
        const formattedDocs: Document[] = data.map(d => ({
          id: d.id,
          title: d.title,
          category: d.category as DocCategory,
          status: d.status as DocStatus,
          type: d.type,
          size: d.size,
          author: d.author,
          patient: d.patient || undefined,
          createdAt: new Date(d.created_at).toISOString().split('T')[0],
          updatedAt: new Date(d.updated_at).toISOString().split('T')[0],
          starred: d.starred,
          tags: d.tags || []
        }));
        setDocuments(formattedDocs);
      }
    } catch (err) {
      console.error(err);
      toast({ title: "Erreur", description: "Impossible de charger les documents.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const filtered = documents.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.author.toLowerCase().includes(search.toLowerCase()) ||
      (d.patient && d.patient.toLowerCase().includes(search.toLowerCase())) ||
      d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = categoryFilter === 'all' || d.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || d.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const stats = {
    total: documents.length,
    drafts: documents.filter(d => d.status === 'draft').length,
    pending: documents.filter(d => d.status === 'pending_signature').length,
    starred: documents.filter(d => d.starred).length,
  };

  // --- 2. ACTIONS SUPABASE ---
  const toggleStar = async (id: string) => {
    const docToUpdate = documents.find(d => d.id === id);
    if (!docToUpdate) return;
    const newStarredStatus = !docToUpdate.starred;

    // Mise à jour optimiste UI
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, starred: newStarredStatus } : d));
    if (selectedDoc?.id === id) setSelectedDoc(prev => prev ? { ...prev, starred: newStarredStatus } : null);

    // Mise à jour DB
    await supabase.from('documents').update({ starred: newStarredStatus }).eq('id', id);
  };

  const deleteDoc = async (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
    
    await supabase.from('documents').delete().eq('id', id);
    toast({ title: "Supprimé", description: "Le document a été supprimé." });
  };

  const archiveDoc = async (id: string) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: 'archived' as DocStatus } : d));
    if (selectedDoc?.id === id) setSelectedDoc(prev => prev ? { ...prev, status: 'archived' } : null);

    await supabase.from('documents').update({ status: 'archived' }).eq('id', id);
    toast({ title: "Archivé", description: "Le document a été archivé." });
  };

  const finalizeDoc = async (id: string) => {
    const today = new Date().toISOString().split('T')[0];
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status: 'final' as DocStatus, updatedAt: today } : d));
    if (selectedDoc?.id === id) setSelectedDoc(prev => prev ? { ...prev, status: 'final' } : null);

    await supabase.from('documents').update({ status: 'final', updated_at: new Date().toISOString() }).eq('id', id);
    toast({ title: "Finalisé", description: "Le document est finalisé." });
  };

  const handleUpload = async () => {
    if (!newDoc.title.trim()) return;
    setIsSubmitting(true);

    try {
      const payload = {
        user_id: user?.id,
        title: newDoc.title,
        category: newDoc.category,
        status: 'draft',
        type: 'PDF', // Simulons un PDF par défaut
        size: '124 KB', // Simulé
        author: user?.firstName ? `${user.firstName} ${user.lastName}` : 'Moi',
        patient: newDoc.patient || null,
        starred: false,
        tags: []
      };

      const { error } = await supabase.from('documents').insert([payload]);
      if (error) throw error;

      setShowUpload(false);
      setNewDoc({ title: '', category: 'clinical', description: '', patient: '' });
      toast({ title: "Succès", description: "Document créé avec succès." });
      fetchDocuments();
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const labels = {
    fr: { title: 'Documents', search: 'Rechercher un document...', upload: 'Nouveau document', total: 'Total', drafts: 'Brouillons', pending: 'En attente', starred: 'Favoris', details: 'Détails du document', author: 'Auteur', patient: 'Patient', created: 'Créé le', updated: 'Modifié le', size: 'Taille', category: 'Catégorie', status: 'Statut', tags: 'Tags', download: 'Télécharger', share: 'Partager', archive: 'Archiver', delete: 'Supprimer', finalize: 'Finaliser', docTitle: 'Titre du document', description: 'Description', create: 'Créer', cancel: 'Annuler', noResults: 'Aucun document trouvé', actions: 'Actions' },
    en: { title: 'Documents', search: 'Search documents...', upload: 'New document', total: 'Total', drafts: 'Drafts', pending: 'Pending', starred: 'Starred', details: 'Document details', author: 'Author', patient: 'Patient', created: 'Created', updated: 'Updated', size: 'Size', category: 'Category', status: 'Status', tags: 'Tags', download: 'Download', share: 'Share', archive: 'Archive', delete: 'Delete', finalize: 'Finalize', docTitle: 'Document title', description: 'Description', create: 'Create', cancel: 'Cancel', noResults: 'No documents found', actions: 'Actions' },
    pt: { title: 'Documentos', search: 'Pesquisar documentos...', upload: 'Novo documento', total: 'Total', drafts: 'Rascunhos', pending: 'Pendentes', starred: 'Favoritos', details: 'Detalhes do documento', author: 'Autor', patient: 'Paciente', created: 'Criado em', updated: 'Atualizado em', size: 'Tamanho', category: 'Categoria', status: 'Status', tags: 'Tags', download: 'Baixar', share: 'Compartilhar', archive: 'Arquivar', delete: 'Excluir', finalize: 'Finalizar', docTitle: 'Título do documento', description: 'Descrição', create: 'Criar', cancel: 'Cancelar', noResults: 'Nenhum documento encontrado', actions: 'Ações' },
    ar: { title: 'المستندات', search: 'البحث في المستندات...', upload: 'مستند جديد', total: 'الإجمالي', drafts: 'المسودات', pending: 'قيد الانتظار', starred: 'المفضلة', details: 'تفاصيل المستند', author: 'المؤلف', patient: 'المريض', created: 'تاريخ الإنشاء', updated: 'تاريخ التحديث', size: 'الحجم', category: 'الفئة', status: 'الحالة', tags: 'العلامات', download: 'تحميل', share: 'مشاركة', archive: 'أرشفة', delete: 'حذف', finalize: 'إنهاء', docTitle: 'عنوان المستند', description: 'الوصف', create: 'إنشاء', cancel: 'إلغاء', noResults: 'لم يتم العثور على مستندات', actions: 'إجراءات' },
  };
  const l = labels[lang] || labels.fr;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{l.title}</h1>
            <p className="text-muted-foreground text-sm">{stats.total} documents</p>
          </div>
          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />{l.upload}</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />{l.upload}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <Label>{l.docTitle} *</Label>
                  <Input value={newDoc.title} onChange={e => setNewDoc(p => ({ ...p, title: e.target.value }))} placeholder={l.docTitle} className="mt-1" />
                </div>
                <div>
                  <Label>{l.category}</Label>
                  <Select value={newDoc.category} onValueChange={v => setNewDoc(p => ({ ...p, category: v as DocCategory }))}>
                    <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {(['clinical', 'administrative', 'report', 'template', 'consent'] as DocCategory[]).map(c => (
                        <SelectItem key={c} value={c}>{categoryLabels[c][lang]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{l.patient}</Label>
                  <Input value={newDoc.patient} onChange={e => setNewDoc(p => ({ ...p, patient: e.target.value }))} placeholder={l.patient} className="mt-1" />
                </div>
                <div>
                  <Label>{l.description}</Label>
                  <Textarea value={newDoc.description} onChange={e => setNewDoc(p => ({ ...p, description: e.target.value }))} className="mt-1" rows={3} />
                </div>
                {/* Simulated file drop zone */}
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center text-muted-foreground hover:border-primary/50 transition-colors cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm">Glisser-déposer ou cliquer pour sélectionner</p>
                  <p className="text-xs mt-1">PDF, DOCX, XLSX, images (max 25 MB)</p>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowUpload(false)}>{l.cancel}</Button>
                  <Button onClick={handleUpload} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {l.create}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: l.total, value: stats.total, icon: FolderOpen, color: 'text-primary' },
            { label: l.drafts, value: stats.drafts, icon: Clock, color: 'text-amber-500' },
            { label: l.pending, value: stats.pending, icon: AlertCircle, color: 'text-blue-500' },
            { label: l.starred, value: stats.starred, icon: Star, color: 'text-yellow-500' },
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
          <Select value={categoryFilter} onValueChange={v => setCategoryFilter(v as DocCategory)}>
            <SelectTrigger className="w-full sm:w-44"><Filter className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(categoryLabels).map(c => (
                <SelectItem key={c} value={c}>{categoryLabels[c][lang]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={v => setStatusFilter(v as DocStatus)}>
            <SelectTrigger className="w-full sm:w-44"><SortAsc className="h-4 w-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(statusLabels).map(s => (
                <SelectItem key={s} value={s}>{statusLabels[s][lang]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Content: list + detail */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document list */}
          <div className="lg:col-span-2 space-y-2">
            {isLoading ? (
              <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : filtered.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground"><FileText className="h-12 w-12 mx-auto mb-3 opacity-30" /><p>{l.noResults}</p></CardContent></Card>
            ) : filtered.map(doc => (
              <Card
                key={doc.id}
                className={`cursor-pointer transition-all hover:shadow-md ${selectedDoc?.id === doc.id ? 'ring-2 ring-primary' : ''}`}
                onClick={() => setSelectedDoc(doc)}
              >
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="flex-shrink-0">{fileIcons[doc.type] || <File className="h-5 w-5 text-muted-foreground" />}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-foreground truncate">{doc.title}</p>
                      {doc.starred && <Star className="h-3.5 w-3.5 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                      <span>{doc.author}</span>
                      {doc.patient && <><span>•</span><span>{doc.patient}</span></>}
                      <span>•</span><span>{doc.updatedAt}</span>
                      <span>•</span><span>{doc.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge className={`text-xs ${statusStyles[doc.status] || ''}`}>{statusLabels[doc.status]?.[lang]}</Badge>
                    <Badge variant="outline" className="text-xs">{categoryLabels[doc.category]?.[lang]}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detail panel */}
          <div>
            {selectedDoc ? (
              <Card className="sticky top-20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    {fileIcons[selectedDoc.type]}
                    <span className="truncate">{selectedDoc.title}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2 flex-wrap">
                    <Badge className={statusStyles[selectedDoc.status]}>{statusLabels[selectedDoc.status]?.[lang]}</Badge>
                    <Badge variant="outline">{categoryLabels[selectedDoc.category]?.[lang]}</Badge>
                    <Badge variant="outline">{selectedDoc.type}</Badge>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{l.author}</span><span className="font-medium text-foreground">{selectedDoc.author}</span></div>
                    {selectedDoc.patient && <div className="flex justify-between"><span className="text-muted-foreground">{l.patient}</span><span className="font-medium text-foreground">{selectedDoc.patient}</span></div>}
                    <div className="flex justify-between"><span className="text-muted-foreground">{l.created}</span><span className="text-foreground">{selectedDoc.createdAt}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{l.updated}</span><span className="text-foreground">{selectedDoc.updatedAt}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{l.size}</span><span className="text-foreground">{selectedDoc.size}</span></div>
                  </div>

                  {selectedDoc.tags.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1.5">{l.tags}</p>
                      <div className="flex gap-1 flex-wrap">
                        {selectedDoc.tags.map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase">{l.actions}</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button size="sm" variant="outline" className="text-xs"><Eye className="h-3.5 w-3.5 mr-1" />{l.details}</Button>
                      <Button size="sm" variant="outline" className="text-xs"><Download className="h-3.5 w-3.5 mr-1" />{l.download}</Button>
                      <Button size="sm" variant="outline" className="text-xs"><Share2 className="h-3.5 w-3.5 mr-1" />{l.share}</Button>
                      <Button size="sm" variant="outline" className="text-xs" onClick={() => toggleStar(selectedDoc.id)}>
                        {selectedDoc.starred ? <StarOff className="h-3.5 w-3.5 mr-1" /> : <Star className="h-3.5 w-3.5 mr-1" />}
                        {selectedDoc.starred ? 'Retirer' : 'Favori'}
                      </Button>
                    </div>
                    {selectedDoc.status === 'draft' && (
                      <Button size="sm" className="w-full text-xs" onClick={() => finalizeDoc(selectedDoc.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1" />{l.finalize}
                      </Button>
                    )}
                    <div className="flex gap-2">
                      {selectedDoc.status !== 'archived' && (
                        <Button size="sm" variant="outline" className="flex-1 text-xs" onClick={() => archiveDoc(selectedDoc.id)}>
                          <Archive className="h-3.5 w-3.5 mr-1" />{l.archive}
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" className="flex-1 text-xs" onClick={() => deleteDoc(selectedDoc.id)}>
                        <Trash2 className="h-3.5 w-3.5 mr-1" />{l.delete}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{lang === 'fr' ? 'Sélectionnez un document pour voir les détails' : lang === 'en' ? 'Select a document to view details' : lang === 'pt' ? 'Selecione um documento para ver os detalhes' : 'اختر مستندًا لعرض التفاصيل'}</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DocumentsModule;