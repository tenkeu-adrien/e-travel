"use client";

import { useState } from "react";
import { X, Mail, Key, CheckCircle2, Loader2, Send, AlertTriangle } from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase/config";

type Step = "email" | "otp" | "done";

export default function ForgotPasswordModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  if (!open) return null;

  async function handleSendOtp() {
    if (!email.trim() || !email.includes("@")) {
      setError("Veuillez entrer un email valide");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur d'envoi");
      setStep("otp");
      startCountdown();
    } catch (err: any) {
      setError(err.message || "Erreur d'envoi du code");
    }
    setLoading(false);
  }

  function startCountdown() {
    setCountdown(60);
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  }

  async function handleVerifyOtp() {
    if (!otp.trim() || otp.length < 4) {
      setError("Veuillez entrer le code OTP complet");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), otp: otp.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Code invalide");

      // OTP verified — send Firebase password reset email
      if (auth) {
        await sendPasswordResetEmail(auth, email.trim());
      }
      setStep("done");
    } catch (err: any) {
      setError(err.message || "Code invalide");
    }
    setLoading(false);
  }

  function handleClose() {
    setStep("email");
    setEmail("");
    setOtp("");
    setError("");
    setCountdown(0);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-[440px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-navy">Mot de passe oublié</h2>
          <button
            className="w-8 h-8 rounded-full bg-bg text-greyMid flex items-center justify-center"
            onClick={handleClose}
          >
            <X size={18} />
          </button>
        </div>

        {step === "email" && (
          <div>
            <p className="text-sm text-greyMid mb-6">
              Entrez votre email professionnel. Nous vous enverrons un code de vérification.
            </p>
            <div className="flex flex-col gap-1.5 mb-6">
              <label className="form-label">Email agence</label>
              <div className="flex">
                <span className="px-3.5 py-3 bg-bg border-[1.5px] border-greyLight border-r-0 rounded-l-lg text-sm text-greyMid">
                  <Mail size={18} />
                </span>
                <input
                  type="email"
                  className="form-input rounded-l-none"
                  placeholder="agence@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 bg-[#ffe8ea] rounded-lg text-[13px] text-red mb-4">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <button
              className="btn-primary w-full"
              onClick={handleSendOtp}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin inline" /> Envoi en cours...</>
              ) : (
                <><Send size={16} /> Envoyer le code</>
              )}
            </button>
          </div>
        )}

        {step === "otp" && (
          <div>
            <p className="text-sm text-greyMid mb-2">
              Un code à 6 chiffres a été envoyé à <strong>{email}</strong>
            </p>
            <p className="text-xs text-greyMid mb-6">
              Il expire dans 10 minutes.
            </p>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="form-label">Code de vérification</label>
              <input
                type="text"
                className="form-input text-center text-2xl tracking-[8px] font-mono"
                placeholder="••••••"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>
            {error && (
              <div className="flex items-start gap-2 p-3 bg-[#ffe8ea] rounded-lg text-[13px] text-red mb-4">
                <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                {error}
              </div>
            )}
            <button
              className="btn-primary w-full mb-3"
              onClick={handleVerifyOtp}
              disabled={loading}
            >
              {loading ? (
                <><Loader2 size={16} className="animate-spin inline" /> Vérification...</>
              ) : (
                <><Key size={16} /> Vérifier le code</>
              )}
            </button>
            <button
              className="btn-ghost w-full text-[13px]"
              onClick={handleSendOtp}
              disabled={countdown > 0 || loading}
            >
              {countdown > 0
                ? `Renvoyer dans ${countdown}s`
                : "Renvoyer le code"}
            </button>
          </div>
        )}

        {step === "done" && (
          <div className="text-center">
            <CheckCircle2 size={64} className="text-green mx-auto mb-4" />
            <h3 className="text-lg font-bold text-navy mb-2">Email envoyé !</h3>
            <p className="text-sm text-greyMid mb-6">
              Un email de réinitialisation a été envoyé à <strong>{email}</strong>.
              <br />
              Consultez votre boîte de réception et suivez le lien pour créer un nouveau mot de passe.
            </p>
            <button className="btn-primary w-full" onClick={handleClose}>
              <CheckCircle2 size={16} /> J&apos;ai compris
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
