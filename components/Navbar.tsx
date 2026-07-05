"use client";

import { Bus, LogIn, Building2, Database } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function Navbar() {
  const { goTo, setLoginModalOpen, firebaseReady } = useApp();

  return (
    <nav className="bg-navy px-6 h-16 flex items-center justify-between sticky top-0 z-[1000] shadow-[0_2px_12px_rgba(0,0,0,0.2)]">
      <div
        className="flex items-center gap-2.5 cursor-pointer"
        onClick={() => goTo("home")}
      >
        <div className="w-9 h-9 bg-green rounded-lg flex items-center justify-center text-white">
          <Bus size={20} />
        </div>
        <span className="text-white text-xl font-bold tracking-tight">
          e-<span className="text-green">travel</span>
        </span>
      </div>
      <div className="flex gap-3 items-center">
        {firebaseReady && (
          <button
            className="hidden sm:flex items-center gap-1.5 border-[1.5px] border-white/20 text-white/60 bg-transparent px-3 py-2 rounded-sm2 text-xs font-medium transition-all hover:border-green hover:text-green"
            onClick={() => goTo("seed")}
            title="Initialiser la base de données"
          >
            <Database size={14} />
            Seed
          </button>
        )}
        <button
          className="hidden sm:flex items-center gap-1.5 border-[1.5px] border-white/30 text-white bg-transparent px-4 py-2 rounded-sm2 text-sm font-medium transition-all hover:border-green hover:text-green"
          onClick={() => goTo("agency-login")}
        >
          <Building2 size={16} />
          Espace Agence
        </button>
        <button
          className="flex items-center gap-1.5 border-[1.5px] border-white/30 text-white bg-transparent px-4 py-2 rounded-sm2 text-sm font-medium transition-all hover:border-green hover:text-green"
          onClick={() => setLoginModalOpen(true)}
        >
          <LogIn size={16} />
          <span className="hidden sm:inline">Connexion</span>
        </button>
        <button
          className="bg-green text-white px-4 py-2 rounded-sm2 text-sm font-semibold transition-all hover:bg-green-dark"
          onClick={() => goTo("home")}
        >
          Réserver
        </button>
      </div>
    </nav>
  );
}
