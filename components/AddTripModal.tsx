"use client";

import { useEffect, useRef, useState } from "react";
import { X, Bus, Loader2 } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { fetchCities, createTrip, fetchAgencyByEmail } from "@/lib/firebase/firestore";

export default function AddTripModal() {
  const { addTripModalOpen, setAddTripModalOpen, showToast, firebaseReady, user } = useApp();
  const [cities, setCities] = useState<string[]>([]);
  const [agencyName, setAgencyName] = useState("");
  const [agencyCode, setAgencyCode] = useState("");
  const [agencyColor, setAgencyColor] = useState("#1DB954");
  const [publishing, setPublishing] = useState(false);

  const departRef = useRef<HTMLSelectElement>(null);
  const arriveRef = useRef<HTMLSelectElement>(null);
  const depStopRef = useRef<HTMLInputElement>(null);
  const arrStopRef = useRef<HTMLInputElement>(null);
  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);
  const seatsRef = useRef<HTMLInputElement>(null);
  const priceRef = useRef<HTMLInputElement>(null);
  const acRef = useRef<HTMLInputElement>(null);
  const luggageRef = useRef<HTMLInputElement>(null);
  const usbRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!addTripModalOpen || !firebaseReady) return;
    fetchCities().then(setCities).catch(() => {});

    const email = user?.email || "";
    if (email) {
      fetchAgencyByEmail(email).then((agency) => {
        if (agency) {
          const a = agency as any;
          setAgencyName(a.name || "");
          setAgencyCode(a.code || "");
          setAgencyColor(a.color || "#1DB954");
        }
      }).catch(() => {});
    }
  }, [addTripModalOpen, firebaseReady, user]);

  if (!addTripModalOpen) return null;

  function close() {
    setAddTripModalOpen(false);
  }

  async function publish() {
    const depart = departRef.current?.value || "";
    const arrive = arriveRef.current?.value || "";
    const depStop = depStopRef.current?.value || "";
    const arrStop = arrStopRef.current?.value || "";
    const date = dateRef.current?.value || "";
    const time = timeRef.current?.value || "07:00";
    const seats = parseInt(seatsRef.current?.value || "32", 10);
    const price = parseInt(priceRef.current?.value || "5000", 10);

    if (!depart || !arrive) {
      showToast("⚠️ Veuillez sélectionner les villes");
      return;
    }
    if (depart === arrive) {
      showToast("⚠️ Les villes doivent être différentes");
      return;
    }

    const amenities: string[] = [];
    if (acRef.current?.checked) amenities.push("❄️");
    if (luggageRef.current?.checked) amenities.push("🧳");
    if (usbRef.current?.checked) amenities.push("🔌");

    const agencyId = user?.uid || "unknown";
    const name = agencyName || user?.email?.split("@")[0] || "Mon Agence";
    const code = agencyCode || name.substring(0, 2).toUpperCase();

    setPublishing(true);
    if (firebaseReady) {
      try {
        await createTrip({
          agency: name,
          agencyId,
          code,
          color: agencyColor,
          depH: time,
          arrH: "",
          dur: "",
          depart,
          arrive,
          depStop,
          arrStop,
          price,
          seats,
          total: seats,
          rating: 0,
          reviews: 0,
          status: "open",
          amenities,
          date,
        });
      } catch {
        showToast("⚠️ Erreur lors de la publication");
        setPublishing(false);
        return;
      }
    }
    setPublishing(false);
    close();
    showToast("✅ Trajet publié avec succès sur e-travel !");
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-6"
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="bg-white rounded-2xl w-full max-w-[560px] shadow-[0_20px_60px_rgba(0,0,0,0.3)] max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-7 py-5 border-b border-greyLight">
          <div className="text-lg font-bold text-navy flex items-center gap-2">
            <Bus size={18} className="text-green" /> Créer un nouveau trajet
          </div>
          <button
            className="w-8 h-8 rounded-full bg-bg text-greyMid flex items-center justify-center"
            onClick={close}
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-7 py-6 flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Ville de départ *</label>
              <select ref={departRef} className="form-select">
                {cities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Ville d&apos;arrivée *</label>
              <select ref={arriveRef} className="form-select">
                {cities.slice().reverse().map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Point de départ précis *</label>
            <input ref={depStopRef} className="form-input" placeholder="Ex: Gare Centrale de Douala, Rue Joss" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Point d&apos;arrivée précis *</label>
            <input ref={arrStopRef} className="form-input" placeholder="Ex: Gare Centrale de Yaoundé" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Date du trajet *</label>
              <input ref={dateRef} type="date" className="form-input" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Heure de départ *</label>
              <input ref={timeRef} type="time" className="form-input" defaultValue="07:00" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Nombre de places *</label>
              <input ref={seatsRef} type="number" className="form-input" defaultValue={32} min={1} max={100} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="form-label">Prix / personne (FCFA) *</label>
              <input ref={priceRef} type="number" className="form-input" defaultValue={5000} step={500} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="form-label">Équipements</label>
            <div className="flex gap-4 flex-wrap mt-2">
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input ref={acRef} type="checkbox" defaultChecked className="accent-green" /> ❄️ Climatisation
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input ref={luggageRef} type="checkbox" defaultChecked className="accent-green" /> 🧳 Bagages inclus
              </label>
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input ref={usbRef} type="checkbox" className="accent-green" /> 🔌 USB
              </label>
            </div>
          </div>
          <div className="p-3 bg-[#f0fdf4] rounded-lg text-[13px] text-[#0d7a3c]">
            ℹ️ Les frais de service e-travel (5%) seront ajoutés automatiquement pour le
            voyageur.
          </div>
        </div>
        <div className="px-7 py-4 border-t border-greyLight flex gap-3 justify-end">
          <button className="btn-ghost" onClick={close}>
            Annuler
          </button>
          <button className="bg-green text-white px-7 py-3 rounded-sm2 font-semibold hover:bg-green-dark transition-all disabled:opacity-60 disabled:cursor-not-allowed" onClick={publish} disabled={publishing}>
            {publishing ? <><Loader2 size={16} className="animate-spin inline" /> Publication...</> : "✅ Publier le trajet"}
          </button>
        </div>
      </div>
    </div>
  );
}