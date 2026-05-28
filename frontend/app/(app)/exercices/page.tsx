"use client";

import { Dumbbell, Hammer, Headphones, Mic, PenTool, CheckCircle2 } from "lucide-react";

export default function ExercicesPage() {
  // Fausses données pour l'aperçu des modules
  const mockModules = [
    { id: 1, title: "Compréhension Orale", desc: "Écoute et choisis la bonne réponse", icon: Headphones, color: "text-blue-500", bg: "bg-blue-100", border: "border-blue-200" },
    { id: 2, title: "Prononciation", desc: "Parle dans le micro et sois évalué", icon: Mic, color: "text-red-500", bg: "bg-red-100", border: "border-red-200" },
    { id: 3, title: "Grammaire", desc: "Complète les textes à trous", icon: PenTool, color: "text-green-500", bg: "bg-green-100", border: "border-green-200" },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      
      {/* ── En-tête "En construction" ── */}
      <div className="flex flex-col items-center text-center mb-10 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
        
        {/* Icône animée */}
        <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
          <Dumbbell size={64} className="text-primary opacity-40" />
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md animate-bounce">
            <Hammer size={24} className="text-secondary" />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-text mb-3">
          Le Gymnase 🚧
        </h1>
        <p className="text-text-muted font-medium text-base sm:text-lg max-w-lg">
          Ton espace d'entraînement intensif est en préparation ! <br className="hidden sm:block" />
          Bientôt, tu pourras cibler tes faiblesses avec des exercices spécifiques hors des leçons classiques.
        </p>
      </div>

      {/* ── Aperçu des futurs exercices (Flouté/Grisé) ── */}
      <div className="opacity-50 select-none pointer-events-none grayscale-[40%] transition-all">
        
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 ml-2">
          Aperçu des modules d'entraînement
        </h2>
        
        {/* Grille des types d'exercices */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {mockModules.map((mod) => {
            const Icon = mod.icon;
            return (
              <div key={mod.id} className={`bg-card border-2 rounded-2xl p-5 ${mod.border}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${mod.bg} ${mod.color}`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-text text-lg leading-tight mb-1">{mod.title}</h3>
                <p className="text-xs text-text-muted font-medium">{mod.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Maquette d'un exercice type "Texte à trous" */}
        <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 ml-2">
          Exemple d'exercice quotidien
        </h2>
        
        <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-lg">
              Grammaire · Facile
            </span>
            <span className="text-text-muted font-bold text-sm">1 / 10</span>
          </div>
          
          <p className="text-lg font-bold text-text mb-4 text-center">
            Complète la phrase suivante :
          </p>
          
          <div className="flex justify-center items-center gap-2 mb-8 text-2xl sm:text-3xl font-black text-text">
            <span>你</span>
            <div className="w-16 h-12 border-b-4 border-dashed border-border mx-1"></div>
            <span>吗 ？</span>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 border-2 border-border rounded-xl font-bold text-center bg-card text-text">
              好 (hǎo)
            </div>
            <div className="p-4 border-2 border-green-400 rounded-xl font-bold text-center bg-green-50 text-green-700 flex items-center justify-center gap-2 relative">
              <CheckCircle2 size={20} className="absolute left-4" />
              忙 (máng)
            </div>
            <div className="p-4 border-2 border-border rounded-xl font-bold text-center bg-card text-text">
              叫 (jiào)
            </div>
            <div className="p-4 border-2 border-border rounded-xl font-bold text-center bg-card text-text">
              是 (shì)
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}