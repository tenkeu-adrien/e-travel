"use client";

import { useRef } from "react";
import { Bus } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { signInAsAgency } from "@/lib/firebase/auth";

export default function AgencyLogin() {
  const { goTo, showToast, firebaseReady } = useApp();
  const emailRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  async function handleLogin() {
    const email = emailRef.current?.value.trim() || "";
    const password = passRef.current?.value || "";

    if (!email) {
      showToast("⚠️ Veuillez entrer votre email");
      return;
    }
    if (!password) {
      showToast("⚠️ Veuillez entrer votre mot de passe");
      return;
    }

    if (firebaseReady) {
      try {
        await signInAsAgency(email, password);
      } catch (err: any) {
        showToast("⚠️ " + (err.code === "auth/invalid-credential" ? "Identifiants incorrects" : "Erreur de connexion"));
        return;
      }
    }

    goTo("agency");
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-gradient-to-br from-navy to-[#1a2f55]">
      <div className="bg-white rounded-2xl p-10 w-full max-w-[440px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-green rounded-xl flex items-center justify-center text-white mx-auto mb-4">
            <Bus size={24} />
          </div>
          <h2 className="text-[22px] font-bold text-navy">Espace Agence</h2>
          <p className="text-sm text-greyMid mt-1.5">
            Connectez-vous à votre tableau de bord
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Email ou identifiant agence</label>
            <input
              ref={emailRef}
              type="email"
              className="form-input"
              placeholder="agence@example.com"
              defaultValue="generalexpress@etravel.cm"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Mot de passe</label>
            <input
              ref={passRef}
              type="password"
              className="form-input"
              placeholder="••••••••"
              defaultValue="password123"
            />
          </div>
          <button className="btn-primary" onClick={handleLogin}>
            Se connecter →
          </button>
          <div className="text-center text-[13px] text-greyMid">
            <a href="#" className="text-green">
              Mot de passe oublié ?
            </a>
          </div>
          <div className="h-px bg-greyLight my-1" />
          <div className="text-center text-[13px] text-greyMid">
            Pas encore partenaire ?{" "}
            <a href="#" className="text-green font-semibold">
              Rejoindre e-travel
            </a>
          </div>
          <div className="text-center">
            <button className="btn-ghost text-[13px]" onClick={() => goTo("home")}>
              ← Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
