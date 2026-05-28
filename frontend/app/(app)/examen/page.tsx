"use client";

import { GraduationCap, Hammer, Clock, FileText, Lock, Award, ShieldAlert } from "lucide-react";

export default function ExamenPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      
      {/* ── En-tête "En construction" ── */}
      <div className="flex flex-col items-center text-center mb-10 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
        
        {/* Icône animée */}
        <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
          <div className="w-16 h-16 bg-indigo-100 text-indigo-500 rounded-full flex items-center justify-center">
            <GraduationCap size={40} />
          </div>
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md animate-bounce">
            <Hammer size={24} className="text-secondary" />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-text mb-3">
          Centre d'Examen 🚧
        </h1>
        <p className="text-text-muted font-medium text-base sm:text-lg max-w-lg">
          Le centre de certification ouvrira bientôt ses portes ! <br className="hidden sm:block" />
          Tu pourras y passer des tests de niveau et des simulations officielles (type HSK) pour valider tes acquis.
        </p>
      </div>

      {/* ── Aperçu des examens (Flouté/Grisé) ── */}
      <div className="opacity-50 select-none pointer-events-none grayscale-[40%] transition-all flex flex-col gap-8">
        
        <div>
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 ml-2 flex items-center gap-2">
            <Award size={16} /> Certifications à venir
          </h2>
          
          {/* Liste des examens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Examen 1 : HSK */}
            <div className="bg-card border-2 border-indigo-100 rounded-2xl p-5 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 bg-indigo-100 text-indigo-700 px-3 py-1 rounded-bl-xl font-bold text-xs">
                HSK 1
              </div>
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center mb-4">
                <FileText size={24} />
              </div>
              <h3 className="text-xl font-black text-text mb-1">Simulation Officielle</h3>
              <p className="text-sm text-text-muted font-medium mb-4">
                Entraîne-toi dans les conditions réelles de l'examen officiel de chinois.
              </p>
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <Clock size={14} /> 35 min
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <FileText size={14} /> 40 questions
                </div>
              </div>
              <div className="w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-slate-200">
                <Lock size={16} /> Verrouillé
              </div>
            </div>

            {/* Examen 2 : Validation Interne */}
            <div className="bg-card border-2 border-border rounded-2xl p-5 relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 bg-gray-100 text-gray-500 px-3 py-1 rounded-bl-xl font-bold text-xs">
                Niveau A
              </div>
              <div className="w-12 h-12 bg-gray-50 text-gray-500 rounded-xl flex items-center justify-center mb-4">
                <ShieldAlert size={24} />
              </div>
              <h3 className="text-xl font-black text-text mb-1">Validation de Niveau</h3>
              <p className="text-sm text-text-muted font-medium mb-4">
                Un test complet et chronométré pour valider ton passage au Niveau B.
              </p>
              <div className="flex items-center gap-4 mb-5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <Clock size={14} /> 45 min
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-text-muted">
                  <FileText size={14} /> 50 questions
                </div>
              </div>
              <div className="w-full bg-slate-100 text-slate-400 font-bold py-3 rounded-xl flex items-center justify-center gap-2 border border-slate-200">
                <Lock size={16} /> Verrouillé
              </div>
            </div>

          </div>
        </div>

        {/* Mockup d'une interface d'examen */}
        <div>
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 ml-2 flex items-center gap-2">
            <FileText size={16} /> Interface d'évaluation
          </h2>
          
          <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm">
            {/* Top bar de l'examen */}
            <div className="flex items-center justify-between mb-6 border-b border-border pb-4">
              <span className="bg-red-50 border border-red-100 text-red-600 font-bold px-3 py-1.5 rounded-lg text-sm flex items-center gap-2">
                <Clock size={16} /> 34:12
              </span>
              <span className="text-text-muted font-bold text-sm">Question 12 / 40</span>
            </div>

            <p className="text-text-muted font-bold text-sm uppercase tracking-wider mb-4">
              Partie 2 : Compréhension écrite
            </p>

            <div className="bg-slate-50 border border-border rounded-2xl p-8 text-center mb-6">
              <p className="text-4xl font-black text-text mb-2" style={{ fontFamily: "'Noto Serif SC', serif" }}>
                我喜欢喝茶。
              </p>
            </div>

            <p className="font-bold text-text text-lg mb-4 text-center">
              Que signifie cette phrase ?
            </p>

            <div className="flex flex-col gap-3">
              {["J'aime boire de l'eau.", "J'aime boire du thé.", "Je voudrais un café.", "Il aime le thé."].map((ans, i) => (
                <div 
                  key={i} 
                  className={`p-4 rounded-xl border-2 font-bold transition-all ${
                    i === 1 
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                      : 'border-border bg-card text-text'
                  }`}
                >
                  {ans}
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-border flex justify-end">
               <div className="bg-indigo-600 text-white font-bold px-6 py-3 rounded-xl flex items-center gap-2">
                 Question suivante
               </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}