import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Baby, Calendar, User, Loader2, Search, MapPin, CheckCircle, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface Child {
  id: string;
  full_name: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  parent_name: string;
  location: string;
  status: 'active' | 'pending' | 'completed';
}

const statusColors: Record<string, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  pending: 'bg-amber-100 text-amber-700',
  completed: 'bg-blue-100 text-blue-700',
};

const ChildrenModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // VARIABLE MAGIQUE : Permet de savoir instantanément si on a affaire à un parent
  const isParent = user?.role === 'parent';

  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    parentName: isParent ? `${user?.firstName || ''} ${user?.lastName || ''}` : '', // Pré-rempli pour le parent
    location: ''
  });

  // --- 1. LECTURE : Récupérer les enfants avec filtre ---
  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('screenings')
        .select('*')
        .order('created_at', { ascending: false });

      // Si c'est un parent, on ne montre strictement que SES enfants
      if (isParent) {
        query = query.eq('parent_id', user?.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData: Child[] = (data || []).map((item: any) => {
        const nameParts = (item.child_name || '').split(' ');
        const lastName = nameParts[0] || '';
        const firstName = nameParts.slice(1).join(' ') || '';

        return {
          id: item.id,
          full_name: item.child_name || 'Inconnu',
          first_name: firstName,
          last_name: lastName,
          dob: item.dob || '',
          gender: item.gender || '',
          parent_name: item.parent_name || 'Non renseigné',
          location: item.location || item.region || 'Non renseigné',
          status: 'pending'
        };
      });

      setChildrenList(formattedData);
    } catch (error: any) {
      toast({ title: "Erreur de chargement", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, [user]);

  // --- 2. ÉCRITURE : Ajouter manuellement ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.dob || !formData.gender || !formData.parentName) {
      toast({ title: "Attention", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      // 🚨 SÉCURITÉ ABSOLUE : On récupère ton ID directement à la source chez Supabase
      const { data: { user: authUser } } = await supabase.auth.getUser();

      const fullName = `${formData.lastName.toUpperCase()} ${formData.firstName}`.trim();
      
      const { error } = await supabase.from('screenings').insert([{
        child_name: fullName,
        dob: formData.dob,
        gender: formData.gender,
        parent_name: formData.parentName,
        location: formData.location,
        risk_level: 'Non évalué',
        score: 0,
        responses: {}, // CORRECTION 1 : On envoie un JSON vide
        parent_id: isParent ? authUser?.id : null // <--- L'ID du parent est injecté ici !
      }]);

      if (error) throw error;

      toast({ title: "Succès", description: isParent ? "Votre enfant a été ajouté avec succès." : "Le dossier de l'enfant a été créé." });
      setShowForm(false);
      setFormData({ firstName: '', lastName: '', dob: '', gender: '', parentName: isParent ? `${user?.firstName || ''} ${user?.lastName || ''}` : '', location: '' }); 
      fetchChildren(); 
    } catch (error: any) {
      toast({ title: "Erreur d'ajout", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- 3. ACTION ADAPTÉE AU RÔLE ---
  const handleActionClick = (child: Child) => {
    if (isParent) {
      // Un parent veut juste voir le tableau de bord de son enfant
      navigate('/parent-dashboard');
    } else {
      // Un médecin veut ouvrir le dossier médical
      toast({ title: "Patient pris en charge", description: `Dossier clinique de ${child.full_name} ouvert.` });
      navigate('/dashboard/records');
    }
  };

  const filteredChildren = childrenList.filter(c => 
    c.full_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.parent_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    if (!name) return '??';
    const parts = name.split(' ');
    if (parts.length > 1) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          {/* TEXTES ADAPTÉS AU RÔLE */}
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Baby className="h-6 w-6 text-primary" /> 
            {isParent ? 'Dossiers de mes enfants' : 'Patients / Enfants recensés'}
          </h1>
          <p className="text-muted-foreground mt-1">
            {isParent 
              ? 'Ajoutez vos enfants pour suivre leur développement et prendre rendez-vous.' 
              : 'Sélectionnez un enfant recensé sur le terrain pour débuter son suivi.'}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> 
          {isParent ? 'Ajouter mon enfant' : 'Nouvel enfant manuel'}
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isParent ? "Rechercher parmi mes enfants..." : "Rechercher un enfant ou un parent..."}
          className="w-full pl-10 pr-4 py-3 rounded-xl border border-input bg-white text-sm shadow-sm focus:ring-2 focus:ring-primary outline-none"
        />
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-slate-500 font-medium">Chargement des dossiers...</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredChildren.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white border rounded-xl shadow-sm">
              <Baby className="h-12 w-12 mx-auto text-slate-300 mb-3" />
              <p className="text-slate-500 font-medium">
                {isParent ? "Vous n'avez pas encore ajouté d'enfant. Cliquez sur 'Ajouter mon enfant' pour commencer." : "Aucun enfant ne correspond à votre recherche."}
              </p>
            </div>
          ) : (
            filteredChildren.map((child) => (
              <div key={child.id} className="bg-white rounded-xl p-5 border shadow-sm flex flex-col justify-between hover:border-primary/50 transition-all group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 font-black text-lg">
                      {getInitials(child.full_name)}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${statusColors[child.status]}`}>
                      {isParent ? 'Inscrit' : 'Recensé'}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 line-clamp-1">{child.full_name}</h3>
                  <div className="space-y-2 mt-4 text-sm font-medium text-slate-500">
                    <p className="flex items-center gap-2"><Calendar className="h-4 w-4 text-slate-400" /> Nais. : {child.dob ? new Date(child.dob).toLocaleDateString('fr-FR') : 'Inconnue'}</p>
                    {/* On ne montre le nom du parent que si ce n'est PAS le parent (il sait déjà qui il est) */}
                    {!isParent && <p className="flex items-center gap-2"><User className="h-4 w-4 text-slate-400" /> Parent : <span className="text-slate-700 truncate">{child.parent_name}</span></p>}
                    <p className="flex items-center gap-2"><MapPin className="h-4 w-4 text-slate-400" /> Zone : {child.location}</p>
                  </div>
                </div>
                
                {/* BOUTON D'ACTION ADAPTÉ */}
                <Button 
                  className="w-full mt-6 bg-slate-100 text-slate-700 hover:bg-primary hover:text-white transition-colors" 
                  onClick={() => handleActionClick(child)}
                >
                  {isParent ? (
                    <><Eye className="h-4 w-4 mr-2 opacity-70" /> Voir le suivi</>
                  ) : (
                    <><CheckCircle className="h-4 w-4 mr-2 opacity-70" /> Prendre en charge</>
                  )}
                </Button>
              </div>
            ))
          )}
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isParent ? 'Ajouter le profil de mon enfant' : 'Ajouter un enfant manuellement'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom de famille *</Label>
                <Input required placeholder="Ex: KOFFI" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Prénom(s) *</Label>
                <Input required placeholder="Ex: Ahmed" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Date de naissance *</Label>
                <Input type="date" required value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Genre *</Label>
                <Select value={formData.gender} onValueChange={(value) => setFormData({...formData, gender: value})}>
                  <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom du parent/tuteur *</Label>
                <Input required value={formData.parentName} onChange={(e) => setFormData({...formData, parentName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Ville / Zone *</Label>
                <Input required placeholder="Ex: Abidjan" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isParent ? "Confirmer l'ajout" : "Enregistrer l'enfant"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ChildrenModule;