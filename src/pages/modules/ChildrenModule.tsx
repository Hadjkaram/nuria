import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Plus, Search, Baby, Calendar, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Child {
  id: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  parentName: string;
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
  
  // États pour la liste et l'interface
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);

  // États pour le formulaire d'ajout
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    gender: 'M',
    parentName: ''
  });

  // 1. Lire les données depuis Supabase
  const fetchChildren = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('children')
        .select('*')
        .order('first_name', { ascending: true });

      if (error) throw error;

      if (data) {
        const formattedChildren: Child[] = data.map((item) => ({
          id: item.id,
          firstName: item.first_name,
          lastName: item.last_name,
          dob: item.dob,
          gender: item.gender,
          parentName: item.parent_name,
          status: item.status as Child['status'],
        }));
        setChildrenList(formattedChildren);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des enfants:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  // 2. Ajouter un enfant dans Supabase
  const handleAddChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);

    try {
      const { error } = await supabase.from('children').insert([
        {
          first_name: formData.firstName,
          last_name: formData.lastName,
          dob: formData.dob,
          gender: formData.gender,
          parent_name: formData.parentName,
          user_id: user.id, // On relie l'enfant à l'utilisateur connecté
          status: 'active'
        }
      ]);

      if (error) throw error;

      // Si succès : on ferme la modale, on vide le formulaire et on rafraîchit la liste
      setShowForm(false);
      setFormData({ firstName: '', lastName: '', dob: '', gender: 'M', parentName: '' });
      fetchChildren();
      
    } catch (error) {
      console.error("Erreur lors de l'ajout:", error);
      alert("Une erreur est survenue lors de l'ajout du dossier.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = childrenList.filter(c => 
    c.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">{t('module.child')}</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter un enfant
        </Button>
      </div>

      <div className="bg-card rounded-xl border border-border p-4 mb-6 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Rechercher un enfant..." 
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-input bg-background outline-none focus:ring-2 focus:ring-ring"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : selectedChild ? (
        <div className="space-y-4">
          <Button variant="ghost" onClick={() => setSelectedChild(null)} className="mb-2">
            ← Retour à la liste
          </Button>
          <div className="bg-card rounded-xl p-6 border border-border">
            <h2 className="text-xl font-bold mb-2">{selectedChild.firstName} {selectedChild.lastName}</h2>
            <p className="text-muted-foreground flex items-center gap-2 mb-6">
              <Baby className="h-4 w-4" /> Date de naissance : {selectedChild.dob}
            </p>
            <div className="bg-muted rounded-lg p-6 text-center text-muted-foreground">
              Détails du dossier à venir...
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(child => (
            <button key={child.id} onClick={() => setSelectedChild(child)} className="w-full bg-card rounded-xl p-4 border border-border hover:shadow-md transition-shadow flex items-center justify-between text-left">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {child.firstName[0]}
                </div>
                <div>
                  <div className="font-medium">{child.firstName} {child.lastName}</div>
                  <div className="text-sm text-muted-foreground flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> {child.dob} · {child.parentName}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[child.status]}`}>{child.status}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-muted-foreground py-8">Aucun enfant trouvé. Commencez par en ajouter un !</p>
          )}
        </div>
      )}

      {/* --- MODALE DU FORMULAIRE D'AJOUT --- */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau dossier</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddChild} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">Prénom *</Label>
                <Input 
                  id="firstName" 
                  required 
                  value={formData.firstName}
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Nom *</Label>
                <Input 
                  id="lastName" 
                  required 
                  value={formData.lastName}
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dob">Date de naissance *</Label>
                <Input 
                  id="dob" 
                  type="date" 
                  required 
                  value={formData.dob}
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Genre</Label>
                <Select 
                  value={formData.gender} 
                  onValueChange={(value) => setFormData({...formData, gender: value})}
                >
                  <SelectTrigger id="gender" className="w-full">
                    <SelectValue placeholder="Choisir le genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="parentName">Nom du parent / tuteur *</Label>
              <Input 
                id="parentName" 
                required 
                value={formData.parentName}
                onChange={(e) => setFormData({...formData, parentName: e.target.value})}
              />
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default ChildrenModule;