"use client";

import { useEffect, useState } from "react";
import {
  Home,
  Bus,
  ClipboardList,
  Camera,
  BarChart3,
  User,
  CreditCard,
  LogOut,
  Plus,
} from "lucide-react";
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

export default function AgencyDashboard() {
  const { goTo, showToast, setAddTripModalOpen, logout, firebaseReady, user } = useApp();
  const [todayTrips, setTodayTrips] = useState<Trip[]>([]);
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [agencyId, setAgencyId] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
  const [stats, setStats] = useState<AgencyStats | null>(null);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }

    const email = user?.email || "";
    setLoading(true);

    async function load() {
      let id = "";
      let name = "";

      if (email) {
        const agency = await fetchAgencyByEmail(email);
        if (agency) {
          id = agency.id as string;
          name = (agency as any).name || id;
          setIsPremium(!!(agency as any).isPremium);
        }
      }

      setAgencyId(id);
      setAgencyName(name);

      const [trips, bookings, dashboardStats] = await Promise.all([
        fetchTrips({ agencyId: id }).catch(() => [] as Trip[]),
        fetchBookingsByAgency(id).catch(() => []),
        fetchAgencyDashboardStats(id).catch(() => null),
      ]);

      setTodayTrips(trips.slice(0, 4));
      setRecentBookings(bookings.slice(0, 4));
      if (dashboardStats) setStats(dashboardStats);
      setLoading(false);
    }

    load();
  }, [firebaseReady, user]);

  const trips = todayTrips;
  const bookings = recentBookings;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] min-h-[calc(100vh-4rem)]">
      <div className="hidden lg:block bg-navy py-6">
        <div className="px-5 pb-6 border-b border-white/10 mb-3">
          <div className="text-white text-base font-bold">{agencyName || "Mon Agence"}</div>
          <div className="text-white/50 text-xs mt-0.5">Tableau de bord agence</div>
          {isPremium && (
            <div className="inline-block bg-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5">
              PREMIUM ★
            </div>
          )}
        </div>
        <ul>
          <SidebarLink icon={<Home size={16} />} label="Dashboard" active />
          <SidebarLink icon={<Bus size={16} />} label="Mes Trajets" onClick={() => setAddTripModalOpen(true)} />
          <SidebarLink icon={<ClipboardList size={16} />} label="Réservations" />
          <SidebarLink icon={<Camera size={16} />} label="Validation QR" />
          <SidebarLink icon={<BarChart3 size={16} />} label="Statistiques" />
          <SidebarLink icon={<User size={16} />} label="Profil Agence" />
          <SidebarLink icon={<CreditCard size={16} />} label="Abonnement" />
          <li className="mt-6">
            <div
              className="flex items-center gap-3 px-5 py-3 text-red cursor-pointer text-sm font-medium"
              onClick={logout}
            >
              <LogOut size={16} /> Déconnexion
            </div>
          </li>
        </ul>
      </div>

      <div className="bg-bg p-5 md:p-7 overflow-y-auto">
        <div className="flex items-center justify-between mb-7 flex-wrap gap-3">
          <div>
            <div className="text-xl md:text-[22px] font-bold text-navy">
              Bonjour, {agencyName || "Agence"} 👋
            </div>
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
          <Kpi label="📋 Réservations" value={loading ? "..." : String(stats?.totalBookings ?? bookings.length)} change="Toutes les réservations" />
          <Kpi label="💺 Places vendues" value={loading ? "..." : String(stats?.seatsSold ?? 0)} sub={stats ? `/ ${stats.totalSeats}` : undefined} change={stats && stats.totalSeats > 0 ? `${Math.round((stats.seatsSold / stats.totalSeats) * 100)}% de remplissage` : "---"} />
          <Kpi label="💰 Revenus" value={loading ? "..." : stats ? `${fmt(stats.totalRevenue)} F` : "---"} change="Tous les revenus" small />
          <Kpi label="⭐ Note moyenne" value={loading ? "..." : stats?.averageRating ? stats.averageRating.toFixed(1) : "---"} change={`${stats?.reviewsCount ?? 0} avis`} changeColor="text-yellow" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_340px] gap-5">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-6 py-5 border-b border-greyLight">
              <div className="text-base font-bold text-navy">🚌 Trajets du jour</div>
              <button
                className="btn-ghost text-[13px] px-3.5 py-2"
                onClick={() => setAddTripModalOpen(true)}
              >
                + Nouveau
              </button>
            </div>
            {trips.length === 0 && !loading && (
              <div className="px-6 py-8 text-center text-sm text-greyMid">
                Aucun trajet pour le moment. Cliquez sur "+ Nouveau" pour en créer un.
              </div>
            )}
            {trips.map((trip, i) => {
              const filled = trip.total - trip.seats;
              const fillPct = trip.total > 0 ? Math.min(100, (filled / trip.total) * 100) : 0;
              return (
                <div
                  key={trip.id || i}
                  className="flex items-center gap-4 px-6 py-4 border-b border-greyLight last:border-b-0 hover:bg-bg transition-colors"
                >
                  <div className="text-base font-bold text-navy min-w-[50px]">{trip.depH}</div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-greyDark">{trip.depart} → {trip.arrive}</div>
                    <div className="text-xs text-greyMid">{trip.depStop} → {trip.arrStop}</div>
                  </div>
                  <div className="min-w-[80px] text-right">
                    <div className="text-[13px] font-bold text-navy">{filled}/{trip.total}</div>
                    <div className="h-1.5 bg-greyLight rounded-full mt-1">
                      <div
                        className={`h-full rounded-full ${
                          trip.status === "full" ? "bg-red" : trip.status === "urgent" ? "bg-orange" : "bg-green"
                        }`}
                        style={{ width: `${fillPct}%` }}
                      />
                    </div>
                    <span
                      className={`badge mt-1 text-[11px] ${
                        trip.status === "full" ? "badge-red" : trip.status === "urgent" ? "badge-orange" : "badge-green"
                      }`}
                    >
                      {trip.status === "full"
                        ? "COMPLET"
                        : trip.status === "urgent"
                        ? `⚠️ ${trip.seats} restantes`
                        : `🟢 ${Math.round(fillPct)}%`}
                    </span>
                  </div>
                  <div className="flex gap-1.5">
                    {trip.status !== "full" && (
                      <button
                        className="px-3 py-1.5 rounded-md text-xs font-semibold bg-[#ffe8ea] text-red hover:bg-red hover:text-white transition-all"
                        onClick={async () => {
                          await updateTrip(trip.id, { status: "full" });
                          showToast("🔴 Trajet clôturé");
                          setTodayTrips((prev) =>
                            prev.map((t) => (t.id === trip.id ? { ...t, status: "full" as const } : t))
                          );
                        }}
                      >
                        Clôturer
                      </button>
                    )}
                    <button
                      className={`px-3 py-1.5 rounded-md text-xs font-semibold bg-bg text-greyDark border border-greyLight ${
                        trip.status === "full" ? "opacity-50" : ""
                      }`}
                      disabled={trip.status === "full"}
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
            {bookings.map((b: any, i: number) => (
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
              <button className="btn-ghost text-[13px] w-full">
                Voir toutes les réservations →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarLink({
  icon,
  label,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <li>
      <div
        className={`flex items-center gap-3 px-5 py-3 text-sm font-medium cursor-pointer transition-all border-l-[3px] ${
          active
            ? "text-white border-green bg-green/10"
            : "text-white/60 border-transparent hover:text-white hover:bg-white/5"
        }`}
        onClick={onClick}
      >
        {icon} {label}
      </div>
    </li>
  );
}

function Kpi({
  label,
  value,
  sub,
  change,
  changeColor = "text-green",
  small,
}: {
  label: string;
  value: string;
  sub?: string;
  change: string;
  changeColor?: string;
  small?: boolean;
}) {
  return (
    <div className="card p-5">
      <div className="text-[13px] text-greyMid mb-2">{label}</div>
      <div className={`font-extrabold text-navy ${small ? "text-xl" : "text-[28px]"}`}>
        {value} {sub && <span className="text-base text-greyMid">{sub}</span>}
      </div>
      <div className={`text-xs mt-1 ${changeColor}`}>{change}</div>
    </div>
  );
}