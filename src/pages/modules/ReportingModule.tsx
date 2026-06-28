import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useLanguage } from '@/i18n/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, FileBarChart, ChevronDown, Presentation, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Importation du moteur PowerPoint
import pptxgen from "pptxgenjs";

// --- COMPOSANT DE TÉLÉCHARGEMENT DE RAPPORTS ---
const ReportDownloader: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const removeDuplicates = (data: any[]) => {
    const uniqueData: any[] = [];
    const seenNames = new Set();
    data.forEach(item => {
      const childName = (item.child_name || 'inconnu').trim().toLowerCase();
      if (!seenNames.has(childName)) {
        seenNames.add(childName);
        uniqueData.push(item);
      }
    });
    return uniqueData;
  };

  const calculateStats = (filteredScreenings: any[]) => {
    const cleanData = removeDuplicates(filteredScreenings);
    let normal = 0, suspect = 0, moyen = 0, grave = 0;
    
    cleanData.forEach(s => {
      const r = (s.risk_level || '').toLowerCase();
      if (r.includes('normal')) normal++;
      else if (r.includes('moyen')) moyen++;
      else if (r.includes('élevé') || r.includes('grave') || r.includes('tnd')) grave++;
      else suspect++;
    });
    
    return {
      total: cleanData.length,
      normal, suspect, moyen, grave,
      orientes: moyen + grave,
      childrenList: cleanData 
    };
  };

  // ---------------------------------------------------------
  // FONCTION 1 : GÉNÉRATION DU POWERPOINT (PPTX)
  // ---------------------------------------------------------
  const generatePowerPoint = async () => {
    setIsGenerating(true);
    try {
      const { data: screenings, error: sErr } = await supabase.from('screenings').select('risk_level, created_at, child_name');
      if (sErr) throw sErr;

      const safeScreenings = screenings || [];
      const aboboData = safeScreenings.filter(s => s.created_at?.includes('2026-04-02'));
      const yakroData = safeScreenings.filter(s => s.created_at?.includes('2026-04-11'));
      const wassakaraAvrilData = safeScreenings.filter(s => s.created_at?.includes('2026-04-23'));
      const wassakaraJuinData = safeScreenings.filter(s => s.created_at?.includes('2026-06-08') || s.created_at?.includes('2026-06-09'));

      const globalData = [...aboboData, ...yakroData, ...wassakaraAvrilData, ...wassakaraJuinData];

      const globalStats = calculateStats(globalData);
      const aboboStats = calculateStats(aboboData);
      const yakroStats = calculateStats(yakroData);
      const wassakaraAvrilStats = calculateStats(wassakaraAvrilData);
      const wassakaraJuinStats = calculateStats(wassakaraJuinData);

      const pptx = new pptxgen();
      pptx.author = "Système NURIA";
      pptx.title = "Bilan des Campagnes de Dépistage";

      const addMissionSlides = (title: string, dateInfo: string, stats: any, isGlobal: boolean = false) => {
        const slide = pptx.addSlide();
        
        slide.addImage({ 
          path: window.location.origin + "/logo-nuria.png", 
          x: 0.5, y: 0.2, w: 1.5, h: 0.7, 
          sizing: { type: "contain" } as any 
        });

        slide.addText("NURIA - Bilan de Recensement", { x: 2.2, y: 0.3, fontSize: 12, color: "64748B", bold: true });
        slide.addText(title.toUpperCase(), { x: 2.2, y: 0.6, w: 7, h: 0.5, fontSize: 26, bold: true, color: "0056A8" });
        slide.addText(dateInfo, { x: 2.2, y: 1.1, w: 7, h: 0.3, fontSize: 14, color: "64748B", italic: true });

        if (stats.total > 0) {
            slide.addChart(pptx.ChartType.doughnut, [
                {
                    name: "Risques",
                    labels: ["Normal", "Faible", "Moyen", "Grave"],
                    values: [stats.normal, stats.suspect, stats.moyen, stats.grave]
                }
            ], {
                x: 0.5, y: 1.6, w: 4.5, h: 3.2,
                showLegend: true, legendPos: "b", holeSize: 60,
                chartColors: ["10B981", "F59E0B", "F97316", "EF4444"],
                showValue: true, dataLabelColor: "FFFFFF",
                dataLabelFontSize: 12, showPercent: false
            });
        } else {
            slide.addText("Aucune donnée pour cette date", { x: 0.5, y: 2.5, w: 4.5, h: 1, align: "center", color: "94A3B8" });
        }

        slide.addShape(pptx.ShapeType.roundRect, { x: 5.5, y: 1.6, w: 4, h: 0.8, fill: { color: isGlobal ? "0056A8" : "0F172A" }, rectRadius: 0.1 });
        slide.addText(`TOTAL RECENSÉS : ${stats.total}`, { x: 5.5, y: 1.6, w: 4, h: 0.8, align: "center", fontSize: 18, bold: true, color: "FFFFFF" });

        const bw = 1.9; const bh = 0.8;
        slide.addShape(pptx.ShapeType.roundRect, { x: 5.5, y: 2.6, w: bw, h: bh, fill: { color: "F8FAFC" }, line: { color: "10B981", width: 2 }, rectRadius: 0.1 });
        slide.addText(`Normal\n${stats.normal}`, { x: 5.5, y: 2.6, w: bw, h: bh, align: "center", color: "10B981", bold: true, fontSize: 14 });

        slide.addShape(pptx.ShapeType.roundRect, { x: 7.6, y: 2.6, w: bw, h: bh, fill: { color: "F8FAFC" }, line: { color: "F59E0B", width: 2 }, rectRadius: 0.1 });
        slide.addText(`Faible\n${stats.suspect}`, { x: 7.6, y: 2.6, w: bw, h: bh, align: "center", color: "F59E0B", bold: true, fontSize: 14 });

        slide.addShape(pptx.ShapeType.roundRect, { x: 5.5, y: 3.6, w: bw, h: bh, fill: { color: "F8FAFC" }, line: { color: "F97316", width: 2 }, rectRadius: 0.1 });
        slide.addText(`Moyen\n${stats.moyen}`, { x: 5.5, y: 3.6, w: bw, h: bh, align: "center", color: "F97316", bold: true, fontSize: 14 });

        slide.addShape(pptx.ShapeType.roundRect, { x: 7.6, y: 3.6, w: bw, h: bh, fill: { color: "FEF2F2" }, line: { color: "EF4444", width: 2 }, rectRadius: 0.1 });
        slide.addText(`Grave\n${stats.grave}`, { x: 7.6, y: 3.6, w: bw, h: bh, align: "center", color: "EF4444", bold: true, fontSize: 14 });

        slide.addShape(pptx.ShapeType.roundRect, { x: 0.5, y: 5.0, w: 9, h: 0.5, fill: { color: "F0F9FF" }, line: { color: "BAE6FD", width: 1 }, rectRadius: 0.1 });
        slide.addText(`🏥 Enfants orientés vers un spécialiste (Moyen + Grave) : ${stats.orientes}`, { x: 0.5, y: 5.0, w: 9, h: 0.5, align: "center", fontSize: 14, bold: true, color: "0056A8" });

        if (stats.childrenList.length > 0) {
          const listSlide = pptx.addSlide();
          listSlide.addText(`Liste nominative - ${title}`, { x: 0.5, y: 0.3, fontSize: 18, color: "0056A8", bold: true });
          
          const tableData = [
            [
              { text: "N°", options: { bold: true, fill: { color: "0056A8" }, color: "FFFFFF" } as any },
              { text: "Nom & Prénom", options: { bold: true, fill: { color: "0056A8" }, color: "FFFFFF" } as any },
              { text: "Évaluation", options: { bold: true, fill: { color: "0056A8" }, color: "FFFFFF" } as any }
            ],
            ...stats.childrenList.map((c: any, i: number) => [
              { text: `${i + 1}` },
              { text: c.child_name || 'Inconnu' },
              { text: c.risk_level || 'N/A' }
            ])
          ];

          listSlide.addTable(tableData, {
            x: 0.5, y: 0.8, w: 9,
            autoPage: true, 
            color: "333333", fontSize: 12, 
            border: { type: "solid", color: "E2E8F0", pt: 1 },
            colW: [0.8, 5, 3.2]
          });
        }
      };

      addMissionSlides("Point Global National", "Cumul de toutes les campagnes", globalStats, true);
      addMissionSlides("Mission : Adiake", "Dates : 08 et 09 Juin 2026", wassakaraJuinStats);
      addMissionSlides("Mission : Wassakara (Avril)", "Date : Jeudi 23 Avril 2026", wassakaraAvrilStats);
      addMissionSlides("Mission : Yamoussoukro", "Date : Samedi 11 Avril 2026", yakroStats);
      addMissionSlides("Mission : Abobo", "Date : Jeudi 02 Avril 2026", aboboStats);

      await pptx.writeFile({ fileName: `NURIA_Presentation_Missions.pptx` });
      toast({ title: "Succès", description: "La présentation avec liste nominative a été générée." });
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  // ---------------------------------------------------------
  // FONCTION 2 : GÉNÉRATION DU PDF (AVEC LISTE ET STRICT)
  // ---------------------------------------------------------
  const generatePDF = async (type: 'global' | 'abobo' | 'yakro' | 'wassakara' | 'wassakara_juin') => {
    setIsGenerating(true);
    try {
      const { data: screenings, error } = await supabase.from('screenings').select('risk_level, created_at, child_name');
      if (error) throw error;

      const safeScreenings = screenings || [];
      const aboboData = safeScreenings.filter(s => s.created_at?.includes('2026-04-02'));
      const yakroData = safeScreenings.filter(s => s.created_at?.includes('2026-04-11'));
      const wassakaraAvrilData = safeScreenings.filter(s => s.created_at?.includes('2026-04-23'));
      const wassakaraJuinData = safeScreenings.filter(s => s.created_at?.includes('2026-06-08') || s.created_at?.includes('2026-06-09'));

      let finalDataToProcess: any[] = [];
      let title = "";
      let dateInfo = "";

      if (type === 'abobo') {
        finalDataToProcess = aboboData;
        title = "Bilan de Mission - Abobo"; dateInfo = "Jeudi 02 Avril 2026";
      } else if (type === 'yakro') {
        finalDataToProcess = yakroData;
        title = "Bilan de Mission - Yamoussoukro"; dateInfo = "Samedi 11 Avril 2026";
      } else if (type === 'wassakara') {
        finalDataToProcess = wassakaraAvrilData;
        title = "Bilan de Mission - Wassakara (Avril)"; dateInfo = "Jeudi 23 Avril 2026";
      } else if (type === 'wassakara_juin') {
        finalDataToProcess = wassakaraJuinData;
        title = "Bilan de Mission - Adiake"; dateInfo = "08 et 09 Juin 2026";
      } else {
        finalDataToProcess = [...aboboData, ...yakroData, ...wassakaraAvrilData, ...wassakaraJuinData];
        title = "Bilan Global Officiel"; dateInfo = "Missions : Abobo, Yamoussoukro, Wassakara, Adiake";
      }

      const stats = calculateStats(finalDataToProcess);

      const printContent = `
        <html>
          <head>
            <title>${title}</title>
            <style>
              body { font-family: 'Helvetica', Arial, sans-serif; padding: 40px; color: #334155; }
              .header { text-align: center; margin-bottom: 40px; }
              .logo { height: 80px; margin-bottom: 20px; }
              .title { color: #0056A8; font-size: 26px; font-weight: bold; text-transform: uppercase; margin: 0; }
              .date { font-size: 16px; color: #64748b; margin-top: 5px; }
              
              .stats-container { margin-top: 30px; border: 2px solid #e2e8f0; border-radius: 20px; padding: 30px; background: #f8fafc; }
              .stat-row { display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #e2e8f0; font-size: 18px; }
              .stat-row:last-child { border-bottom: none; }
              .stat-label { font-weight: 500; display: flex; align-items: center; }
              .stat-value { font-weight: 800; color: #0f172a; font-size: 22px; }
              
              .total-box { background: #0056A8; color: white; padding: 20px; border-radius: 15px; margin-bottom: 20px; text-align: center; }
              .total-box div { font-size: 14px; text-transform: uppercase; opacity: 0.8; }
              .total-box span { font-size: 36px; font-weight: 900; }
              .dot { height: 12px; width: 12px; border-radius: 50%; display: inline-block; margin-right: 10px; }
              
              .table-section { margin-top: 50px; }
              .table-title { color: #0056A8; font-size: 20px; border-bottom: 2px solid #0056A8; padding-bottom: 10px; margin-bottom: 20px; }
              table { width: 100%; border-collapse: collapse; font-size: 14px; }
              th { background-color: #0056A8; color: white; padding: 12px; text-align: left; border: 1px solid #cbd5e1; }
              td { padding: 10px 12px; border: 1px solid #cbd5e1; }
              tr:nth-child(even) { background-color: #f8fafc; }
              
              .footer { text-align: center; margin-top: 80px; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 20px; }
            </style>
          </head>
          <body>
            <div class="header">
              <img src="${window.location.origin}/logo-nuria.png" class="logo" alt="NURIA" />
              <h1 class="title">${title}</h1>
              <div class="date">${dateInfo}</div>
            </div>
            
            <div class="total-box"><div>Total des enfants recensés</div><span>${stats.total}</span></div>
            
            <div class="stats-container">
              <div class="stat-row"><span class="stat-label"><span class="dot" style="background:#10b981"></span> Développement Normal</span><span class="stat-value">${stats.normal}</span></div>
              <div class="stat-row"><span class="stat-label"><span class="dot" style="background:#f59e0b"></span> Risque Suspecté / Faible</span><span class="stat-value">${stats.suspect}</span></div>
              <div class="stat-row"><span class="stat-label"><span class="dot" style="background:#f97316"></span> Risque Moyen</span><span class="stat-value">${stats.moyen}</span></div>
              <div class="stat-row"><span class="stat-label"><span class="dot" style="background:#ef4444"></span> Risque Grave (Élevé)</span><span class="stat-value" style="color:#ef4444">${stats.grave}</span></div>
            </div>
            
            <div style="background: #eff6ff; border: 2px solid #bfdbfe; border-radius: 15px; margin-top: 20px; padding: 20px; display: flex; justify-content: space-between; align-items: center;">
              <span style="font-weight: bold; color: #1e3a8a; font-size: 18px;">🏥 Enfants orientés vers un spécialiste :</span>
              <span style="font-size: 28px; font-weight: 900; color: #1d4ed8;">${stats.orientes}</span>
            </div>

            ${stats.childrenList.length > 0 ? `
              <div class="table-section">
                <h2 class="table-title">Liste nominative des enfants recensés</h2>
                <table>
                  <thead>
                    <tr>
                      <th style="width: 50px;">N°</th>
                      <th>Nom & Prénom de l'enfant</th>
                      <th>Évaluation (Risque)</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${stats.childrenList.map((c: any, index: number) => `
                      <tr>
                        <td>${index + 1}</td>
                        <td style="font-weight: bold;">${c.child_name || 'Inconnu'}</td>
                        <td>${c.risk_level || 'N/A'}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            ` : ''}

            <div class="footer">Ce document est un rapport statistique officiel généré par la plateforme NURIA.<br>© ${new Date().getFullYear()} NURIA - Protection du Neurodéveloppement de l'Enfant.</div>
          </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
      }
    } catch (err: any) {
      toast({ title: "Erreur", description: err.message, variant: "destructive" });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="bg-[#0056A8] hover:bg-[#004080] text-white font-bold gap-2">
          {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Exporter un Bilan
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="text-emerald-700 bg-emerald-50 mt-1 pb-2">Présentation Complète</DropdownMenuLabel>
        <DropdownMenuItem onClick={generatePowerPoint} className="font-bold text-[#0056A8] cursor-pointer">
          <Presentation className="mr-2 h-5 w-5 text-[#0056A8]" /> Télécharger en PowerPoint
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-slate-400">Rapports Simples (PDF)</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => generatePDF('global')} className="cursor-pointer">
          <FileBarChart className="mr-2 h-4 w-4 text-slate-500" /> Point Global (Cumulé)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePDF('wassakara_juin')} className="cursor-pointer">
          📍 Mission Adiake (08-09 Juin)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePDF('wassakara')} className="cursor-pointer">
          📍 Mission Wassakara (23 Avril)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePDF('yakro')} className="cursor-pointer">
          📍 Mission Yakro (11 Avril)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => generatePDF('abobo')} className="cursor-pointer">
          📍 Mission Abobo (02 Avril)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// --- COMPOSANT PRINCIPAL ---
const ReportingModule: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();

  const [screeningData, setScreeningData] = useState<any[]>([]);
  const [riskDistributionData, setRiskDistributionData] = useState<any[]>([]);
  const [orientationData, setOrientationData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- NOUVEAUX ÉTATS POUR LE FILTRE ET LA DÉMOGRAPHIE ---
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [genderData, setGenderData] = useState<any[]>([]);
  const [ageData, setAgeData] = useState<any[]>([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const { data: screeningsRes, error } = await supabase.from('screenings').select('*');
        if (error) throw error;

        let screenings = screeningsRes || [];

        // Application du filtre de zone interactif
        if (selectedZone === 'abobo') screenings = screenings.filter(s => s.created_at?.includes('2026-04-02'));
        else if (selectedZone === 'yakro') screenings = screenings.filter(s => s.created_at?.includes('2026-04-11'));
        else if (selectedZone === 'wassakara_avril') screenings = screenings.filter(s => s.created_at?.includes('2026-04-23'));
        else if (selectedZone === 'wassakara_juin') screenings = screenings.filter(s => s.created_at?.includes('2026-06-08') || s.created_at?.includes('2026-06-09'));

        // 1. Initialiser le tableau des 6 derniers mois
        const last6Months: any[] = [];
        const d = new Date();
        for (let i = 5; i >= 0; i--) {
          const d2 = new Date(d.getFullYear(), d.getMonth() - i, 1);
          const monthLabel = d2.toLocaleDateString('fr-FR', { month: 'short' });
          last6Months.push({ 
            month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1).replace('.', ''), 
            m: d2.getMonth(), 
            y: d2.getFullYear(), 
            count: 0, 
            orientations: 0
          });
        }

        let normal = 0, suspect = 0, moyen = 0, grave = 0;
        let garcons = 0, filles = 0;
        let age0_2 = 0, age2_3 = 0, age3_5 = 0;

        // 2. Parcourir tous les dépistages pour remplir les graphiques
        screenings.forEach(s => {
          const r = (s.risk_level || '').toLowerCase();

          // Calcul pour le graphique circulaire (PieChart)
          if (r.includes('normal')) normal++;
          else if (r.includes('moyen')) moyen++;
          else if (r.includes('élevé') || r.includes('grave') || r.includes('tnd')) grave++;
          else suspect++;

          // Calcul pour les graphiques par mois (BarChart et LineChart)
          if (s.created_at) {
            const dt = new Date(s.created_at);
            const target = last6Months.find(m => m.m === dt.getMonth() && m.y === dt.getFullYear());
            if (target) {
              target.count += 1;
              if (r.includes('moyen') || r.includes('élevé') || r.includes('grave') || r.includes('tnd')) {
                target.orientations += 1;
              }
            }
          }

          // --- CALCUL POUR LE SEXE ---
          const g = (s.gender || '').toLowerCase();
          if (g.startsWith('m') || g.includes('gar')) garcons++;
          else if (g.startsWith('f') || g.includes('fil')) filles++;

          // --- NOUVEAU PARSEUR D'ÂGE INTELLIGENT ---
          const rawAge = s.age !== undefined ? s.age : (s.child_age !== undefined ? s.child_age : null);
          let calcAge = -1;

          if (rawAge !== null && rawAge !== '') {
            const ageStr = String(rawAge).toLowerCase();
            const match = ageStr.match(/(\d+)/); 
            
            if (match) {
              let val = parseInt(match[0], 10);
              if (ageStr.includes('mois')) {
                calcAge = val / 12;
              } else {
                calcAge = val; 
              }
            }
          } else if (s.birth_date) {
            const birthYear = new Date(s.birth_date).getFullYear();
            const currentYear = new Date().getFullYear();
            calcAge = currentYear - birthYear;
          }

          // Classement dans la bonne tranche d'âge
          if (calcAge >= 0) {
            if (calcAge <= 2) age0_2++;
            else if (calcAge <= 3.5) age2_3++; 
            else age3_5++;
          }
        });

        // Préparation des données pour le PieChart
        const rData = [
          { name: 'Normal', value: normal, color: '#10B981' },
          { name: 'Faible / Suspecté', value: suspect, color: '#F59E0B' },
          { name: 'Moyen', value: moyen, color: '#F97316' },
          { name: 'Grave / TND', value: grave, color: '#EF4444' }
        ].filter(d => d.value > 0);

        setScreeningData(last6Months.map(m => ({ month: m.month, count: m.count })));
        setOrientationData(last6Months.map(m => ({ month: m.month, orientations: m.orientations })));
        setRiskDistributionData(rData);

        // Préparation des données Démographiques
        setGenderData([
          { name: 'Garçons', value: garcons, color: '#0ea5e9' },
          { name: 'Filles', value: filles, color: '#ec4899' }
        ].filter(d => d.value > 0));

        // On injecte les données d'âge
        setAgeData([
          { range: '0-2 ans', count: age0_2 },
          { range: '2-3 ans', count: age2_3 },
          { range: '3-5 ans', count: age3_5 }
        ]);

      } catch (err: any) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [toast, selectedZone]);

  return (
    <DashboardLayout>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold">{t('module.reporting') || 'Reporting Global'}</h1>
        
        <div className="flex items-center gap-3">
          <div className="bg-white border rounded-lg flex items-center px-3 py-1 shadow-sm">
            <Filter className="h-4 w-4 text-slate-400 mr-2" />
            <select 
              value={selectedZone} 
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSelectedZone(e.target.value)}
              className="bg-transparent border-none text-sm font-semibold focus:ring-0 cursor-pointer outline-none"
            >
              <option value="all">Toutes les zones (Global)</option>
              <option value="wassakara_juin">Mission Adiake (Juin)</option>
              <option value="wassakara_avril">Mission Wassakara (Avril)</option>
              <option value="yakro">Mission Yamoussoukro</option>
              <option value="abobo">Mission Abobo</option>
            </select>
          </div>
          <ReportDownloader />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
            <div className="bg-card rounded-xl p-5 border border-border flex flex-col">
              <h3 className="font-semibold mb-4">Dépistages par mois</h3>
              <div className="flex-1 min-h-[250px]">
                {screeningData.some(d => d.count > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={screeningData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} allowDecimals={false} />
                      <Tooltip />
                      <Bar dataKey="count" name="Dépistages" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground italic">
                    Aucune donnée disponible
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border flex flex-col">
              <h3 className="font-semibold mb-4">Répartition des niveaux de risques</h3>
              <div className="flex-1 min-h-[250px]">
                {riskDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={riskDistributionData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                        {riskDistributionData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground italic">
                    Aucune donnée de diagnostic disponible
                  </div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border lg:col-span-2 flex flex-col">
              <h3 className="font-semibold mb-4">Orientations requises (Moyen & Grave)</h3>
              <div className="flex-1 min-h-[250px]">
                {orientationData.some(d => d.orientations > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={orientationData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis dataKey="month" fontSize={12} />
                      <YAxis fontSize={12} allowDecimals={false} />
                      <Tooltip />
                      <Line type="monotone" dataKey="orientations" name="Orientations requises" stroke="hsl(var(--primary))" strokeWidth={3} dot={{ r: 5 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground italic">
                    Aucune donnée d'orientation requise
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[300px]">
            
            <div className="bg-card rounded-xl p-5 border border-border flex flex-col">
              <h3 className="font-semibold mb-4">Répartition par Sexe</h3>
              <div className="flex-1 min-h-[250px]">
                {genderData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={genderData} cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} dataKey="value">
                        {genderData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground italic">Aucune donnée disponible</div>
                )}
              </div>
            </div>

            <div className="bg-card rounded-xl p-5 border border-border flex flex-col">
              <h3 className="font-semibold mb-4">Âge des Enfants</h3>
              <div className="flex-1 min-h-[250px]">
                {ageData.some(s => s.count > 0) ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ageData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="range" fontSize={12} />
                      <YAxis allowDecimals={false} fontSize={12} />
                      <Tooltip cursor={{fill: 'transparent'}} />
                      <Bar dataKey="count" name="Nombre d'enfants" fill="#6366f1" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground italic">Aucune donnée disponible</div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}
    </DashboardLayout>
  );
};

export default ReportingModule;