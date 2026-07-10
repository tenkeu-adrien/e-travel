"use client";

import { useEffect, useState } from "react";
import { BarChart3, TrendingUp, Users, DollarSign, Star } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { fetchAgencyByEmail, fetchAgencyDashboardStats, fetchBookingsByAgency } from "@/lib/firebase/firestore";
import { fmt } from "@/lib/trips";

export default function AgencyStats() {
  const { firebaseReady, user } = useApp();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<any[]>([]);

  useEffect(() => {
    if (!firebaseReady || !user?.email) return;
    setLoading(true);
    fetchAgencyByEmail(user.email).then(async (agency) => {
      if (!agency) { setLoading(false); return; }
      const [s, b] = await Promise.all([
        fetchAgencyDashboardStats(agency.id as string),
        fetchBookingsByAgency(agency.id as string),
      ]);
      setStats(s);
      setBookings(b);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [firebaseReady, user]);

  if (loading) return <div className="text-center py-20 text-sm text-greyMid">Chargement...</div>;

  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 size={24} className="text-green" />
        <h1 className="text-2xl font-bold text-navy">Statistiques</h1>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp size={20} className="text-green" />
            <span className="text-sm text-greyMid">Trajets</span>
          </div>
          <div className="text-3xl font-extrabold text-navy">{stats?.totalTrips ?? 0}</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Users size={20} className="text-green" />
            <span className="text-sm text-greyMid">Réservations</span>
          </div>
          <div className="text-3xl font-extrabold text-navy">{stats?.totalBookings ?? 0}</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <DollarSign size={20} className="text-green" />
            <span className="text-sm text-greyMid">Revenus totaux</span>
          </div>
          <div className="text-3xl font-extrabold text-navy">{stats?.totalRevenue ? `${fmt(stats.totalRevenue)} F` : "---"}</div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3 mb-3">
            <Star size={20} className="text-green" />
            <span className="text-sm text-greyMid">Note moyenne</span>
          </div>
          <div className="text-3xl font-extrabold text-navy">{stats?.averageRating?.toFixed(1) ?? "---"}</div>
        </div>
      </div>
      <div className="card p-6">
        <h3 className="text-base font-bold text-navy mb-4">📊 Indicateurs clés</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b border-greyLight">
            <span className="text-greyMid">Places vendues</span>
            <span className="font-semibold text-navy">{stats?.seatsSold ?? 0} / {stats?.totalSeats ?? 0}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-greyLight">
            <span className="text-greyMid">Taux de remplissage</span>
            <span className="font-semibold text-navy">{stats && stats.totalSeats > 0 ? `${Math.round((stats.seatsSold / stats.totalSeats) * 100)}%` : "---"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-greyLight">
            <span className="text-greyMid">Nombre d'avis</span>
            <span className="font-semibold text-navy">{stats?.reviewsCount ?? 0}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-greyMid">Revenu moyen par trajet</span>
            <span className="font-semibold text-navy">{stats && stats.totalTrips > 0 ? `${fmt(Math.round(stats.totalRevenue / stats.totalTrips))} F` : "---"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
