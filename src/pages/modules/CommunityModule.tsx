import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Users, MapPin, ArrowRight, Plus, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Family {
  id: string;
  name: string;
  location: string;
  children: number;
  status: string;
}

const statusStyles: Record<string, string> = {
  suivi: 'bg-secondary/10 text-secondary',
  repéré: 'bg-accent/10 text-accent',
  orienté: 'bg-primary/10 text-primary',
};

const CommunityModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [families, setFamilies] = useState<Family[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // États pour le formulaire
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    childrenCount: 1
  });

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchFamilies = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('families')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData = data.map(item => ({
          id: item.id,
          name: item.name,
          location: item.location,
          children: item.children_count,
          status: item.status
        }));
        setFamilies(formattedData);
      }
    } catch (error: any) {
      toast({ title: "Erreur", description: "Impossible de charger les familles.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, [user]);

  // --- 2. ÉCRITURE DANS SUPABASE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      toast({ title: "Attention", description: "Veuillez remplir le nom et la localisation.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('families').insert([{
        user_id: user?.id,
        name: formData.name,
        location: formData.location,
        children_count: formData.childrenCount,
        status: 'repéré' // Statut par défaut à la création
      }]);

      if (error) throw error;

      toast({ title: "Succès", description: "La famille a été ajoutée avec succès." });
      setShowForm(false);
      setFormData({ name: '', location: '', childrenCount: 1 }); // Reset du formulaire
      fetchFamilies(); // Rafraîchir la liste affichée
    } catch (error: any) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">{t('module.community')}</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" /> Ajouter une famille
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-card rounded-xl p-5 border border-border text-center">
              <div className="text-3xl font-bold text-primary">{families.length}</div>
              <div className="text-sm text-muted-foreground">Familles suivies</div>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border text-center">
              <div className="text-3xl font-bold text-nuria-orange">{families.reduce((a, f) => a + f.children, 0)}</div>
              <div className="text-sm text-muted-foreground">Enfants repérés</div>
            </div>
            <div className="bg-card rounded-xl p-5 border border-border text-center">
              <div className="text-3xl font-bold text-secondary">{families.filter(f => f.status === 'orienté').length}</div>
              <div className="text-sm text-muted-foreground">Orientations</div>
            </div>
          </div>

          <div className="space-y-3">
            {families.length === 0 ? (
              <div className="text-center py-12 bg-card border rounded-xl text-muted-foreground">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-20" />
                <p>Aucune famille enregistrée pour le moment.</p>
                <Button variant="link" onClick={() => setShowForm(true)}>Ajouter la première famille</Button>
              </div>
            ) : (
              families.map(f => (
                <div key={f.id} className="bg-card rounded-xl p-4 border border-border card-hover flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Users className="h-5 w-5 text-primary" /></div>
                    <div>
                      <div className="font-medium">{f.name}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" /> {f.location} · {f.children} enfant(s)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles[f.status] || 'bg-gray-100 text-gray-700'}`}>{f.status}</span>
                    <Button size="sm" variant="outline"><ArrowRight className="h-3 w-3" /></Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {/* Modal / Popup d'ajout d'une famille */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter une nouvelle famille</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nom de la famille *</Label>
              <Input 
                placeholder="Ex: Famille Traoré" 
                required 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            
            <div className="space-y-2">
              <Label>Localisation (Quartier, Ville) *</Label>
              <Input 
                placeholder="Ex: Quartier Cocody, Abidjan" 
                required 
                value={formData.location} 
                onChange={(e) => setFormData({...formData, location: e.target.value})} 
              />
            </div>

            <div className="space-y-2">
              <Label>Nombre d'enfants repérés à risque</Label>
              <Input 
                type="number" 
                min="1" 
                required 
                value={formData.childrenCount} 
                onChange={(e) => setFormData({...formData, childrenCount: parseInt(e.target.value) || 1})} 
              />
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

export default CommunityModule;