"use client";

import { 
  Settings, Hammer, User, Bell, Moon, Globe, 
  CreditCard, ChevronRight, Volume2, Shield 
} from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-24">
      
      {/* ── En-tête "En construction" ── */}
      <div className="flex flex-col items-center text-center mb-10 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
        
        {/* Icône animée */}
        <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
          <div className="w-16 h-16 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center">
            {/* L'engrenage tourne lentement */}
            <Settings size={40} className="animate-[spin_6s_linear_infinite]" />
          </div>
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-md animate-bounce">
            <Hammer size={24} className="text-secondary" />
          </div>
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-text mb-3">
          Paramètres 🚧
        </h1>
        <p className="text-text-muted font-medium text-base sm:text-lg max-w-lg">
          Ton centre de contrôle est en cours de montage ! <br className="hidden sm:block" />
          Tu pourras bientôt y personnaliser ton interface, gérer tes notifications et sécuriser ton compte.
        </p>
      </div>

      {/* ── Aperçu des paramètres (Flouté/Grisé) ── */}
      <div className="opacity-50 select-none pointer-events-none grayscale-[40%] transition-all flex flex-col gap-6">
        
        {/* Bloc 1 : Abonnement Pro */}
        <div className="bg-gradient-to-r from-orange-400 to-primary rounded-3xl p-6 text-white shadow-md flex items-center justify-between">
          <div>
            <h2 className="text-xl font-black mb-1 flex items-center gap-2">
              HanYu Pro <span className="bg-white text-primary text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Premium</span>
            </h2>
            <p className="text-sm font-medium opacity-90">Débloque tous les examens et supprime les pubs.</p>
          </div>
          <ChevronRight size={24} className="opacity-70" />
        </div>

        {/* Bloc 2 : Compte */}
        <div>
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3 ml-2">
            Mon Compte
          </h2>
          <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  <User size={20} />
                </div>
                <div>
                  <p className="font-bold text-text">Informations personnelles</p>
                  <p className="text-xs text-text-muted">Nom, pseudo, e-mail</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-text-muted" />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                  <Shield size={20} />
                </div>
                <div>
                  <p className="font-bold text-text">Mot de passe et sécurité</p>
                  <p className="text-xs text-text-muted">Modifier le mot de passe</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-text-muted" />
            </div>
          </div>
        </div>

        {/* Bloc 3 : Préférences */}
        <div>
          <h2 className="text-sm font-bold text-text-muted uppercase tracking-wider mb-3 ml-2">
            Préférences
          </h2>
          <div className="bg-card border-2 border-border rounded-2xl overflow-hidden shadow-sm flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-500">
                  <Moon size={20} />
                </div>
                <p className="font-bold text-text">Mode Sombre</p>
              </div>
              {/* Faux Toggle */}
              <div className="w-12 h-6 bg-slate-200 rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5 shadow-sm"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-500">
                  <Volume2 size={20} />
                </div>
                <p className="font-bold text-text">Effets sonores</p>
              </div>
              {/* Faux Toggle actif */}
              <div className="w-12 h-6 bg-primary rounded-full relative">
                <div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5 shadow-sm"></div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-green-500">
                  <Globe size={20} />
                </div>
                <div>
                  <p className="font-bold text-text">Langue de l'interface</p>
                  <p className="text-xs text-text-muted">Français</p>
                </div>
              </div>
              <ChevronRight size={20} className="text-text-muted" />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-50 rounded-full flex items-center justify-center text-red-500">
                  <Bell size={20} />
                </div>
                <p className="font-bold text-text">Notifications</p>
              </div>
              <ChevronRight size={20} className="text-text-muted" />
            </div>
          </div>
        </div>

        {/* Bouton Déconnexion (Faux) */}
        <div className="mt-4">
          <button className="w-full py-4 rounded-xl font-bold text-red-500 bg-red-50 border border-red-100 text-center">
            Se déconnecter
          </button>
        </div>

      </div>
    </div>
  );
}