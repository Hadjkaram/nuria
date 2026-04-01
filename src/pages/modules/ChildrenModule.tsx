import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Baby, Calendar, User, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Child {
  id: string;
  first_name: string;
  last_name: string;
  dob: string;
  gender: string;
  parent_name: string;
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
  
  // États de l'application
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // État du formulaire
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: '',
    parentName: ''
  });

  // --- 1. LECTURE (Select) : Récupérer les enfants depuis Supabase ---
  const fetchChildren = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChildrenList(data || []);
    } catch (error: any) {
      toast({ title: "Erreur de chargement", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les données au montage du composant
  useEffect(() => {
    fetchChildren();
  }, [user]);

  // --- 2. ÉCRITURE (Insert) : Ajouter un nouvel enfant ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.firstName || !formData.lastName || !formData.dob || !formData.gender || !formData.parentName) {
      toast({ title: "Attention", description: "Veuillez remplir tous les champs obligatoires.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('children').insert([{
        user_id: user?.id,
        first_name: formData.firstName,
        last_name: formData.lastName,
        dob: formData.dob,
        gender: formData.gender,
        parent_name: formData.parentName,
        status: 'active'
      }]);

      if (error) throw error;

      toast({ title: "Succès", description: "L'enfant a été ajouté avec succès." });
      setShowForm(false);
      setFormData({ firstName: '', lastName: '', dob: '', gender: '', parentName: '' }); // Reset
      fetchChildren(); // Rafraîchir la liste affichée
    } catch (error: any) {
      toast({ title: "Erreur d'ajout", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      {/* En-tête */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Baby className="h-6 w-6 text-primary" /> 
            Dossiers Patients / Enfants
          </h1>
          <p className="text-muted-foreground">Gérez la liste des enfants suivis</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Nouveau dossier
        </Button>
      </div>

      {/* Liste des enfants */}
      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {childrenList.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-card border rounded-xl">
              <Baby className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-3" />
              <p className="text-muted-foreground">Aucun enfant n'est enregistré pour le moment.</p>
              <Button variant="link" onClick={() => setShowForm(true)}>Ajouter le premier enfant</Button>
            </div>
          ) : (
            childrenList.map((child) => (
              <div key={child.id} className="bg-card rounded-xl p-5 border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-lg">
                    {child.first_name[0]}{child.last_name[0]}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[child.status] || 'bg-gray-100 text-gray-700'}`}>
                    {child.status}
                  </span>
                </div>
                <h3 className="font-semibold text-lg">{child.first_name} {child.last_name}</h3>
                <div className="space-y-1 mt-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2"><Calendar className="h-3.5 w-3.5" /> Né(e) le: {child.dob}</p>
                  <p className="flex items-center gap-2"><User className="h-3.5 w-3.5" /> Parent: {child.parent_name}</p>
                  <p>Genre: {child.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modal / Popup d'ajout */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un nouvel enfant</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Prénom *</Label>
                <Input required value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Nom *</Label>
                <Input required value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
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

            <div className="space-y-2">
              <Label>Nom du parent / tuteur *</Label>
              <Input required value={formData.parentName} onChange={(e) => setFormData({...formData, parentName: e.target.value})} />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Enregistrer
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ChildrenModule;