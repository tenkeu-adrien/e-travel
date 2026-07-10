"use client";

import { useState } from "react";
import { Check, User, CreditCard, Lock } from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { fees, fmt } from "@/lib/trips";
import { PaymentMethod } from "@/lib/types";

const GUIDES: Record<PaymentMethod, string[]> = {
  orange: [
    "Entrez votre numéro Orange Money ci-dessus",
    'Cliquez "Payer" — une notification apparaîtra sur votre téléphone',
    "Confirmez avec votre code secret Orange Money",
    "Votre billet est envoyé instantanément sur WhatsApp 🎉",
  ],
  mtn: [
    "Entrez votre numéro MTN MoMo",
    'Cliquez "Payer" — composez *126# pour approuver',
    "Entrez votre PIN MoMo",
    "Billet reçu sur WhatsApp 🎉",
  ],
  card: [],
};

export default function PaymentPage() {
  const { currentTrip: t, qty, selectedPayment, setSelectedPayment, confirmBooking, showToast } =
    useApp();
  const sub = t.price * qty;
  const fee = fees(sub);
  const total = sub + fee;

  const [prenom, setPrenom] = useState("");
  const [nom, setNom] = useState("");
  const [phone, setPhone] = useState("");
  const [cgu, setCgu] = useState(false);
  const [loading, setLoading] = useState(false);

  async function pay() {
    if (!prenom.trim()) return showToast("⚠️ Veuillez entrer votre prénom");
    if (!nom.trim()) return showToast("⚠️ Veuillez entrer votre nom");
    if (!phone.trim() || phone.trim().length < 8)
      return showToast("⚠️ Numéro WhatsApp invalide");
    if (!cgu) return showToast("⚠️ Veuillez accepter les CGU");
    setLoading(true);
    await confirmBooking({ prenom, nom, phone });
    setLoading(false);
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8">
      {/* PROGRESS BAR */}
      <div className="flex items-center justify-center mb-10">
        <Step done label="Trajet" icon={<Check size={16} />} />
        <div className="w-16 md:w-20 h-0.5 bg-green mb-5" />
        <Step active label="Paiement" num={2} />
        <div className="w-16 md:w-20 h-0.5 bg-greyLight mb-5" />
        <Step label="Confirmation" num={3} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        <div>
          <div className="card p-6 mb-5">
            <div className="text-base font-bold text-navy mb-5 flex items-center gap-2">
              <User size={18} className="text-green" /> Informations du passager
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className="form-label">Prénom *</label>
                <input
                  className="form-input"
                  placeholder="Ex: Antony"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="form-label">Nom *</label>
                <input
                  className="form-input"
                  placeholder="Ex: Salako"
                  value={nom}
                  onChange={(e) => setNom(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5 mb-4">
              <label className="form-label">
                Numéro WhatsApp *{" "}
                <span className="text-greyMid font-normal">(billet envoyé ici)</span>
              </label>
              <div className="flex">
                <span className="px-3.5 py-3 bg-bg border-[1.5px] border-greyLight border-r-0 rounded-l-lg text-sm text-greyMid">
                  🇨🇲 +237
                </span>
                <input
                  type="tel"
                  className="form-input rounded-l-none"
                  placeholder="6XX XX XX XX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="form-label">
                Email <span className="text-greyMid font-normal">(optionnel)</span>
              </label>
              <input type="email" className="form-input" placeholder="votre@email.com" />
            </div>
          </div>

          <div className="card p-6 mb-5">
            <div className="text-base font-bold text-navy mb-5 flex items-center gap-2">
              <CreditCard size={18} className="text-green" /> Mode de paiement
            </div>
            <div className="flex flex-col gap-3">
              <PaymentOption
                id="orange"
                icon="🍊"
                iconBg="bg-[#FF6600]"
                name="Orange Money"
                desc="Paiement via Orange Money Cameroun"
                selected={selectedPayment === "orange"}
                onSelect={() => setSelectedPayment("orange")}
              />
              <PaymentOption
                id="mtn"
                icon="📱"
                iconBg="bg-[#FFCC00]"
                name="MTN Mobile Money"
                desc="Paiement via MTN MoMo Cameroun"
                selected={selectedPayment === "mtn"}
                onSelect={() => setSelectedPayment("mtn")}
              />
              <PaymentOption
                id="card"
                icon="💳"
                iconBg="bg-[#1a56db]"
                name="Carte Bancaire"
                desc="Visa, Mastercard — Paiement sécurisé"
                selected={selectedPayment === "card"}
                onSelect={() => setSelectedPayment("card")}
              />
            </div>

            {(selectedPayment === "orange" || selectedPayment === "mtn") && (
              <div className="mt-4">
                <div className="flex flex-col gap-1.5 mb-3">
                  <label className="form-label">
                    Numéro {selectedPayment === "orange" ? "Orange Money" : "MTN MoMo"} *
                  </label>
                  <div className="flex">
                    <span className="px-3.5 py-3 bg-bg border-[1.5px] border-greyLight border-r-0 rounded-l-lg text-sm text-greyMid">
                      +237
                    </span>
                    <input
                      type="tel"
                      className="form-input rounded-l-none"
                      placeholder="6XX XX XX XX"
                    />
                  </div>
                </div>
                <div className="bg-[#f0fdf4] rounded-lg p-4">
                  {GUIDES[selectedPayment].map((g, i) => (
                    <div key={i} className="flex items-start gap-2.5 mb-2 text-[13px] text-greyDark">
                      <span className="w-[22px] h-[22px] rounded-full bg-green text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedPayment === "card" && (
              <div className="mt-4 grid gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="form-label">Numéro de carte *</label>
                  <input className="form-input" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="form-label">Expiration *</label>
                    <input className="form-input" placeholder="MM/AA" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="form-label">CVV *</label>
                    <input className="form-input" placeholder="123" />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-start gap-2.5 mb-5 p-4 bg-bg rounded-lg">
            <input
              type="checkbox"
              id="cgu"
              className="w-[18px] h-[18px] accent-green mt-0.5 cursor-pointer shrink-0"
              checked={cgu}
              onChange={(e) => setCgu(e.target.checked)}
            />
            <label htmlFor="cgu" className="text-[13px] text-greyDark cursor-pointer leading-relaxed">
              J&apos;accepte les{" "}
              <button className="text-green font-semibold cursor-pointer" onClick={() => showToast("📄 Conditions Générales d'Utilisation — Réservation soumise à nos CGU.")}>
                CGU
              </button>{" "}
              et la{" "}
              <button className="text-green font-semibold cursor-pointer" onClick={() => showToast("🔄 Annulation possible jusqu'à 2h avant le départ. Remboursement à 80%.")}>
                Politique d&apos;annulation
              </button>{" "}
              de e-travel.
            </label>
          </div>

          <button className="btn-primary text-[17px] py-4" onClick={pay} disabled={loading}>
            {loading ? (
              "⏳ Paiement en cours..."
            ) : (
              <><Lock size={18} /> PAYER {fmt(total)} FCFA</>
            )}
          </button>
        </div>

        <div>
          <div className="card p-6 sticky top-24">
            <div className="text-base font-bold text-navy mb-4">📋 Récapitulatif</div>
            <div className="bg-bg rounded-lg p-4 mb-4">
              <div className="text-base font-bold text-navy mb-1">
                {t.depart} → {t.arrive}
              </div>
              <div className="text-[13px] text-greyMid mb-1">📅 {t.date ? new Date(t.date).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Date non renseignée"} · {t.depH}</div>
              <div className="text-[13px] text-greyDark font-semibold">🏢 {t.agency}</div>
            </div>
            <div className="bg-bg rounded-lg p-4 mb-4">
              <Row label={`${qty} ticket${qty > 1 ? "s" : ""}`} value={`${fmt(sub)} FCFA`} />
              <Row label="Frais de service (5%)" value={`${fmt(fee)} FCFA`} />
              <div className="flex justify-between items-center pt-3 mt-2 border-t border-greyLight font-extrabold text-[16px] text-navy">
                <span>Total</span>
                <span>{fmt(total)} FCFA</span>
              </div>
            </div>
            <div className="p-3 bg-[#f0fdf4] rounded-lg text-xs text-[#0d7a3c] leading-relaxed">
              🔒 Paiement sécurisé SSL
              <br />
              📲 Billet envoyé sur WhatsApp
              <br />
              ✅ Confirmation instantanée
            </div>
          </div>
        </div>
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

function Step({
  done,
  active,
  label,
  num,
  icon,
}: {
  done?: boolean;
  active?: boolean;
  label: string;
  num?: number;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
          done
            ? "bg-green border-green text-white"
            : active
            ? "bg-navy border-navy text-white"
            : "bg-white border-greyLight text-greyMid"
        }`}
      >
        {icon ?? num}
      </div>
      <div className={`text-xs font-medium ${active ? "text-navy font-bold" : "text-greyMid"}`}>
        {label}
      </div>
    </div>
  );
}

function PaymentOption({
  icon,
  iconBg,
  name,
  desc,
  selected,
  onSelect,
}: {
  id: string;
  icon: string;
  iconBg: string;
  name: string;
  desc: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      className={`border-2 rounded-sm2 px-5 py-4 cursor-pointer transition-all flex items-center gap-4 ${
        selected ? "border-green bg-green-light" : "border-greyLight hover:border-green hover:bg-green-light"
      }`}
      onClick={onSelect}
    >
      <div className={`w-12 h-8 rounded-md flex items-center justify-center text-xl ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1">
        <div className="text-[15px] font-bold text-navy">{name}</div>
        <div className="text-[13px] text-greyMid">{desc}</div>
      </div>
      <div
        className={`w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
          selected ? "border-green" : "border-greyLight"
        }`}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-green" />}
      </div>
    </div>
  );
}
