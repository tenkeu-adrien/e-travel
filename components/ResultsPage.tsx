"use client";

import { Pencil, Snowflake, Luggage, Usb } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { fees, fmt } from "@/lib/trips";
import { Trip } from "@/lib/types";

const AMENITY_ICON: Record<string, JSX.Element> = {
  "❄️": <Snowflake size={16} />,
  "🧳": <Luggage size={16} />,
  "🔌": <Usb size={16} />,
};

function TripCard({ trip }: { trip: Trip }) {
  const { openTrip } = useApp();
  const total = trip.price + fees(trip.price);
  const isFull = trip.status === "full";

  const seatBadge = isFull ? (
    <span className="badge badge-red">🔴 COMPLET</span>
  ) : trip.status === "urgent" ? (
    <span className="badge badge-orange">⚠️ Dernières places ({trip.seats})</span>
  ) : (
    <span className="badge badge-green">🟢 {trip.seats} places dispo</span>
  );

  return (
    <div
      className={`card mb-4 overflow-hidden border-l-4 transition-all ${
        isFull
          ? "border-l-red opacity-70"
          : trip.status === "urgent"
          ? "border-l-orange cursor-pointer hover:shadow-cardLg hover:-translate-y-0.5"
          : "border-l-green cursor-pointer hover:shadow-cardLg hover:-translate-y-0.5"
      }`}
      onClick={() => !isFull && openTrip(trip.id)}
    >
      <div className="p-5 md:p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-[10px] flex items-center justify-center text-lg font-extrabold text-white shrink-0"
              style={{ background: trip.color }}
            >
              {trip.code}
            </div>
            <div>
              <div className="text-[15px] font-bold text-navy">{trip.agency}</div>
              <div className="text-[13px] text-greyMid flex items-center gap-1">
                <span className="text-yellow text-xs">
                  {"★".repeat(Math.floor(trip.rating))}
                  {"☆".repeat(5 - Math.floor(trip.rating))}
                </span>{" "}
                {trip.rating} · {trip.reviews} avis{" "}
                <span className="text-[11px] px-2 py-0.5 bg-green-light text-[#0d7a3c] rounded-full font-semibold ml-1">
                  ✓ Vérifiée
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 text-greyDark">
            {trip.amenities.map((a, i) => (
              <span key={i}>{AMENITY_ICON[a] ?? a}</span>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <div>
            <div className="text-2xl font-extrabold text-navy">{trip.depH}</div>
            <div className="text-[13px] text-greyMid">{trip.depart}</div>
            <div className="text-[11px] text-greyMid">{trip.depStop}</div>
          </div>
          <div className="flex-1 flex items-center gap-1.5">
            <div className="flex-1 h-0.5 bg-greyLight relative">
              <span className="absolute -left-1.5 -top-2 text-green text-sm">●</span>
              <span className="absolute -right-1.5 -top-2 text-navy text-sm">●</span>
            </div>
            <div className="text-xs text-greyMid whitespace-nowrap bg-bg px-2 py-0.5 rounded-full">
              ⏱ {trip.dur}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-extrabold text-navy">{trip.arrH}</div>
            <div className="text-[13px] text-greyMid">{trip.arrive}</div>
            <div className="text-[11px] text-greyMid">{trip.arrStop}</div>
          </div>
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex gap-3 flex-wrap">{seatBadge}</div>
          <div className="flex items-center gap-4">
            <div>
              <div className="text-[22px] font-extrabold text-navy">
                {fmt(trip.price)} FCFA
              </div>
              <div className="text-xs text-greyMid">+ {fmt(fees(trip.price))} F frais</div>
              <div className="text-[13px] font-bold text-green">
                = {fmt(total)} FCFA / pers.
              </div>
            </div>
            <button
              className="bg-green text-white px-6 py-3 rounded-sm2 text-sm font-bold whitespace-nowrap transition-all hover:bg-green-dark hover:-translate-y-px disabled:bg-greyLight disabled:text-greyMid disabled:cursor-not-allowed"
              disabled={isFull}
              onClick={(e) => {
                e.stopPropagation();
                if (!isFull) openTrip(trip.id);
              }}
            >
              VOIR &amp; RÉSERVER →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ResultsPage() {
  const { searchResults, goTo } = useApp();
  const routeLabel =
    searchResults.length > 0
      ? `${searchResults[0].depart} → ${searchResults[0].arrive}`
      : "Douala → Yaoundé";
  const dateLabel = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <div className="bg-navy py-5 px-6">
        <div className="max-w-[1100px] mx-auto flex items-center gap-3 flex-wrap">
          <div className="bg-green border-[1.5px] border-green rounded-full px-4.5 py-2 text-white text-sm flex items-center gap-2">
            🚌 {routeLabel}
          </div>
          <div className="bg-white/10 border-[1.5px] border-white/20 rounded-full px-4.5 py-2 text-white text-sm">
            📅 {dateLabel}
          </div>
          <div className="bg-white/10 border-[1.5px] border-white/20 rounded-full px-4.5 py-2 text-white text-sm">
            👤 1 passager
          </div>
          <button
            className="bg-green text-white border-none px-4.5 py-2 rounded-full text-sm font-semibold ml-auto flex items-center gap-1.5"
            onClick={() => goTo("home")}
          >
            <Pencil size={14} /> Modifier
          </button>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto p-6 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        <div className="hidden lg:block">
          <div className="card p-5 mb-4">
            <div className="text-[15px] font-bold text-navy mb-4">⏰ Horaire</div>
            <div className="flex flex-col gap-2.5 text-sm text-greyDark">
              <label className="flex items-center gap-2.5">
                <input type="checkbox" defaultChecked className="accent-green" /> Matin
                (6h-12h)
              </label>
              <label className="flex items-center gap-2.5">
                <input type="checkbox" defaultChecked className="accent-green" /> Après-midi
                (12h-18h)
              </label>
              <label className="flex items-center gap-2.5">
                <input type="checkbox" className="accent-green" /> Soir (18h-22h)
              </label>
            </div>
          </div>
          <div className="card p-5 mb-4">
            <div className="text-[15px] font-bold text-navy mb-4">💺 Disponibilité</div>
            <div className="flex flex-col gap-2.5 text-sm text-greyDark">
              <label className="flex items-center gap-2.5">
                <input type="checkbox" className="accent-green" /> Plus de 5 places
              </label>
              <label className="flex items-center gap-2.5">
                <input type="checkbox" className="accent-green" /> Dernières places
              </label>
            </div>
          </div>
          <div className="card p-5 mb-4">
            <div className="text-[15px] font-bold text-navy mb-4">⭐ Note agence</div>
            <div className="flex flex-col gap-2.5 text-sm text-greyDark">
              <label className="flex items-center gap-2.5">
                <input type="checkbox" className="accent-green" /> ★★★★★ (5 étoiles)
              </label>
              <label className="flex items-center gap-2.5">
                <input type="checkbox" className="accent-green" /> ★★★★+ (4+)
              </label>
              <label className="flex items-center gap-2.5">
                <input type="checkbox" className="accent-green" /> ★★★+ (3+)
              </label>
            </div>
          </div>
          <div className="card p-5">
            <div className="text-[15px] font-bold text-navy mb-4">🚌 Équipements</div>
            <div className="flex flex-col gap-2.5 text-sm text-greyDark">
              <label className="flex items-center gap-2.5">
                <input type="checkbox" className="accent-green" /> Climatisation
              </label>
              <label className="flex items-center gap-2.5">
                <input type="checkbox" className="accent-green" /> Bagages inclus
              </label>
              <label className="flex items-center gap-2.5">
                <input type="checkbox" className="accent-green" /> USB / Chargeur
              </label>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <div className="text-base font-semibold text-navy">
              {searchResults.length} trajets disponibles
            </div>
            <select className="border-[1.5px] border-greyLight rounded-sm2 px-4 py-2 text-sm text-greyDark bg-white cursor-pointer">
              <option>Trier : Heure de départ</option>
              <option>Prix croissant</option>
              <option>Prix décroissant</option>
              <option>Meilleure note</option>
            </select>
          </div>
          <div>
            {searchResults.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
