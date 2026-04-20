import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

// MODIFICATION : Ajout du rôle 'supervisor' à la fin de la liste
export type UserRole = 'parent' | 'professional' | 'teacher' | 'community' | 'orgAdmin' | 'program' | 'ministry' | 'superAdmin' | 'supervisor';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (data: { email: string; password: string; firstName: string; lastName: string; role: UserRole }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer le profil complet de l'utilisateur depuis notre table "profiles"
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (data) {
      setUser({
        id: data.id,
        email: data.email,
        firstName: data.first_name, // Attention, la BDD utilise des underscores
        lastName: data.last_name,
        role: data.role as UserRole,
      });
    } else if (error) {
      console.error("Erreur lors de la récupération du profil:", error);
    }
    setLoading(false);
  };

  // Écouteur d'état d'authentification (Vérifie si l'utilisateur est déjà connecté au rechargement)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      console.error("Erreur de connexion:", error.message);
      return false;
    }
    return true; // Le useEffect se chargera de mettre à jour le state 'user'
  }, []);

  const signup = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string; role: UserRole }): Promise<boolean> => {
    // 1. Création du compte sécurisé dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
    });

    if (authError || !authData.user) {
      console.error("Erreur d'inscription:", authError?.message);
      return false;
    }

    // 2. Création du profil public dans notre table 'profiles'
    const { error: profileError } = await supabase.from('profiles').insert([
      {
        id: authData.user.id,
        email: data.email,
        first_name: data.firstName,
        last_name: data.lastName,
        role: data.role
      }
    ]);

    if (profileError) {
      console.error("Erreur lors de la création du profil:", profileError.message);
      return false;
    }

    return true;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, isAuthenticated: !!user }}>
      {/* On ne rend les enfants que lorsque le chargement initial est terminé pour éviter les clignotements */}
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};