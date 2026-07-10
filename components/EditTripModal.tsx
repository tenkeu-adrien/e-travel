"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { updateTrip } from "@/lib/firebase/firestore";
import { Trip } from "@/lib/types";

export default function EditTripModal({
  trip,
  open,
  onClose,
}: {
  trip: Trip | null;
  open: boolean;
  onClose: () => void;
}) {
  const [price, setPrice] = useState(trip?.price ?? 5000);
  const [seats, setSeats] = useState(trip?.seats ?? 0);
  const [total, setTotal] = useState(trip?.total ?? 32);
  const [depH, setDepH] = useState(trip?.depH ?? "07:00");
  const [arrH, setArrH] = useState(trip?.arrH ?? "");
  const [saving, setSaving] = useState(false);

  if (!open || !trip) return null;

  async function handleSave() {
    if (!trip) return;
    setSaving(true);
    try {
      await updateTrip(trip.id, { price, seats, total, depH, arrH });
      onClose();
    } catch {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl w-full max-w-[480px] shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between px-7 py-5 border-b border-greyLight">
          <h2 className="text-lg font-bold text-navy">✏️ Modifier le trajet</h2>
          <button className="w-8 h-8 rounded-full bg-bg text-greyMid flex items-center justify-center" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="px-7 py-6 flex flex-col gap-4">
          <div className="text-sm text-greyMid mb-2">
            {trip.depart} → {trip.arrive} · {trip.depH} ({trip.agency})
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Prix (FCFA)</label>
              <input type="number" className="form-input" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Places dispo</label>
              <input type="number" className="form-input" value={seats} onChange={(e) => setSeats(Number(e.target.value))} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Départ</label>
              <input type="time" className="form-input" value={depH} onChange={(e) => setDepH(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Arrivée</label>
              <input type="time" className="form-input" value={arrH} onChange={(e) => setArrH(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Capacité totale</label>
            <input type="number" className="form-input" value={total} onChange={(e) => setTotal(Number(e.target.value))} />
          </div>
        </div>
        <div className="px-7 py-4 border-t border-greyLight flex gap-3 justify-end">
          <button className="btn-ghost" onClick={onClose}>Annuler</button>
          <button className="bg-green text-white px-7 py-3 rounded-sm2 font-semibold hover:bg-green-dark transition-all disabled:opacity-60" onClick={handleSave} disabled={saving}>
            {saving ? <><Loader2 size={16} className="animate-spin inline" /> Enregistrement...</> : "💾 Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
