"use client";

import { useEffect, useState } from "react";
import { User, Save, Loader2 } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { fetchAgencyByEmail, updateAgency } from "@/lib/firebase/firestore";

export default function AgencyProfile() {
  const { showToast, firebaseReady, user, refreshAgency } = useApp();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState("#1DB954");
  const [agencyId, setAgencyId] = useState("");

  useEffect(() => {
    if (!firebaseReady || !user?.email) return;
    setLoading(true);
    fetchAgencyByEmail(user.email).then((agency) => {
      if (agency) {
        const a = agency as any;
        setAgencyId(agency.id as string);
        setName(a.name || "");
        setCode(a.code || "");
        setPhone(a.phone || "");
        setEmail(a.email || "");
        setColor(a.color || "#1DB954");
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [firebaseReady, user]);

  async function handleSave() {
    if (!agencyId) return;
    setSaving(true);
    try {
      await updateAgency(agencyId, { name, code, phone, color });
      await refreshAgency();
      showToast("✅ Profil mis à jour avec succès");
    } catch {
      showToast("⚠️ Erreur lors de la mise à jour");
    }
    setSaving(false);
  }

  if (loading) return <div className="text-center py-20 text-sm text-greyMid">Chargement...</div>;

  return (
    <div className="max-w-[600px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <User size={24} className="text-green" />
        <h1 className="text-2xl font-bold text-navy">Profil Agence</h1>
      </div>
      <div className="card p-6 space-y-4">
        <div className="flex flex-col gap-1.5">
          <label className="form-label">Nom de l'agence</label>
          <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="form-label">Code agence</label>
          <input className="form-input" value={code} onChange={(e) => setCode(e.target.value.toUpperCase().slice(0, 4))} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="form-label">Téléphone</label>
          <input className="form-input" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="form-label">Email</label>
          <input className="form-input" value={email} disabled />
          <span className="text-xs text-greyMid">L'email ne peut pas être modifié ici.</span>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="form-label">Couleur</label>
          <div className="flex gap-3 items-center">
            <input type="color" className="w-10 h-10 rounded cursor-pointer border border-greyLight" value={color} onChange={(e) => setColor(e.target.value)} />
            <span className="text-sm text-greyDark font-mono">{color}</span>
          </div>
        </div>
        <button className="btn-primary w-full" onClick={handleSave} disabled={saving}>
          {saving ? <><Loader2 size={16} className="animate-spin inline" /> Enregistrement...</> : <><Save size={16} /> Enregistrer</>}
        </button>
      </div>
    </div>
  );
}
