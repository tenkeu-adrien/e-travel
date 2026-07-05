"use client";

import { useState } from "react";
import { Database, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { seedFirebase } from "@/lib/firebase/seed";

export default function SeedPage() {
  const { goTo, firebaseReady } = useApp();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSeed() {
    if (!firebaseReady) {
      setStatus("error");
      setMessage("Firebase n'est pas configuré. Ajoute les clés dans .env.local");
      return;
    }

    setStatus("loading");
    setMessage("Création des données de test...");

    try {
      await seedFirebase();
      setStatus("success");
      setMessage("Toutes les données ont été créées avec succès !");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "Une erreur est survenue");
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gradient-to-br from-navy to-[#1a2f55]">
      <div className="bg-white rounded-2xl p-10 w-full max-w-[520px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green rounded-xl flex items-center justify-center text-white mx-auto mb-4">
            <Database size={28} />
          </div>
          <h2 className="text-[22px] font-bold text-navy">
            Initialisation de la base de données
          </h2>
          <p className="text-sm text-greyMid mt-1.5">
            Crée les données de test (agences, trajets, avis, comptes utilisateurs)
          </p>
        </div>

        {status === "idle" && (
          <div className="flex flex-col gap-4">
            <div className="bg-bg rounded-lg p-4 text-sm text-greyDark leading-relaxed">
              <p className="font-semibold text-navy mb-2">📦 Ce seed va créer :</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>5 agences de transport</li>
                <li>6 trajets avec horaires et prix</li>
                <li>9 avis voyageurs</li>
                <li>5 comptes de test (3 agences + 2 voyageurs)</li>
              </ul>
            </div>
            <button
              className="bg-green text-white px-7 py-3.5 rounded-sm2 font-semibold hover:bg-green-dark transition-all text-[15px]"
              onClick={handleSeed}
            >
              🚀 Lancer l&apos;initialisation
            </button>
            <button
              className="btn-ghost text-[13px]"
              onClick={() => goTo("home")}
            >
              ← Retour à l&apos;accueil
            </button>
          </div>
        )}

        {status === "loading" && (
          <div className="text-center py-8">
            <Loader2 size={40} className="text-green mx-auto mb-4 animate-spin" />
            <p className="text-sm text-greyMid">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle2 size={56} className="text-green mx-auto mb-4" />
            <p className="text-sm text-greyDark mb-6">{message}</p>
            <div className="bg-[#f0fdf4] rounded-lg p-4 mb-6 text-left text-sm text-greyDark leading-relaxed">
              <p className="font-semibold text-navy mb-2">🔑 Comptes de test :</p>
              <ul className="space-y-2">
                <li><strong>Agence:</strong> generalexpress@etravel.cm / password123</li>
                <li><strong>Agence:</strong> bucavoyages@etravel.cm / password123</li>
                <li><strong>Agence:</strong> cerisexpress@etravel.cm / password123</li>
                <li><strong>Voyageur:</strong> 690000001 / traveler123</li>
                <li><strong>Voyageur:</strong> 690000002 / traveler123</li>
              </ul>
            </div>
            <button
              className="btn-primary"
              onClick={() => goTo("home")}
            >
              ← Retour à l&apos;accueil
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="text-center">
            <AlertCircle size={56} className="text-red mx-auto mb-4" />
            <p className="text-sm text-greyDark mb-6">{message}</p>
            <button
              className="btn-primary"
              onClick={() => setStatus("idle")}
            >
              Réessayer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
