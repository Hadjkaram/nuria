import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { BookOpen, Video, FileText, Dumbbell, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase'; // <-- AJOUT
import { useToast } from '@/hooks/use-toast'; // <-- AJOUT

// Dictionnaire pour lier le nom de l'icône en DB au composant React
const iconMap: Record<string, React.ElementType> = {
  FileText,
  Dumbbell,
  Video,
  BookOpen
};

interface Resource {
  id: string;
  title: string;
  type: string;
  category: string;
  icon: string;
}

const typeColors: Record<string, string> = {
  guide: 'bg-nuria-blue/10 text-nuria-blue',
  exercice: 'bg-nuria-green/10 text-nuria-green',
  'vidéo': 'bg-nuria-orange/10 text-nuria-orange',
};

const GuidanceModule: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [filter, setFilter] = useState<string | null>(null);
  const [resources, setResources] = useState<Resource[]>([]); // <-- INITIALISATION VIDE
  const [isLoading, setIsLoading] = useState(true);

  // --- LECTURE DEPUIS SUPABASE ---
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('guidance_resources')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formattedResources = data.map(item => ({
            id: item.id,
            title: item.title,
            type: item.type,
            category: item.category,
            icon: item.icon_name
          }));
          setResources(formattedResources);
        }
      } catch (err: any) {
        toast({ title: "Erreur", description: "Impossible de charger les ressources.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [toast]);

  const filtered = filter ? resources.filter(r => r.type === filter) : resources;
  const types = ['guide', 'exercice', 'vidéo'];

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-6">{t('module.guidance')}</h1>
      
      <div className="flex gap-2 mb-6 flex-wrap">
        <button onClick={() => setFilter(null)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${!filter ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>Tout</button>
        {types.map(tp => (
          <button key={tp} onClick={() => setFilter(tp)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors capitalize ${filter === tp ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{tp}s</button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 bg-card border rounded-xl text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p>Aucune ressource disponible pour le moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => {
            const Icon = iconMap[r.icon] || FileText; // Fallback sur FileText si l'icône n'est pas reconnue
            return (
              <div key={r.id} className="bg-card rounded-xl p-5 border border-border card-hover">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[r.type] || 'bg-slate-100 text-slate-700'}`}>{r.type}</span>
                  <span className="text-xs text-muted-foreground">{r.category}</span>
                </div>
                <Icon className="h-8 w-8 text-primary mb-3" />
                <h3 className="font-medium text-sm">{r.title}</h3>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
};

export default GuidanceModule;