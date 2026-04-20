import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogIn, Loader2 } from 'lucide-react';

const AgentLoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ROUTAGE INTELLIGENT : Redirection automatique selon le rôle
  useEffect(() => {
    if (user) {
      // Si c'est le chef (Coordination programme, Admin, SuperAdmin, ou Superviseur)
      if (user.role === 'program' || user.role === 'orgAdmin' || user.role === 'superAdmin' || user.role === 'supervisor') {
        navigate('/dashboard/analysis');
      } 
      // Sinon, c'est un agent terrain
      else {
        navigate('/recensement');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const success = await login(email, password);
      setLoading(false);
      
      if (!success) {
        setError("Identifiants incorrects. Veuillez contacter l'administrateur.");
      }
      // La redirection se fera via le useEffect ci-dessus si le login réussit
    } catch (err) {
      setLoading(false);
      setError("Une erreur technique est survenue.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      
      {/* FOND D'ÉCRAN LOGO TRANSPARENT */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
        <img src="/logo-nuria.png" alt="" className="w-[120%] md:w-[80%] object-contain" />
      </div>

      {/* BOÎTE DE CONNEXION */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-border relative z-10">
        
        {/* En-tête de la carte avec le logo */}
        <div className="bg-[#0056A8] px-6 py-8 text-center">
          <div className="mx-auto w-20 h-20 bg-white rounded-full flex items-center justify-center mb-5 shadow-inner overflow-hidden">
            <img src="/logo-nuria.png" alt="NURIA Logo" className="w-[85%] object-contain" />
          </div>
          <h1 className="text-2xl font-black text-white mb-1 tracking-tight">Portail Agent NURIA</h1>
          <p className="text-[#00A3E0] font-semibold text-sm">Accès sécurisé pour le recensement terrain</p>
        </div>

        {/* Formulaire */}
        <div className="p-6 sm:p-8">
          {error && (
            <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg mb-6 text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-bold text-slate-700">Identifiant Agent (Email)</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="agent@nuria.care" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-slate-50 focus:border-[#0056A8] focus:ring-[#0056A8]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-bold text-slate-700">Code d'accès secret</Label>
              <Input 
                id="password"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-slate-50 focus:border-[#0056A8] focus:ring-[#0056A8]"
              />
            </div>

            <Button type="submit" className="w-full h-14 text-lg font-bold mt-4 bg-[#00A3E0] hover:bg-[#0082b3] shadow-md transition-colors" disabled={loading}>
              {loading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-6 w-6 mr-3" /> 
                  Ouvrir la session
                </>
              )}
            </Button>
          </form>
        </div>
        
        {/* Footer professionnel */}
        <div className="bg-slate-50 px-6 py-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400 font-medium">
            Système propriétaire NURIA - Usage strictement professionnel. <br/>
            Contactez le support technique en cas de perte de tablette.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentLoginPage;