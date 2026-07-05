"use client";

import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bus,
  MapPin,
  Flag,
  Armchair,
  Snowflake,
  Luggage,
  ShieldCheck,
  Minus,
  Plus,
  Ticket,
  Lock,
  AlertTriangle,
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { fees, fmt } from "@/lib/trips";
import { fetchReviewsByTripId, ReviewData } from "@/lib/firebase/firestore";

const FALLBACK_REVIEWS = [
  {
    userName: "Marie K.",
    stars: 5,
    text: "Chauffeur ponctuel, bus propre et climatisé. Je recommande vraiment !",
    date: "Il y a 3 jours",
  },
  {
    userName: "Paul N.",
    stars: 4,
    text: "Bon trajet dans l'ensemble. Petit retard au départ mais arrivée à l'heure.",
    date: "Il y a 1 semaine",
  },
  {
    userName: "Carine M.",
    stars: 5,
    text: "Le billet WhatsApp est une super idée ! Tout depuis mon téléphone, aucune queue !",
    date: "Il y a 2 semaines",
  },
];

export default function DetailPage() {
  const { currentTrip: t, goTo, qty, changeQty, firebaseReady } = useApp();
  const [reviews, setReviews] = useState<ReviewData[]>(FALLBACK_REVIEWS);

  useEffect(() => {
    if (firebaseReady && t.id) {
      fetchReviewsByTripId(t.id).then((fbReviews) => {
        if (fbReviews.length > 0) setReviews(fbReviews);
      }).catch(() => {});
    }
  }, [firebaseReady, t.id]);

  const sub = t.price * qty;
  const fee = fees(sub);
  const total = sub + fee;
  const stars = "★".repeat(Math.floor(t.rating)) + "☆".repeat(5 - Math.floor(t.rating));

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
      <div>
        <div
          className="flex items-center gap-2 text-sm text-greyMid mb-6 cursor-pointer hover:text-green"
          onClick={() => goTo("results")}
        >
          <ArrowLeft size={16} /> Retour aux résultats
        </div>

        <div className="card mb-5 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-navy to-[#1a2f55] text-white">
            <h3 className="text-[17px] font-bold">
              📅 {t.date ? new Date(t.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Lundi 15 Juin 2026"} · {t.agency}
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-5 py-5">
              <div className="text-center min-w-[80px]">
                <div className="text-[32px] font-extrabold text-navy">{t.depH}</div>
                <div className="text-[15px] font-semibold text-navy mt-1">{t.depart}</div>
                <div className="text-xs text-greyMid mt-0.5">{t.depStop}</div>
              </div>
              <div className="flex-1 flex flex-col items-center gap-1">
                <Bus size={24} className="text-green" />
                <div className="w-full h-[3px] bg-gradient-to-r from-green to-navy rounded-full" />
                <div className="text-[13px] text-greyMid font-semibold">{t.dur} de trajet</div>
              </div>
              <div className="text-center min-w-[80px]">
                <div className="text-[32px] font-extrabold text-navy">{t.arrH}</div>
                <div className="text-[15px] font-semibold text-navy mt-1">{t.arrive}</div>
                <div className="text-xs text-greyMid mt-0.5">{t.arrStop}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card mb-5 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-navy to-[#1a2f55] text-white">
            <h3 className="text-[17px] font-bold">ℹ️ Informations du voyage</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={<Bus size={20} />} label="Type de véhicule" value="Bus climatisé 32 places" />
              <InfoItem icon={<MapPin size={20} />} label="Point de départ" value={`${t.depStop}, ${t.depart}`} />
              <InfoItem icon={<Flag size={20} />} label="Point d'arrivée" value={`${t.arrStop}, ${t.arrive}`} />
              <InfoItem icon={<Armchair size={20} />} label="Places disponibles" value={`${t.seats} / ${t.total}`} />
              <InfoItem icon={<Snowflake size={20} />} label="Climatisation" value="Oui, incluse" />
              <InfoItem icon={<Luggage size={20} />} label="Bagages" value="1 bagage en soute inclus" />
            </div>
            <div className="mt-4 p-3 bg-[#fff3ed] rounded-lg text-[13px] text-[#c94a14] flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              Réservations clôturées automatiquement <strong>2 heures avant le départ</strong>.
            </div>
          </div>
        </div>

        <div className="card mb-5 overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-navy to-[#1a2f55] text-white">
            <h3 className="text-[17px] font-bold">🏢 À propos de l&apos;agence</h3>
          </div>
          <div className="p-6 flex gap-4 items-start">
            <div
              className="w-16 h-16 rounded-xl flex items-center justify-center text-2xl font-extrabold text-white shrink-0"
              style={{ background: t.color }}
            >
              {t.code}
            </div>
            <div>
              <div className="text-lg font-bold text-navy mb-1">{t.agency}</div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-yellow">{stars}</span>
                <span className="font-bold text-navy">{t.rating}</span>
                <span className="text-greyMid text-[13px]">{t.reviews} avis</span>
                <span className="text-[11px] px-2 py-0.5 bg-green-light text-[#0d7a3c] rounded-full font-semibold flex items-center gap-1">
                  <ShieldCheck size={12} /> Vérifiée
                </span>
              </div>
              <div className="flex gap-4 flex-wrap text-[13px] text-greyMid">
                <span>📞 +237 699 XXX XXX</span>
                <span>📍 Douala, Cameroun</span>
              </div>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-5 bg-gradient-to-r from-navy to-[#1a2f55] text-white">
            <h3 className="text-[17px] font-bold">⭐ Avis voyageurs</h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-6 mb-5 flex-wrap">
              <div className="text-center">
                <div className="text-5xl font-extrabold text-navy">{t.rating}</div>
                <div className="text-yellow text-xl">{stars}</div>
                <div className="text-[13px] text-greyMid">{t.reviews} avis</div>
              </div>
              <div className="flex-1 min-w-[200px]">
                {[
                  [5, 65],
                  [4, 25],
                  [3, 7],
                ].map(([n, pct]) => (
                  <div key={n} className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xs text-greyMid min-w-[20px]">{n}★</span>
                    <div className="flex-1 h-2 bg-greyLight rounded-full">
                      <div
                        className="h-full bg-yellow rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-greyMid">{pct}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {reviews.map((r, i) => (
                <div key={i} className="p-4 bg-bg rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-navy">👤 {r.userName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-yellow text-xs">{"★".repeat(r.stars)}</span>
                      <span className="text-xs text-greyMid">{r.date || "Récent"}</span>
                    </div>
                  </div>
                  <div className="text-sm text-greyDark leading-relaxed">{r.text}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BOOKING SIDEBAR */}
      <div>
        <div className="card p-6 sticky top-24">
          <div className="text-lg font-bold text-navy mb-5">Réserver ce trajet</div>
          <div className="mb-4">
            <span className="badge badge-green">🟢 {t.seats} places disponibles</span>
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="text-sm text-greyDark flex-1">Nombre de passagers</div>
            <button
              className="w-9 h-9 rounded-full border-2 border-green text-green flex items-center justify-center font-bold transition-all hover:bg-green hover:text-white"
              onClick={() => changeQty(-1)}
            >
              <Minus size={16} />
            </button>
            <span className="text-lg font-bold text-navy min-w-[24px] text-center">{qty}</span>
            <button
              className="w-9 h-9 rounded-full border-2 border-green text-green flex items-center justify-center font-bold transition-all hover:bg-green hover:text-white"
              onClick={() => changeQty(1)}
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="bg-bg rounded-lg p-4 mb-5">
            <Row label={`${qty} ticket${qty > 1 ? "s" : ""} × ${fmt(t.price)} FCFA`} value={`${fmt(sub)} FCFA`} />
            <Row label="Frais de service (5%)" value={`${fmt(fee)} FCFA`} />
            <div className="flex justify-between items-center pt-3 mt-2 border-t border-greyLight font-extrabold text-[16px] text-navy">
              <span>Total à payer</span>
              <span>{fmt(total)} FCFA</span>
            </div>
          </div>
          <button className="btn-primary" onClick={() => goTo("payment")}>
            <Ticket size={18} /> RÉSERVER CE TRAJET
          </button>
          <div className="flex items-center gap-2 text-xs text-greyMid mt-3">
            <Lock size={14} /> Paiement 100% sécurisé · Billet reçu sur WhatsApp
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-green shrink-0">{icon}</span>
      <div>
        <div className="text-xs text-greyMid mb-0.5">{label}</div>
        <div className="text-sm font-semibold text-greyDark">{value}</div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-1.5 text-sm text-greyDark">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
