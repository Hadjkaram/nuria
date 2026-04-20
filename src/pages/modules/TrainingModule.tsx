import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Video, FileText, Award, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'document' | 'quiz';
}

interface TrainingModule {
  id: string;
  title: string;
  lessons: Lesson[];
}

const typeIcons: Record<string, React.ElementType> = { 
  video: Video, 
  document: FileText, 
  quiz: Award 
};

const TrainingModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [completedLessons, setCompleted] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);

  // --- 1. LECTURE DEPUIS SUPABASE ---
  const fetchData = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Récupérer modules et leçons
      const { data: modsData, error: modsError } = await supabase
        .from('training_modules')
        .select(`
          id, title, order_index,
          training_lessons (id, title, type, order_index)
        `)
        .order('order_index', { ascending: true });

      if (modsError) throw modsError;

      // Récupérer la progression de l'utilisateur
      const { data: progressData, error: progressError } = await supabase
        .from('user_training_progress')
        .select('lesson_id')
        .eq('user_id', user.id);

      if (progressError) throw progressError;

      if (modsData) {
        const formatted = modsData.map((m: any) => ({
          id: m.id,
          title: m.title,
          lessons: (m.training_lessons || []).sort((a: any, b: any) => a.order_index - b.order_index)
        }));
        setModules(formatted);
      }

      if (progressData) {
        setCompleted(new Set(progressData.map(p => p.lesson_id)));
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: "Impossible de charger la formation.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  // --- 2. MISE À JOUR DE LA PROGRESSION ---
  const toggleComplete = async (lessonId: string) => {
    if (!user || isActionLoading) return;
    setIsActionLoading(lessonId);

    const isCurrentlyDone = completedLessons.has(lessonId);

    try {
      if (isCurrentlyDone) {
        // Supprimer la progression
        const { error } = await supabase
          .from('user_training_progress')
          .delete()
          .eq('user_id', user.id)
          .eq('lesson_id', lessonId);
        if (error) throw error;

        setCompleted(prev => {
          const next = new Set(prev);
          next.delete(lessonId);
          return next;
        });
      } else {
        // Ajouter la progression
        const { error } = await supabase
          .from('user_training_progress')
          .insert([{ user_id: user.id, lesson_id: lessonId }]);
        if (error) throw error;

        setCompleted(prev => new Set(prev).add(lessonId));
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: "Échec de la mise à jour.", variant: "destructive" });
    } finally {
      setIsActionLoading(null);
    }
  };

  const totalLessons = modules.reduce((a, m) => a + m.lessons.length, 0);
  const completedCount = completedLessons.size;
  const progressPercent = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;

  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold mb-2">{t('module.training')}</h1>
      <p className="text-muted-foreground mb-6">Centre de formation en neurodéveloppement</p>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <>
          <div className="bg-card rounded-xl p-5 border border-border mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>Progression globale</span>
              <span className="font-medium">{completedCount}/{totalLessons}</span>
            </div>
            <div className="w-full bg-muted rounded-full h-3">
              <div 
                className="h-3 rounded-full bg-primary transition-all duration-500" 
                style={{ width: `${progressPercent}%` }} 
              />
            </div>
          </div>

          <div className="space-y-6">
            {modules.length === 0 ? (
              <div className="text-center py-10 bg-card border rounded-xl border-dashed">
                <p className="text-muted-foreground">Aucun module de formation disponible pour le moment.</p>
              </div>
            ) : modules.map(m => {
              const modCompleted = m.lessons.filter(l => completedLessons.has(l.id)).length;
              return (
                <div key={m.id} className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="p-5 border-b border-border bg-muted/20">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-foreground">{m.title}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {modCompleted}/{m.lessons.length}
                      </Badge>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {m.lessons.map(l => {
                      const Icon = typeIcons[l.type] || FileText;
                      const done = completedLessons.has(l.id);
                      const loading = isActionLoading === l.id;
                      
                      return (
                        <button 
                          key={l.id} 
                          onClick={() => toggleComplete(l.id)} 
                          disabled={!!isActionLoading}
                          className="w-full flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors text-left group"
                        >
                          {loading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
                          ) : done ? (
                            <CheckCircle2 className="h-5 w-5 text-secondary flex-shrink-0" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0 group-hover:text-primary" />
                          )}
                          
                          <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                          
                          <span className={`text-sm flex-1 ${done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                            {l.title}
                          </span>
                          
                          <Badge variant="secondary" className="text-[9px] uppercase px-1.5 h-5">
                            {l.type}
                          </Badge>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default TrainingModule;