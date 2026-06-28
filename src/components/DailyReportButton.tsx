import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Loader2, Download } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const DailyReportButton: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateDailyPDF = async () => {
    setIsGenerating(true);
    try {
      // 1. Définir la fenêtre de temps : "Hier" de 00h00 à 23h59
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // 2. Récupérer les dépistages d'hier
      const { data: screenings, error: screenErr } = await supabase
        .from('screenings')
        .select('id, child_name, risk_level, score, structure, parent_contact, form_type')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString());

      if (screenErr) throw screenErr;

      // 3. Récupérer les orientations d'hier (si la table referrals existe)
      const { data: referrals, error: refErr } = await supabase
        .from('referrals')
        .select('id, status')
        .gte('created_at', yesterday.toISOString())
        .lt('created_at', today.toISOString())
        .eq('status', 'active'); // 'active' = orienté avec succès

      if (refErr && refErr.code !== '42P01') throw refErr; // On ignore si la table n'existe pas encore

      // 4. Faire les mathématiques
      let normal = 0;
      let suspectFaible = 0;
      let moyen = 0;
      let grave = 0;

      const safeScreenings = screenings || [];
      
      safeScreenings.forEach(s => {
        const risk = (s.risk_level || '').toLowerCase();
        if (risk.includes('normal')) normal++;
        else if (risk.includes('suspect') || risk.includes('faible')) suspectFaible++;
        else if (risk.includes('moyen')) moyen++;
        else if (risk.includes('élevé') || risk.includes('grave')) grave++;
      });

      const total = safeScreenings.length;
      const orientes = referrals ? referrals.length : 0;
      const dateStr = yesterday.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

      // 5. Générer le contenu HTML du PDF
      const printContent = `
        <html>
          <head>
            <title>Point Journalier - ${dateStr}</title>
            <style>
              body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1e293b; line-height: 1.6; }
              .header { text-align: center; border-bottom: 3px solid #0056A8; padding-bottom: 20px; margin-bottom: 40px; }
              .title { color: #0056A8; font-size: 28px; font-weight: 900; text-transform: uppercase; margin: 0; }
              .subtitle { font-size: 16px; color: #64748b; margin-top: 10px; }
              
              .stats-grid { display: flex; flex-wrap: wrap; gap: 15px; margin-bottom: 40px; }
              .stat-box { border: 1px solid #e2e8f0; border-radius: 12px; padding: 15px 20px; flex: 1; min-width: 200px; background: #f8fafc; }
              .stat-value { font-size: 24px; font-weight: 900; color: #0f172a; margin-top: 5px; }
              
              table { w-full: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; width: 100%; }
              th { background: #0056A8; color: white; text-align: left; padding: 12px; font-weight: bold; }
              td { border-bottom: 1px solid #e2e8f0; padding: 10px 12px; }
              tr:nth-child(even) { background: #f8fafc; }
              
              .dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; margin-right: 8px; vertical-align: middle; }
              .bg-green { background-color: #10b981; }
              .bg-yellow { background-color: #f59e0b; }
              .bg-orange { background-color: #f97316; }
              .bg-red { background-color: #ef4444; }
              
              .highlight { color: #0056A8; font-weight: bold; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1 class="title">Bilan Journalier des Dépistages</h1>
              <div class="subtitle">Campagne du : <strong style="color:#0f172a; text-transform:capitalize;">${dateStr}</strong></div>
            </div>

            <h2 style="color: #0056A8; font-size: 18px;">1. Synthèse Globale</h2>
            <div class="stats-grid">
              <div class="stat-box">
                <div style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: bold;">Total Recensés</div>
                <div class="stat-value highlight">${total} enfants</div>
              </div>
              <div class="stat-box" style="border-left: 4px solid #10b981;">
                <div style="font-size: 12px; color: #64748b; font-weight: bold;"><span class="dot bg-green"></span>Développement Normal</div>
                <div class="stat-value">${normal}</div>
              </div>
              <div class="stat-box" style="border-left: 4px solid #f59e0b;">
                <div style="font-size: 12px; color: #64748b; font-weight: bold;"><span class="dot bg-yellow"></span>Risque Faible/Suspecté</div>
                <div class="stat-value">${suspectFaible}</div>
              </div>
              <div class="stat-box" style="border-left: 4px solid #f97316;">
                <div style="font-size: 12px; color: #64748b; font-weight: bold;"><span class="dot bg-orange"></span>Risque Moyen</div>
                <div class="stat-value">${moyen}</div>
              </div>
              <div class="stat-box" style="border-left: 4px solid #ef4444; background: #fef2f2;">
                <div style="font-size: 12px; color: #ef4444; font-weight: bold;"><span class="dot bg-red"></span>Risque Grave (Élevé)</div>
                <div class="stat-value" style="color: #ef4444;">${grave}</div>
              </div>
            </div>
            
            <div class="stat-box" style="background: #eff6ff; border-color: #bfdbfe; margin-bottom: 40px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #1e3a8a;">🏥 Nombre d'enfants orientés avec succès hier :</span>
              <span style="font-size: 24px; font-weight: 900; color: #1d4ed8;">${orientes}</span>
            </div>

            <h2 style="color: #0056A8; font-size: 18px;">2. Liste Nominative pour Suivi & Recontact</h2>
            ${total === 0 ? '<p style="text-align: center; color: #94a3b8; padding: 20px;">Aucun enfant recensé à cette date.</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Nom de l'enfant</th>
                  <th>Contact Parent</th>
                  <th>Lieu / Structure</th>
                  <th>Évaluation</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                ${safeScreenings.map(s => {
                  let dotClass = 'bg-green';
                  const r = (s.risk_level || '').toLowerCase();
                  if (r.includes('suspect') || r.includes('faible')) dotClass = 'bg-yellow';
                  else if (r.includes('moyen')) dotClass = 'bg-orange';
                  else if (r.includes('élevé') || r.includes('grave')) dotClass = 'bg-red';

                  return `
                    <tr>
                      <td style="font-weight: bold;">${s.child_name}</td>
                      <td>${s.parent_contact || 'N/A'}</td>
                      <td>${s.structure || 'Non spécifié'}</td>
                      <td><span class="dot ${dotClass}"></span>${s.risk_level || 'N/A'}</td>
                      <td style="font-weight: bold;">${s.score}</td>
                    </tr>
                  `
                }).join('')}
              </tbody>
            </table>
            `}

            <div style="text-align: center; color: #94a3b8; font-size: 11px; margin-top: 50px;">
              Document généré par le système national NURIA le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}
            </div>
          </body>
        </html>
      `;

      // 6. Imprimer / Télécharger
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 250);
      }

      toast({ title: "Rapport généré", description: "Le point journalier est prêt à être sauvegardé." });
    } catch (err: any) {
      console.error(err);
      toast({ title: "Erreur de génération", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Button 
      onClick={generateDailyPDF} 
      disabled={isGenerating}
      className="bg-[#0056A8] hover:bg-[#004080] text-white font-bold"
    >
      {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      Télécharger le point d'hier
    </Button>
  );
};

export default DailyReportButton;