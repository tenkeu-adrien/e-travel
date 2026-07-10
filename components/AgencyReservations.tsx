"use client";

import { useEffect, useState } from "react";
import { ClipboardList } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { fetchBookingsByAgency, fetchAgencyByEmail } from "@/lib/firebase/firestore";
import { fmt } from "@/lib/trips";

export default function AgencyReservations() {
  const { firebaseReady, user } = useApp();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!firebaseReady || !user?.email) return;
    setLoading(true);
    fetchAgencyByEmail(user.email).then((agency) => {
      if (!agency) { setLoading(false); return; }
      fetchBookingsByAgency(agency.id as string).then((data) => {
        setBookings(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, [firebaseReady, user]);
  return (
    <div className="max-w-[900px] mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList size={24} className="text-green" />
        <h1 className="text-2xl font-bold text-navy">Réservations</h1>
      </div>
      {loading ? (
        <div className="text-center py-10 text-sm text-greyMid">Chargement...</div>
      ) : bookings.length === 0 ? (
        <div className="card p-8 text-center text-sm text-greyMid">Aucune réservation pour le moment.</div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-bg">
              <tr className="text-left text-greyMid text-xs uppercase tracking-wider">
                <th className="px-5 py-3 font-semibold">Réf</th>
                <th className="px-5 py-3 font-semibold">Passager</th>
                <th className="px-5 py-3 font-semibold">Téléphone</th>
                <th className="px-5 py-3 font-semibold">Montant</th>
                <th className="px-5 py-3 font-semibold">Statut</th>
                <th className="px-5 py-3 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b: any, i: number) => (
                <tr key={b.id || i} className="border-t border-greyLight hover:bg-bg/50">
                  <td className="px-5 py-3 font-mono font-semibold text-navy">{b.ref || "---"}</td>
                  <td className="px-5 py-3">{b.prenom} {b.nom}</td>
                  <td className="px-5 py-3">{b.phone}</td>
                  <td className="px-5 py-3 font-semibold">{b.totalAmount ? `${fmt(b.totalAmount)} F` : "---"}</td>
                  <td className="px-5 py-3">
                    <span className={`badge ${b.status === "confirmed" ? "badge-green" : b.status === "cancelled" ? "badge-red" : "badge-orange"}`}>
                      {b.status || "confirmé"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-greyMid">
                    {b.createdAt?.toDate ? b.createdAt.toDate().toLocaleDateString("fr-FR") : "---"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
