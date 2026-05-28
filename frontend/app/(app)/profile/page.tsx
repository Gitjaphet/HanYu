"use client";

import { User, Hammer, Zap, BookOpen, Award, GraduationCap, ShieldCheck, Users } from "lucide-react";

export default function ProfilePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      
      {/* ── En-tête "En construction" ── */}
      <div className="flex flex-col items-center text-center mb-10 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
        
        {/* Icône animée */}
        <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
          <div className="w-16 h-16 bg-blue-100 text-blue-500 rounded-full flex items-center justify-center">
            <User size={40} />
          </div>
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md animate-bounce">
            <Hammer size={24} className="text-secondary" />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-text mb-3">
          Espace Profil 🚧
        </h1>
        <p className="text-text-muted font-medium text-base sm:text-lg max-w-lg">
          Ton espace personnel est en cours de création ! <br className="hidden sm:block" />
          Bientôt, tu pourras y voir tes statistiques, tes badges, et l'interface s'adaptera à ton rôle (Élève ou Professeur).
        </p>
      </div>

      {/* ── Aperçu des profils (Flouté/Grisé) ── */}
      <div className="opacity-50 select-none pointer-events-none grayscale-[40%] transition-all flex flex-col gap-8">
        
        {/* 1. APERÇU PROFIL ÉLÈVE */}
        <div>
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 ml-2 flex items-center gap-2">
            <GraduationCap size={16} /> Vue : Étudiant / Apprenant
          </h2>
          
          <div className="bg-card border-2 border-border rounded-3xl p-6 shadow-sm">
            {/* Header Profil */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-md">
                AL
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="text-2xl font-black text-text">Alexandre L.</h3>
                  <span className="bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                    <GraduationCap size={12} /> Élève
                  </span>
                </div>
                <p className="text-sm text-text-muted font-medium">Niveau A · Initiation</p>
                <p className="text-xs text-text-muted mt-2">Membre depuis Janvier 2024</p>
              </div>
            </div>

            {/* Stats Élève */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
                <Zap size={20} className="text-orange-500 mx-auto mb-1" />
                <p className="font-black text-orange-600 text-lg">12</p>
                <p className="text-[10px] font-bold text-orange-700/70 uppercase">Jours de suite</p>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
                <Award size={20} className="text-blue-500 mx-auto mb-1" />
                <p className="font-black text-blue-600 text-lg">2 450</p>
                <p className="text-[10px] font-bold text-blue-700/70 uppercase">XP Total</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
                <BookOpen size={20} className="text-green-500 mx-auto mb-1" />
                <p className="font-black text-green-600 text-lg">8</p>
                <p className="text-[10px] font-bold text-green-700/70 uppercase">Leçons finies</p>
              </div>
            </div>
          </div>
        </div>

        {/* 2. APERÇU PROFIL PROFESSEUR */}
        <div>
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-4 ml-2 flex items-center gap-2">
            <ShieldCheck size={16} /> Vue : Professeur / Administrateur
          </h2>
          
          <div className="bg-card border-2 border-purple-200 rounded-3xl p-6 shadow-sm">
            {/* Header Profil Prof */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-md">
                HW
              </div>
              <div className="text-center sm:text-left flex-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                  <h3 className="text-2xl font-black text-text">Mme. Wang</h3>
                  <span className="bg-purple-100 text-purple-700 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md flex items-center gap-1">
                    <ShieldCheck size={12} /> Professeur
                  </span>
                </div>
                <p className="text-sm text-text-muted font-medium">Département de Mandarin</p>
              </div>
              <div className="hidden sm:block">
                <button className="bg-purple-600 text-white font-bold text-sm px-4 py-2 rounded-xl">
                  Gérer les classes
                </button>
              </div>
            </div>

            {/* Stats Professeur */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-purple-200 text-purple-700 p-3 rounded-lg">
                  <Users size={24} />
                </div>
                <div>
                  <p className="font-black text-purple-700 text-xl">42</p>
                  <p className="text-[10px] font-bold text-purple-600 uppercase">Élèves suivis</p>
                </div>
              </div>
              <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-4">
                <div className="bg-indigo-200 text-indigo-700 p-3 rounded-lg">
                  <BookOpen size={24} />
                </div>
                <div>
                  <p className="font-black text-indigo-700 text-xl">3</p>
                  <p className="text-[10px] font-bold text-indigo-600 uppercase">Classes actives</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}