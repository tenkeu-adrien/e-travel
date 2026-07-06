"use client";

import { useState, useRef } from "react";
import { X, User, Loader2 } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { signInWithPhone, signUpWithPhone } from "@/lib/firebase/auth";
import { createTraveler } from "@/lib/firebase/firestore";

export default function LoginModal() {
  const { loginModalOpen, setLoginModalOpen, showToast, firebaseReady } = useApp();
  const [loading, setLoading] = useState(false);
  const phoneRef = useRef<HTMLInputElement>(null);
  const passRef = useRef<HTMLInputElement>(null);

  if (!loginModalOpen) return null;

  function close() {
    if (!loading) setLoginModalOpen(false);
  }

  async function handleLogin() {
    const phone = phoneRef.current?.value.trim() || "";
    const password = passRef.current?.value || "";

    if (!phone || phone.length < 8) {
      showToast("⚠️ Veuillez entrer un numéro valide");
      return;
    }
    if (!password) {
      showToast("⚠️ Veuillez entrer votre mot de passe");
      return;
    }

    setLoading(true);
    if (firebaseReady) {
      try {
        await signInWithPhone(phone, password);
      } catch (err: any) {
        if (err.code === "auth/user-not-found") {
          try {
            await signUpWithPhone(phone, password);
            await createTraveler({ phone, nom: "", prenom: "" });
          } catch (signUpErr: any) {
            showToast("⚠️ Erreur d'inscription : " + signUpErr.code);
            setLoading(false);
            return;
          }
        } else {
          showToast("⚠️ Erreur de connexion");
          setLoading(false);
          return;
        }
      }
    }
    setLoading(false);
    close();
    showToast("✅ Connexion réussie !");
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="bg-white rounded-2xl w-full max-w-[560px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between px-7 py-5 border-b border-greyLight">
          <div className="text-lg font-bold text-navy flex items-center gap-2">
            <User size={18} className="text-green" /> Connexion Voyageur
          </div>
          <button
            className="w-8 h-8 rounded-full bg-bg text-greyMid flex items-center justify-center"
            onClick={close}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-7 py-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Numéro WhatsApp / Téléphone</label>
            <div className="flex">
              <span className="px-3.5 py-3 bg-bg border-[1.5px] border-greyLight border-r-0 rounded-l-lg text-sm text-greyMid">
                🇨🇲 +237
              </span>
              <input
                ref={phoneRef}
                type="tel"
                className="form-input rounded-l-none"
                placeholder="6XX XX XX XX"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Mot de passe</label>
            <input
              ref={passRef}
              type="password"
              className="form-input"
              placeholder="••••••••"
            />
          </div>
        </div>
        <div className="px-7 py-4 border-t border-greyLight flex gap-3 justify-end">
          <button className="btn-ghost" onClick={close}>
            Annuler
          </button>
          <button
            className="bg-green text-white px-7 py-3 rounded-sm2 font-semibold hover:bg-green-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <><Loader2 size={16} className="animate-spin inline" /> Connexion...</> : "Se connecter"}
          </button>
        </div>
      </div>
    </div>
  );
}
