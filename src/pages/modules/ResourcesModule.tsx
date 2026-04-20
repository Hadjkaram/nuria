import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import {
  Heart, BookOpen, Video, FileText, Download, ExternalLink, Search,
  Star, Clock, Eye, Filter, ChevronRight, Play, Bookmark, BookmarkCheck,
  Baby, Brain, Puzzle, GraduationCap, Users, Stethoscope, ArrowLeft, Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabase'; // <-- AJOUT
import { useToast } from '@/hooks/use-toast'; // <-- AJOUT

type ResourceCategory = 'all' | 'guides' | 'videos' | 'articles' | 'tools' | 'training';
type AgeGroup = 'all' | '0-1' | '1-3' | '3-6' | '6-12';

interface Resource {
  id: string;
  title: string;
  description: string;
  category: ResourceCategory;
  type: 'pdf' | 'video' | 'article' | 'tool' | 'infographic';
  ageGroup: AgeGroup;
  tags: string[];
  duration?: string;
  author: string;
  date: string;
  rating: number;
  views: number;
  isFeatured?: boolean;
  icon: any;
  color: string;
}

// Mapping textuel des icônes stockées en DB vers le composant Lucide
const iconMap: Record<string, React.ElementType> = {
  Baby, Brain, BookOpen, Puzzle, GraduationCap, Heart, Stethoscope, Users, FileText
};

const categoryConfig: Record<ResourceCategory, { label: string; icon: any }> = {
  all: { label: 'Tout', icon: Heart },
  guides: { label: 'Guides', icon: BookOpen },
  videos: { label: 'Vidéos', icon: Video },
  articles: { label: 'Articles', icon: FileText },
  tools: { label: 'Outils', icon: Download },
  training: { label: 'Formations', icon: GraduationCap },
};

const ageGroupLabels: Record<AgeGroup, string> = {
  all: 'Tous âges',
  '0-1': '0–12 mois',
  '1-3': '1–3 ans',
  '3-6': '3–6 ans',
  '6-12': '6–12 ans',
};

const typeIcons: Record<string, any> = {
  pdf: Download, video: Play, article: FileText, tool: ExternalLink, infographic: Eye,
};

const ResourcesModule: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();

  const [resources, setResources] = useState<Resource[]>([]); // <-- INITIALISATION VIDE
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory>('all');
  const [selectedAge, setSelectedAge] = useState<AgeGroup>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [savedResources, setSavedResources] = useState<Set<string>>(new Set()); // <-- INITIALISATION VIDE
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [showSavedOnly, setShowSavedOnly] = useState(false);

  // --- 1. LECTURE DEPUIS SUPABASE ---
  useEffect(() => {
    const fetchResources = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('resources_library')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const formatted: Resource[] = data.map(r => ({
            id: r.id,
            title: r.title,
            description: r.description,
            category: r.category as ResourceCategory,
            type: r.type as any,
            ageGroup: r.age_group as AgeGroup,
            tags: r.tags || [],
            duration: r.duration || undefined,
            author: r.author,
            date: new Date(r.publish_date).toLocaleDateString('fr-FR'),
            rating: Number(r.rating),
            views: r.views,
            isFeatured: r.is_featured,
            icon: iconMap[r.icon_name] || FileText, // Fallback si icône introuvable
            color: r.color_gradient
          }));
          setResources(formatted);
        }
      } catch (err: any) {
        toast({ title: "Erreur", description: "Impossible de charger les ressources.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };

    fetchResources();
  }, [toast]);

  const toggleSave = (id: string) => {
    setSavedResources(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const filtered = resources.filter(r => {
    if (selectedCategory !== 'all' && r.category !== selectedCategory) return false;
    if (selectedAge !== 'all' && r.ageGroup !== selectedAge && r.ageGroup !== 'all') return false;
    if (showSavedOnly && !savedResources.has(r.id)) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return r.title.toLowerCase().includes(q) || r.description.toLowerCase().includes(q) || r.tags.some(tag => tag.toLowerCase().includes(q));
    }
    return true;
  });

  const featured = resources.filter(r => r.isFeatured);

  if (selectedResource) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          <button onClick={() => setSelectedResource(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour aux ressources
          </button>

          {/* Resource detail header */}
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className={`bg-gradient-to-r ${selectedResource.color} p-8 text-white`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                    <selectedResource.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">
                      {categoryConfig[selectedResource.category]?.label}
                    </span>
                    <h1 className="text-2xl font-bold mt-2">{selectedResource.title}</h1>
                  </div>
                </div>
                <button onClick={() => toggleSave(selectedResource.id)} className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  {savedResources.has(selectedResource.id) ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> {selectedResource.rating}/5</span>
                <span className="flex items-center gap-1"><Eye className="h-4 w-4" /> {selectedResource.views} vues</span>
                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {selectedResource.date}</span>
                {selectedResource.duration && <span className="flex items-center gap-1"><Play className="h-4 w-4" /> {selectedResource.duration}</span>}
                <span className="bg-muted px-2 py-1 rounded text-xs">{ageGroupLabels[selectedResource.ageGroup]}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {selectedResource.author.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedResource.author}</p>
                  <p className="text-xs text-muted-foreground">Auteur</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <h2 className="font-semibold mb-2">Description</h2>
                <p className="text-muted-foreground leading-relaxed">{selectedResource.description}</p>
              </div>

              {/* Extended content */}
              <div>
                <h2 className="font-semibold mb-2">Contenu</h2>
                <div className="bg-muted rounded-xl p-6 space-y-3">
                  {selectedResource.type === 'video' ? (
                    <div className="aspect-video bg-foreground/5 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${selectedResource.color} flex items-center justify-center mx-auto mb-3`}>
                          <Play className="h-8 w-8 text-white ml-1" />
                        </div>
                        <p className="text-sm text-muted-foreground">Cliquez pour lire la vidéo</p>
                        {selectedResource.duration && <p className="text-xs text-muted-foreground mt-1">Durée : {selectedResource.duration}</p>}
                      </div>
                    </div>
                  ) : (
                    <>
                      <h3 className="font-medium text-sm">Sommaire :</h3>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Introduction et objectifs</li>
                        <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Fondements théoriques</li>
                        <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Guide pratique étape par étape</li>
                        <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Études de cas et exemples</li>
                        <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-primary" /> Ressources complémentaires</li>
                      </ul>
                    </>
                  )}
                </div>
              </div>

              {/* Tags */}
              <div>
                <h2 className="font-semibold mb-2">Mots-clés</h2>
                <div className="flex flex-wrap gap-2">
                  {selectedResource.tags.map(tag => (
                    <span key={tag} className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-border">
                <button className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white bg-gradient-to-r ${selectedResource.color} hover:opacity-90 transition-opacity`}>
                  {selectedResource.type === 'video' ? <><Play className="h-4 w-4" /> Regarder</> : selectedResource.type === 'pdf' ? <><Download className="h-4 w-4" /> Télécharger</> : <><ExternalLink className="h-4 w-4" /> Accéder</>}
                </button>
                <button onClick={() => toggleSave(selectedResource.id)} className="px-6 py-3 rounded-xl border border-border hover:bg-muted transition-colors flex items-center gap-2">
                  {savedResources.has(selectedResource.id) ? <><BookmarkCheck className="h-4 w-4 text-primary" /> Sauvegardé</> : <><Bookmark className="h-4 w-4" /> Sauvegarder</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">{t('sidebar.resources')}</h1>
          <p className="text-muted-foreground text-sm mt-1">Guides, vidéos et outils pour accompagner le développement de votre enfant</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
          <>
            {/* Featured carousel */}
            {featured.length > 0 && (
              <div>
                <h2 className="font-semibold mb-3 flex items-center gap-2"><Star className="h-4 w-4 text-yellow-500" /> Ressources à la une</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {featured.map(r => {
                    const Icon = r.icon;
                    return (
                      <button key={r.id} onClick={() => setSelectedResource(r)} className="text-left bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
                        <div className={`bg-gradient-to-br ${r.color} p-4 text-white`}>
                          <Icon className="h-6 w-6 mb-2 opacity-80" />
                          <h3 className="font-semibold text-sm leading-snug line-clamp-2">{r.title}</h3>
                        </div>
                        <div className="p-3">
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {r.rating}</span>
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {r.views}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Search + Filters */}
            <div className="bg-card rounded-xl border border-border p-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text" placeholder="Rechercher une ressource..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <button onClick={() => setShowSavedOnly(!showSavedOnly)} className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm transition-colors ${showSavedOnly ? 'bg-primary text-primary-foreground border-primary' : 'border-border hover:bg-muted'}`}>
                  <Bookmark className="h-4 w-4" /> Sauvegardés ({savedResources.size})
                </button>
              </div>

              {/* Category tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {(Object.keys(categoryConfig) as ResourceCategory[]).map(cat => {
                  const { label, icon: CatIcon } = categoryConfig[cat];
                  return (
                    <button key={cat} onClick={() => setSelectedCategory(cat)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                      <CatIcon className="h-3.5 w-3.5" /> {label}
                    </button>
                  );
                })}
              </div>

              {/* Age filter */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                <Filter className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                {(Object.keys(ageGroupLabels) as AgeGroup[]).map(age => (
                  <button key={age} onClick={() => setSelectedAge(age)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${selectedAge === age ? 'bg-accent text-accent-foreground' : 'bg-muted/50 text-muted-foreground hover:text-foreground'}`}>
                    {ageGroupLabels[age]}
                  </button>
                ))}
              </div>
            </div>

            {/* Results count */}
            <p className="text-sm text-muted-foreground">{filtered.length} ressource{filtered.length !== 1 ? 's' : ''} trouvée{filtered.length !== 1 ? 's' : ''}</p>

            {/* Resource grid */}
            {filtered.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-12 text-center">
                <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Aucune ressource trouvée</p>
                <p className="text-sm text-muted-foreground mt-1">Essayez de modifier vos filtres ou votre recherche</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(r => {
                  const Icon = r.icon;
                  const TypeIcon = typeIcons[r.type] || FileText;
                  return (
                    <div key={r.id} className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-shadow group">
                      <div className={`bg-gradient-to-br ${r.color} p-4 text-white relative`}>
                        <div className="flex items-start justify-between">
                          <Icon className="h-8 w-8 opacity-80" />
                          <button onClick={e => { e.stopPropagation(); toggleSave(r.id); }} className="p-1.5 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                            {savedResources.has(r.id) ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                          </button>
                        </div>
                        <h3 className="font-semibold mt-3 leading-snug line-clamp-2">{r.title}</h3>
                        <div className="flex items-center gap-2 mt-2 text-xs text-white/80">
                          <TypeIcon className="h-3 w-3" />
                          <span>{categoryConfig[r.category]?.label}</span>
                          {r.duration && <><span>•</span><span>{r.duration}</span></>}
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-2">{r.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {r.tags.slice(0, 3).map(tag => (
                            <span key={tag} className="bg-muted text-muted-foreground text-xs px-2 py-0.5 rounded-full">#{tag}</span>
                          ))}
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><Star className="h-3 w-3 text-yellow-500" /> {r.rating}</span>
                            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {r.views}</span>
                          </div>
                          <span>{ageGroupLabels[r.ageGroup]}</span>
                        </div>
                        <button onClick={() => setSelectedResource(r)} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 transition-colors">
                          Consulter <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ResourcesModule;