"use client";

import {
  CheckCircle2,
  MessageCircle,
  Bus,
  Download,
  Send,
  Home,
  Clock,
  Contact,
  Luggage,
  Phone,
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { fees, fmt } from "@/lib/trips";

export default function ConfirmPage() {
  const { currentTrip: t, qty, booking, goTo, showToast } = useApp();
  const total = t.price * qty + fees(t.price * qty);

  const tripDate = t.date
    ? new Date(t.date).toLocaleDateString("fr-FR", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date non renseignée";

  return (
    <div className="max-w-[720px] mx-auto px-6 py-10">
      <div className="text-center mb-10">
        <CheckCircle2 size={72} className="text-green mx-auto mb-4" />
        <h1 className="text-[28px] font-extrabold text-navy mb-2">
          Réservation confirmée !
        </h1>
        <p className="text-base text-greyMid">
          Votre billet a été envoyé sur WhatsApp au{" "}
          <strong>+237 {booking.phone}</strong>
        </p>
        <div className="inline-flex items-center gap-2 bg-[#25D366] text-white px-5 py-2.5 rounded-full text-sm font-bold mt-3">
          <MessageCircle size={16} /> Vérifiez votre WhatsApp maintenant
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.12)] overflow-hidden mb-7">
        <div className="bg-gradient-to-br from-navy to-[#1a3055] px-7 py-6 text-white">
          <div className="flex items-center justify-between mb-5">
            <div className="text-lg font-extrabold flex items-center gap-2">
              <div className="w-8 h-8 bg-green rounded-md flex items-center justify-center">
                <Bus size={16} />
              </div>
              e-travel
            </div>
            <div className="text-[13px] text-white/60 font-mono">
              Réf : {booking.ref}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-[28px] font-extrabold">{t.depH}</div>
              <div className="text-sm text-white/80 mt-0.5">{t.depart.toUpperCase()}</div>
            </div>
            <div className="flex-1 text-center">
              <div>🚌 ──────</div>
              <div className="text-[13px] text-white/60 mt-1">{t.dur}</div>
            </div>
            <div className="text-center text-right">
              <div className="text-[28px] font-extrabold">{t.arrH}</div>
              <div className="text-sm text-white/80 mt-0.5">{t.arrive.toUpperCase()}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center bg-bg relative">
          <div className="flex-1 border-t-2 border-dashed border-greyLight mx-6 my-4" />
        </div>

        <div className="px-7 py-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 mb-6">
            <TicketInfo label="Passager" value={`${booking.nom.toUpperCase()} ${booking.prenom}`} />
            <TicketInfo label="Date" value={tripDate} />
            <TicketInfo label="Agence" value={t.agency} />
            <TicketInfo label="Départ" value={`${t.depStop}, ${t.depart}`} />
            <TicketInfo label="Passagers" value={`${qty} passager${qty > 1 ? "s" : ""}`} />
            <TicketInfo label="Montant payé" value={`${fmt(total)} FCFA`} />
          </div>
          <div className="flex items-center gap-6 pt-5 border-t border-greyLight">
            <div className="w-[120px] h-[120px] bg-white border-2 border-greyLight rounded-[10px] flex items-center justify-center shrink-0">
              <QrPlaceholder />
            </div>
            <div>
              <div className="text-[15px] font-bold text-navy mb-1.5">
                QR Code d&apos;embarquement
              </div>
              <div className="text-[13px] text-greyMid leading-relaxed">
                Présentez ce QR code à l&apos;agent à l&apos;embarquement. Usage
                unique et sécurisé.
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#f0fdf4] px-7 py-4 border-t border-greyLight">
          <div className="flex gap-6 flex-wrap text-[13px] text-greyDark">
            <span className="flex items-center gap-1.5">
              <Clock size={14} /> Arrivez 15 min avant
            </span>
            <span className="flex items-center gap-1.5">
              <Contact size={14} /> Pièce d&apos;identité requise
            </span>
            <span className="flex items-center gap-1.5">
              <Luggage size={14} /> 1 bagage inclus
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap mb-7">
        <button
          className="flex-1 min-w-[160px] px-5 py-3.5 rounded-sm2 text-sm font-semibold flex items-center justify-center gap-2 bg-navy text-white transition-all hover:opacity-90"
          onClick={() => showToast("✅ Billet PDF téléchargé !")}
        >
          <Download size={16} /> Télécharger PDF
        </button>
        <button
          className="flex-1 min-w-[160px] px-5 py-3.5 rounded-sm2 text-sm font-semibold flex items-center justify-center gap-2 bg-[#25D366] text-white transition-all hover:opacity-90"
          onClick={() => showToast("📲 Billet renvoyé sur WhatsApp !")}
        >
          <Send size={16} /> Renvoyer sur WhatsApp
        </button>
        <button
          className="flex-1 min-w-[160px] px-5 py-3.5 rounded-sm2 text-sm font-semibold flex items-center justify-center gap-2 bg-bg text-greyDark border-[1.5px] border-greyLight transition-all hover:border-green"
          onClick={() => goTo("home")}
        >
          <Home size={16} /> Retour à l&apos;accueil
        </button>
      </div>

      <div className="bg-[#fff8e1] rounded-card px-6 py-5">
        <div className="text-[15px] font-bold text-[#8a6200] mb-3">
          💡 Informations utiles
        </div>
        <div className="flex flex-col gap-2 text-sm text-[#5c4200]">
          <div className="flex items-start gap-2">
            <Clock size={16} className="mt-0.5 shrink-0" /> Présentez-vous{" "}
            <strong>&nbsp;15 minutes avant le départ</strong>
          </div>
          <div className="flex items-start gap-2">
            <Contact size={16} className="mt-0.5 shrink-0" /> Ayez votre{" "}
            <strong>&nbsp;pièce d&apos;identité</strong> (CNI ou passeport)
          </div>
          <div className="flex items-start gap-2">
            <Luggage size={16} className="mt-0.5 shrink-0" />{" "}
            <strong>1 bagage en soute</strong> inclus (max 25 kg)
          </div>
        </div>
      </div>
    </div>
  );
}

