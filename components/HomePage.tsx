"use client";

import { useEffect, useState } from "react";
import {
  Search,
  ArrowLeftRight,
  MapPin,
  Calendar,
  Flame,
  CreditCard,
  MessageCircleMore,
  Building2,
} from "lucide-react";
import { useApp } from "@/lib/AppContext";
import { fetchCities, fetchAgencies } from "@/lib/firebase/firestore";

export default function HomePage() {
  const { search, showToast, firebaseReady } = useApp();
  const [depart, setDepart] = useState("");
  const [arrivee, setArrivee] = useState("");
  const [date, setDate] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [agencies, setAgencies] = useState<string[]>([]);
  const [stats, setStats] = useState({ travelers: "---", agenciesCount: "---", lines: "---" });

  useEffect(() => {
    if (!firebaseReady) return;
    fetchCities().then(setCities).catch(() => {});
    fetchAgencies()
      .then((list) => {
        setAgencies(list.map((a: any) => a.name || "").filter(Boolean));
        setStats((s) => ({ ...s, agenciesCount: String(list.length) }));
      })
      .catch(() => {});
  }, [firebaseReady]);

  const destinations = cities.filter((c) => c !== depart);

  function swap() {
    const d = depart;
    setDepart(arrivee);
    setArrivee(d);
  }

  function doSearch() {
    if (!depart || !arrivee) {
      showToast("⚠️ Veuillez choisir une ville de départ et une destination");
      return;
    }
    if (depart === arrivee) {
      showToast("⚠️ Le départ et la destination ne peuvent pas être identiques");
      return;
    }
    search(depart, arrivee);
  }

  function quickSearch(dep: string, arr: string) {
    setDepart(dep);
    setArrivee(arr);
    search(dep, arr);
  }

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy to-[#1a2f55] min-h-[520px] flex items-center">
        <div className="absolute -top-1/2 -right-[20%] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(29,185,84,0.15)_0%,transparent_70%)]" />
        <div className="relative z-10 w-full px-6 py-10 max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_420px] gap-12 items-center">
          <div>
            <h1 className="text-3xl md:text-[42px] font-extrabold text-white leading-tight mb-4">
              Voyagez partout
              <br />
              au <span className="text-green">Cameroun</span>
              <br />
              sans faire la queue
            </h1>
            <p className="text-lg text-white/70 mb-8 leading-relaxed">
              Réservez votre ticket de bus en ligne en moins de 3 minutes.
              Payez avec Orange Money ou MTN MoMo. Recevez votre billet sur
              WhatsApp.
            </p>
            <div className="flex gap-8">
              <div>
                <div className="text-[28px] font-extrabold text-green">{stats.travelers}</div>
                <div className="text-[13px] text-white/60">Voyageurs satisfaits</div>
              </div>
              <div>
                <div className="text-[28px] font-extrabold text-green">{stats.agenciesCount}</div>
                <div className="text-[13px] text-white/60">Agences partenaires</div>
              </div>
              <div>
                <div className="text-[28px] font-extrabold text-green">{stats.lines}</div>
                <div className="text-[13px] text-white/60">Lignes actives</div>
              </div>
            </div>
          </div>

          {/* SEARCH BOX */}
          <div className="bg-white rounded-2xl p-7 shadow-[0_20px_60px_rgba(0,0,0,0.3)]">
            <div className="text-lg font-bold text-navy mb-5 flex items-center gap-2">
              <Search size={18} className="text-green" /> Rechercher un trajet
            </div>
            <div className="grid gap-4">
              <div className="grid grid-cols-[1fr_40px_1fr] gap-2 items-end">
                <div className="flex flex-col gap-1.5">
                  <label className="form-label flex items-center gap-1">
                    <MapPin size={14} /> Ville de départ
                  </label>
                  <select
                    className="form-select"
                    value={depart}
                    onChange={(e) => setDepart(e.target.value)}
                  >
                    <option value="">Choisir une ville</option>
                    {cities.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="w-10 h-11 bg-green-light text-green rounded-lg flex items-center justify-center transition-all hover:bg-green hover:text-white self-end"
                  onClick={swap}
                  aria-label="Inverser les villes"
                >
                  <ArrowLeftRight size={18} />
                </button>
                <div className="flex flex-col gap-1.5">
                  <label className="form-label flex items-center gap-1">
                    <MapPin size={14} /> Destination
                  </label>
                  <select
                    className="form-select"
                    value={arrivee}
                    onChange={(e) => setArrivee(e.target.value)}
                  >
                    <option value="">Choisir une ville</option>
                    {destinations.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="form-label flex items-center gap-1">
                  <Calendar size={14} /> Date de départ
                </label>
                <input
                  type="date"
                  className="form-input"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <button className="btn-primary" onClick={doSearch}>
                <Search size={18} /> RECHERCHER UN TRAJET
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK LINKS */}
      <div className="py-8 px-6 bg-white border-b border-greyLight">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-sm font-semibold text-greyMid uppercase tracking-wider mb-4 flex items-center gap-2">
            <Flame size={16} className="text-orange" /> Lignes populaires
          </div>
          <div className="flex gap-3 flex-wrap">
            {cities.length >= 2 ? (
              (() => {
                const pairs: [string, string][] = [];
                for (let i = 0; i < cities.length; i++) {
                  for (let j = i + 1; j < cities.length; j++) {
                    pairs.push([cities[i], cities[j]]);
                  }
                }
                return pairs.slice(0, 4).map(([dep, arr]) => (
                  <div
                    key={dep + arr}
                    className="flex items-center gap-2 px-4.5 py-2.5 bg-bg border-[1.5px] border-greyLight rounded-full text-sm text-greyDark cursor-pointer font-medium transition-all hover:border-green hover:text-green hover:bg-green-light"
                    onClick={() => quickSearch(dep, arr)}
                  >
                    🚌 {dep} → {arr}
                  </div>
                ));
              })()
            ) : (
              <span className="text-sm text-greyMid">Chargement...</span>
            )}
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="py-16 px-6 max-w-[1100px] mx-auto">
        <div className="text-center mb-10">
          <div className="text-2xl md:text-[26px] font-bold text-navy mb-2">
            Comment ça marche ?
          </div>
          <p className="text-base text-greyMid">
            Réserver votre bus n&apos;a jamais été aussi simple
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {[
            {
              icon: <Search size={32} className="text-green" />,
              num: 1,
              title: "Recherchez votre trajet",
              desc: "Choisissez votre ville de départ, votre destination et votre date. Comparez les horaires et prix de plusieurs agences en un clic.",
            },
            {
              icon: <CreditCard size={32} className="text-green" />,
              num: 2,
              title: "Réservez & Payez en ligne",
              desc: "Sélectionnez votre bus et payez en toute sécurité via Orange Money, MTN MoMo ou carte bancaire. En moins de 5 minutes.",
            },
            {
              icon: <MessageCircleMore size={32} className="text-green" />,
              num: 3,
              title: "Recevez votre billet sur WhatsApp",
              desc: "Votre billet électronique avec QR code est envoyé instantanément sur WhatsApp. Présentez-le à l'embarquement.",
            },
          ].map((s) => (
            <div key={s.num} className="card p-8 text-center">
              <div className="mb-4 flex justify-center">{s.icon}</div>
              <div className="w-12 h-12 bg-green rounded-full flex items-center justify-center text-white text-xl font-extrabold mx-auto mb-5">
                {s.num}
              </div>
              <div className="text-[17px] font-bold text-navy mb-2.5">
                {s.title}
              </div>
              <p className="text-sm text-greyMid leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PARTNERS */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-8">
            <div className="text-2xl md:text-[26px] font-bold text-navy mb-2">
              Nos agences partenaires
            </div>
            <p className="text-base text-greyMid">
              {agencies.length} agences vérifiées et de confiance
            </p>
          </div>
          <div className="flex gap-5 flex-wrap items-center justify-center">
            {agencies.length > 0 ? agencies.map((name) => (
              <div
                key={name}
                className="bg-bg border-[1.5px] border-greyLight rounded-sm2 px-6 py-4 text-sm font-bold text-navy flex items-center gap-2.5"
              >
                <Building2 size={16} className="text-green" />
                {name}
              </div>
            )) : (
              <span className="text-sm text-greyMid">Chargement...</span>
            )}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="bg-gradient-to-br from-navy to-[#1a2f55] py-16 px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-[900px] mx-auto text-center">
          {[
            [stats.travelers, "Voyageurs satisfaits"],
            ["98%", "Taux de satisfaction"],
            [stats.lines, "Lignes actives"],
            ["< 5 min", "Pour réserver"],
          ].map(([num, label]) => (
            <div key={label}>
              <div className="text-3xl md:text-[36px] font-extrabold text-green mb-1.5">
                {num}
              </div>
              <div className="text-sm text-white/70">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="bg-navy text-white/70 py-10 px-6 text-sm">
        <div className="max-w-[1100px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <span className="text-white text-xl font-bold block mb-3">
              e-<span className="text-green">travel</span>
            </span>
            <p>
              La première plateforme de réservation de bus interurbains au
              Cameroun.
            </p>
          </div>
          <div>
            <div className="text-white font-bold text-[15px] mb-4">
              Navigation
            </div>
            <ul className="flex flex-col gap-2.5">
              {["Accueil", "Nos agences", "Comment ça marche", "Devenir partenaire"].map(
                (l) => (
                  <li key={l}>
                    <a href="#" className="text-white/60 hover:text-green transition-colors">
                      {l}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
          <div>
            <div className="text-white font-bold text-[15px] mb-4">Support</div>
            <ul className="flex flex-col gap-2.5">
              {["FAQ", "CGU", "Contact", "WhatsApp Support"].map((l) => (
                <li key={l}>
                  <a href="#" className="text-white/60 hover:text-green transition-colors">
                    {l}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-5 text-center text-[13px] text-white/40 max-w-[1100px] mx-auto">
          © 2026 e-travel Cameroun. Tous droits réservés. | Paiements sécurisés
          Orange Money &amp; MTN MoMo | Billets envoyés via WhatsApp Business
        </div>
      </footer>
    </div>
  );
}