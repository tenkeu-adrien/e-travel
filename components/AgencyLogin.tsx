"use client";

import { useState, useRef } from "react";
import { Bus, Loader2, Eye, EyeOff } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { signInAsAgency } from "@/lib/firebase/auth";
import ForgotPasswordModal from "./ForgotPasswordModal";

const TEST_ACCOUNTS = [
  { email: "generalexpress@etravel.cm", pass: "password123", name: "Général Express" },
  { email: "bucavoyages@etravel.cm", pass: "password123", name: "Buca Voyages" },
  { email: "cerisexpress@etravel.cm", pass: "password123", name: "Cerise Express" },
];

export default function AgencyLogin() {
  const { goTo, showToast, firebaseReady } = useApp();
  const [loading, setLoading] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("generalexpress@etravel.cm");
  const [password, setPassword] = useState("password123");

  async function handleLogin() {
    const emailVal = email.trim();
    const passVal = password;

    if (!emailVal) {
      showToast("⚠️ Veuillez entrer votre email");
      return;
    }
    if (!passVal) {
      showToast("⚠️ Veuillez entrer votre mot de passe");
      return;
    }

    setLoading(true);
    if (firebaseReady) {
      try {
        await signInAsAgency(emailVal, passVal);
      } catch (err: any) {
        const msg = err.code === "auth/invalid-credential" ? "Identifiants incorrects"
          : err.code === "auth/configuration-not-found" ? "Authentication Firebase non activée. Activez Email/Mot de passe dans la console Firebase."
          : "Erreur de connexion";
        showToast("⚠️ " + msg);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
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
              type="email"
              className="form-input"
              placeholder="agence@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Mot de passe</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                className="form-input pr-10"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-greyMid hover:text-navy"
                onClick={() => setShowPass(!showPass)}
                tabIndex={-1}
              >
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="bg-[#f0fdf4] rounded-lg p-3 text-[13px] text-[#0d7a3c] space-y-1">
            <div className="font-semibold mb-1">🔑 Comptes de test :</div>
            {TEST_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                className="block w-full text-left hover:bg-[#d8f5dc] px-2 py-1 rounded transition-colors"
                onClick={() => { setEmail(acc.email); setPassword(acc.pass); }}
              >
                <span className="font-medium">{acc.name}</span> — {acc.email}
              </button>
            ))}
          </div>
          <button className="btn-primary" onClick={handleLogin} disabled={loading}>
            {loading ? <><Loader2 size={16} className="animate-spin inline" /> Connexion...</> : "Se connecter →"}
          </button>
          <div className="text-center text-[13px] text-greyMid">
            <button className="text-green hover:underline cursor-pointer" onClick={() => setForgotOpen(true)}>
              Mot de passe oublié ?
            </button>
          </div>
          <div className="h-px bg-greyLight my-1" />
          <div className="text-center text-[13px] text-greyMid">
            Pas encore partenaire ?{" "}
            <button className="text-green font-semibold hover:underline cursor-pointer" onClick={() => {
              showToast("📧 Contactez-nous à partenaires@e-travel.cm pour devenir partenaire");
            }}>
              Rejoindre e-travel
            </button>
          </div>
          <div className="text-center">
            <button className="btn-ghost text-[13px]" onClick={() => goTo("home")}>
              ← Retour à l&apos;accueil
            </button>
          </div>
        </div>
      </div>
      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}
