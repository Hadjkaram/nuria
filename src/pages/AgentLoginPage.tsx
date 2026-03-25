import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, LogIn, Loader2 } from 'lucide-react';

const AgentLoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Redirection automatique si déjà connecté avec le bon rôle
  useEffect(() => {
    if (user && user.role === 'community') {
      navigate('/recensement');
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
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-border">
        
        {/* En-tête de la carte */}
        <div className="bg-primary px-6 py-8 text-center">
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm">
            <ShieldCheck className="h-8 w-8 text-amber-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Portail Agent NURIA</h1>
          <p className="text-primary-foreground/80 text-sm">Accès sécurisé pour le recensement terrain</p>
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
              <Label htmlFor="email">Identifiant Agent (Email)</Label>
              <Input 
                id="email"
                type="email" 
                placeholder="agent@nuria.care" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 bg-slate-50"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Code d'accès secret</Label>
              <Input 
                id="password"
                type="password" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-slate-50"
              />
            </div>

            <Button type="submit" className="w-full h-12 text-base mt-4" disabled={loading}>
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" /> 
                  Ouvrir la session de terrain
                </>
              )}
            </Button>
          </form>
        </div>
        
        {/* Footer professionnel */}
        <div className="bg-slate-50 px-6 py-4 text-center border-t border-border">
          <p className="text-xs text-muted-foreground">
            Système propriétaire NURIA - Usage strictement professionnel. <br/>
            Contactez le support technique en cas de perte de tablette.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgentLoginPage;