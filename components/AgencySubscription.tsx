"use client";

import { CreditCard, CheckCircle2, Star } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function AgencySubscription() {
  const { showToast, isAgency } = useApp();

  return (
    <div className="max-w-[700px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard size={24} className="text-green" />
        <h1 className="text-2xl font-bold text-navy">Abonnement</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <div className="card p-6 border-2 border-greyLight">
          <div className="text-center">
            <div className="text-3xl mb-3">📋</div>
            <h3 className="text-lg font-bold text-navy mb-2">Standard</h3>
            <div className="text-3xl font-extrabold text-navy mb-2">Gratuit</div>
            <p className="text-sm text-greyMid mb-4">Pour démarrer</p>
            <ul className="text-left text-sm text-greyDark space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green shrink-0 mt-0.5" />
                Jusqu'à 5 trajets par jour
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green shrink-0 mt-0.5" />
                Tableau de bord basique
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green shrink-0 mt-0.5" />
                Paiements Orange Money & MTN
              </li>
            </ul>
            <button className="btn-ghost w-full" disabled>Plan actuel</button>
          </div>
        </div>
        <div className="card p-6 border-2 border-green relative overflow-hidden">
          <div className="absolute top-3 right-3 bg-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full">POPULAIRE</div>
          <div className="text-center">
            <div className="text-3xl mb-3"><Star size={32} className="text-green mx-auto" /></div>
            <h3 className="text-lg font-bold text-navy mb-2">Premium</h3>
            <div className="text-3xl font-extrabold text-navy mb-2">{isAgency ? "✓ Actif" : "---"}</div>
            <p className="text-sm text-greyMid mb-4">Pour les agences professionnelles</p>
            <ul className="text-left text-sm text-greyDark space-y-2 mb-6">
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green shrink-0 mt-0.5" />
                Trajets illimités
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green shrink-0 mt-0.5" />
                Statistiques avancées + export CSV
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green shrink-0 mt-0.5" />
                Badge Premium ★ visible par les voyageurs
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 size={16} className="text-green shrink-0 mt-0.5" />
                Support prioritaire 24/7
              </li>
            </ul>
            <button
              className={`w-full py-3 rounded-sm2 font-semibold transition-all ${isAgency ? "bg-green text-white" : "bg-navy text-white hover:opacity-90"}`}
              onClick={() => showToast(isAgency ? "✅ Vous êtes déjà Premium" : "💳 Devenir Premium bientôt disponible")}
            >
              {isAgency ? "✅ Premium actif" : "Passer à Premium"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
