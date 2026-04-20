import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedDashboard: React.FC = () => {
  const { user } = useAuth();
  const [isVerifying, setIsVerifying] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVerifying(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [user]);

  if (isVerifying) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="h-8 w-8 animate-spin text-[#0056A8]" /></div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 1. Les agents de terrain sont toujours bloqués sur le recensement
  if (user.role === 'community') {
    return <Navigate to="/recensement" replace />;
  }

  // 2. CORRECTION DU PARENT : On le laisse naviguer librement dans ses menus !
  // On bloque UNIQUEMENT l'accès à la page d'accueil principale des médecins (exactement "/dashboard")
  if (user.role === 'parent' && location.pathname === '/dashboard') {
    return <Navigate to="/parent-dashboard" replace />;
  }

  // Si tout est bon, on affiche la page cliquée
  return <Outlet />;
};

export default ProtectedDashboard;