function TicketInfo({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-greyMid mb-1">{label}</div>
      <div className="text-sm font-bold text-navy">{value}</div>
    </div>
  );
}

function QrPlaceholder() {
  return (
    <svg width="110" height="110" viewBox="0 0 110 110" xmlns="http://www.w3.org/2000/svg">
      <rect width="110" height="110" fill="white" />
      <rect x="8" y="8" width="28" height="28" rx="3" fill="#0A1628" />
      <rect x="12" y="12" width="20" height="20" rx="2" fill="white" />
      <rect x="16" y="16" width="12" height="12" rx="1" fill="#0A1628" />
      <rect x="74" y="8" width="28" height="28" rx="3" fill="#0A1628" />
      <rect x="78" y="12" width="20" height="20" rx="2" fill="white" />
      <rect x="82" y="16" width="12" height="12" rx="1" fill="#0A1628" />
      <rect x="8" y="74" width="28" height="28" rx="3" fill="#0A1628" />
      <rect x="12" y="78" width="20" height="20" rx="2" fill="white" />
      <rect x="16" y="82" width="12" height="12" rx="1" fill="#0A1628" />
      <rect x="42" y="8" width="6" height="6" fill="#0A1628" />
      <rect x="50" y="8" width="6" height="6" fill="#0A1628" />
      <rect x="42" y="42" width="6" height="6" fill="#1DB954" />
      <rect x="50" y="42" width="6" height="6" fill="#0A1628" />
      <rect x="58" y="42" width="6" height="6" fill="#0A1628" />
      <rect x="66" y="42" width="6" height="6" fill="#1DB954" />
      <rect x="42" y="50" width="6" height="6" fill="#0A1628" />
      <rect x="58" y="50" width="6" height="6" fill="#1DB954" />
      <rect x="74" y="50" width="6" height="6" fill="#0A1628" />
      <rect x="42" y="58" width="6" height="6" fill="#1DB954" />
      <rect x="50" y="58" width="6" height="6" fill="#0A1628" />
      <rect x="66" y="58" width="6" height="6" fill="#0A1628" />
      <rect x="50" y="74" width="6" height="6" fill="#0A1628" />
      <rect x="66" y="74" width="6" height="6" fill="#1DB954" />
      <rect x="42" y="82" width="6" height="6" fill="#1DB954" />
      <rect x="58" y="82" width="6" height="6" fill="#0A1628" />
      <rect x="74" y="66" width="6" height="6" fill="#1DB954" />
      <rect x="90" y="66" width="6" height="6" fill="#0A1628" />
      <rect x="82" y="74" width="6" height="6" fill="#0A1628" />
      <rect x="90" y="82" width="6" height="6" fill="#1DB954" />
    </svg>
  );
}