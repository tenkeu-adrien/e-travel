"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import {
  fetchTrips,
  fetchBookingsByAgency,
  fetchAgencyByEmail,
  fetchAgencyDashboardStats,
  updateTrip,
  AgencyStats,
} from "@/lib/firebase/firestore";
import { Trip } from "@/lib/types";
import { fmt } from "@/lib/trips";
import EditTripModal from "./EditTripModal";

export default function AgencyDashboard() {
  const { goTo, showToast, setAddTripModalOpen, firebaseReady, user, agencyName } = useApp();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyId, setAgencyId] = useState("");
  const [stats, setStats] = useState<AgencyStats | null>(null);
  const [editTrip, setEditTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (!firebaseReady) { setLoading(false); return; }
    const email = user?.email || "";
    setLoading(true);
    async function load() {
      let id = "";
      if (email) {
        const agency = await fetchAgencyByEmail(email);
        if (agency) {
          id = agency.id as string;
        }
      }
      setAgencyId(id);
      const [t, b, s] = await Promise.all([
        fetchTrips({ agencyId: id }).catch(() => [] as Trip[]),
        fetchBookingsByAgency(id).catch(() => []),
        fetchAgencyDashboardStats(id).catch(() => null),
      ]);
      setTrips(t);
      setBookings(b);
      if (s) setStats(s);
      setLoading(false);
    }
    load();
  }, [firebaseReady, user]);

  return (
    <>
      <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
        <div>
          <div className="text-xl md:text-[22px] font-bold text-navy">Bonjour, {agencyName || "Agence"} 👋</div>
          <div className="text-sm text-greyMid mt-0.5">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })} — Tableau de bord en temps réel
          </div>
        </div>
        <button
          className="bg-green text-white px-6 py-3 rounded-sm2 font-semibold flex items-center gap-2 hover:bg-green-dark transition-all"
          onClick={() => setAddTripModalOpen(true)}
        >
          <Plus size={16} /> Ajouter un trajet
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
        <Kpi label="📋 Réservations" value={loading ? "..." : String(stats?.totalBookings ?? bookings.length)} change="Toutes les réservations" onClick={() => goTo("agency-reservations")} />
        <Kpi label="💺 Places vendues" value={loading ? "..." : String(stats?.seatsSold ?? 0)} sub={stats ? `/ ${stats.totalSeats}` : undefined} change={stats && stats.totalSeats > 0 ? `${Math.round((stats.seatsSold / stats.totalSeats) * 100)}% de remplissage` : "---"} />
        <Kpi label="💰 Revenus" value={loading ? "..." : stats ? `${fmt(stats.totalRevenue)} F` : "---"} change="Tous les revenus" small />
        <Kpi label="⭐ Note moyenne" value={loading ? "..." : stats?.averageRating ? stats.averageRating.toFixed(1) : "---"} change={`${stats?.reviewsCount ?? 0} avis`} changeColor="text-yellow" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-greyLight">
            <div className="text-base font-bold text-navy">🚌 Trajets récents</div>
            <button className="btn-ghost text-[13px] px-3.5 py-2" onClick={() => setAddTripModalOpen(true)}>+ Nouveau</button>
          </div>
          {trips.length === 0 && !loading && (
            <div className="px-6 py-8 text-center text-sm text-greyMid">
              Aucun trajet pour le moment. Cliquez sur "+ Nouveau" pour en créer un.
            </div>
          )}
          {trips.slice(0, 5).map((trip, i) => {
            const filled = trip.total - trip.seats;
            const fillPct = trip.total > 0 ? Math.min(100, (filled / trip.total) * 100) : 0;
            return (
              <div key={trip.id || i} className="flex items-center gap-4 px-6 py-4 border-b border-greyLight last:border-b-0 hover:bg-bg transition-colors">
                <div className="text-base font-bold text-navy min-w-[50px]">{trip.depH}</div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-greyDark">{trip.depart} → {trip.arrive}</div>
                  <div className="text-xs text-greyMid">{trip.depStop} → {trip.arrStop}</div>
                </div>
                <div className="min-w-[80px] text-right">
                  <div className="text-[13px] font-bold text-navy">{filled}/{trip.total}</div>
                  <div className="h-1.5 bg-greyLight rounded-full mt-1">
                    <div className={`h-full rounded-full ${trip.status === "full" ? "bg-red" : trip.status === "urgent" ? "bg-orange" : "bg-green"}`} style={{ width: `${fillPct}%` }} />
                  </div>
                  <span className={`badge mt-1 text-[11px] ${trip.status === "full" ? "badge-red" : trip.status === "urgent" ? "badge-orange" : "badge-green"}`}>
                    {trip.status === "full" ? "COMPLET" : trip.status === "urgent" ? `⚠️ ${trip.seats} restantes` : `🟢 ${Math.round(fillPct)}%`}
                  </span>
                </div>
                <div className="flex gap-1.5">
                  {trip.status !== "full" && (
                    <button
                      className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#ffe8ea] text-red hover:bg-red hover:text-white transition-all"
                      onClick={async () => {
                        await updateTrip(trip.id, { status: "full" });
                        showToast("🔴 Trajet clôturé");
                        setTrips((prev) => prev.map((t) => (t.id === trip.id ? { ...t, status: "full" as const } : t)));
                      }}
                    >
                      Clôturer
                    </button>
                  )}
                  <button
                    className={`px-3 py-1.5 rounded-md text-xs font-semibold bg-bg text-greyDark border border-greyLight transition-all hover:border-green ${trip.status === "full" ? "opacity-50" : ""}`}
                    disabled={trip.status === "full"}
                    onClick={() => setEditTrip(trip)}
                  >
                    Modifier
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-6 py-5 border-b border-greyLight">
            <div className="text-base font-bold text-navy">🔔 Dernières réservations</div>
            <span className="badge badge-green text-[11px]">En direct</span>
          </div>
          {bookings.length === 0 && !loading && (
            <div className="px-6 py-8 text-center text-sm text-greyMid">
              Aucune réservation pour le moment.
            </div>
          )}
          {bookings.slice(0, 4).map((b: any, i: number) => (
            <div key={i} className="flex items-center gap-3 px-6 py-3.5 border-b border-greyLight">
              <div className="w-9 h-9 rounded-full bg-green-light text-green flex items-center justify-center text-sm font-bold shrink-0">
                {(b.nom?.[0] || "X") + (b.prenom?.[0] || "X")}
              </div>
              <div>
                <div className="text-sm font-semibold text-navy">{b.nom} {b.prenom}</div>
                <div className="text-xs text-greyMid">{b.ref ? `Réf: ${b.ref}` : ""}</div>
              </div>
              <div className="text-xs text-greyMid ml-auto whitespace-nowrap">
                {b.createdAt?.toDate ? b.createdAt.toDate().toLocaleTimeString("fr-FR") : ""}
              </div>
            </div>
          ))}
          <div className="px-6 py-3.5 text-center">
            <button className="btn-ghost text-[13px] w-full" onClick={() => goTo("agency-reservations")}>
              Voir toutes les réservations →
            </button>
          </div>
        </div>
      </div>

      <EditTripModal trip={editTrip} open={!!editTrip} onClose={() => setEditTrip(null)} />
    </>
  );
}

function Kpi({ label, value, sub, change, changeColor = "text-green", small, onClick }: {
  label: string; value: string; sub?: string; change: string; changeColor?: string; small?: boolean; onClick?: () => void;
}) {
  return (
    <div className={`card p-5 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`} onClick={onClick}>
      <div className="text-[13px] text-greyMid mb-2">{label}</div>
      <div className={`font-extrabold text-navy ${small ? "text-xl" : "text-[28px]"}`}>
        {value} {sub && <span className="text-base text-greyMid">{sub}</span>}
      </div>
      <div className={`text-xs mt-1 ${changeColor}`}>{change}</div>
    </div>
  );
}
