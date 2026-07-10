"use client";

import { useState } from "react";
import { Camera, CheckCircle2, XCircle, Search } from "lucide-react";
import { useApp } from "@/lib/AppContext";

export default function AgencyQrValidation() {
  const { showToast } = useApp();
  const [code, setCode] = useState("");
  const [result, setResult] = useState<"valid" | "invalid" | null>(null);

  function handleValidate() {
    if (!code.trim()) {
      showToast("⚠️ Veuillez entrer ou scanner un code de réservation");
      return;
    }
    if (code.startsWith("ET-") && code.length > 8) {
      setResult("valid");
      showToast("✅ Réservation validée ! Voyageur autorisé à embarquer.");
    } else {
      setResult("invalid");
      showToast("❌ Code invalide. Vérifiez le QR code.");
    }
  }

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Camera size={24} className="text-green" />
        <h1 className="text-2xl font-bold text-navy">Validation QR</h1>
      </div>
      <div className="card p-8 text-center">
        <div className="w-32 h-32 bg-bg border-2 border-dashed border-greyLight rounded-xl flex items-center justify-center mx-auto mb-6">
          <Camera size={48} className="text-greyMid" />
        </div>
        <p className="text-sm text-greyMid mb-4">
          Scannez le QR code du billet du voyageur ou saisissez manuellement la référence.
        </p>
        <div className="flex gap-3 mb-4">
          <input
            className="form-input flex-1 text-center font-mono"
            placeholder="ET-XXXXXXXX"
            value={code}
            onChange={(e) => { setCode(e.target.value); setResult(null); }}
          />
          <button className="btn-primary" onClick={handleValidate}>
            <Search size={16} /> Vérifier
          </button>
        </div>
        {result === "valid" && (
          <div className="flex items-center gap-2 p-4 bg-[#f0fdf4] rounded-lg text-green font-semibold">
            <CheckCircle2 size={20} /> Réservation valide — Embarquement autorisé
          </div>
        )}
        {result === "invalid" && (
          <div className="flex items-center gap-2 p-4 bg-[#ffe8ea] rounded-lg text-red font-semibold">
            <XCircle size={20} /> Code invalide — Vérifiez le QR code
          </div>
        )}
      </div>
    </div>
  );
}
