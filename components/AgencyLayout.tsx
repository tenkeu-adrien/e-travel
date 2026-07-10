"use client";

import { useState } from "react";
import { Home, Bus, ClipboardList, Camera, BarChart3, User, CreditCard, LogOut, Menu, X } from "lucide-react";
import { useApp } from "@/lib/AppContext";

const AGENCY_PAGES = [
  { key: "agency", label: "Dashboard", icon: <Home size={16} /> },
  { key: "agency-reservations", label: "Réservations", icon: <ClipboardList size={16} /> },
  { key: "agency-qr", label: "Validation QR", icon: <Camera size={16} /> },
  { key: "agency-stats", label: "Statistiques", icon: <BarChart3 size={16} /> },
  { key: "agency-profile", label: "Profil Agence", icon: <User size={16} /> },
  { key: "agency-subscription", label: "Abonnement", icon: <CreditCard size={16} /> },
] as const;

export default function AgencyLayout({ children }: { children: React.ReactNode }) {
  const { goTo, page, logout, setAddTripModalOpen, agencyName, isPremium } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] min-h-[calc(100vh-4rem)]">
      <div className="hidden lg:block bg-navy py-6">
        <div className="px-5 pb-6 border-b border-white/10 mb-3">
          <div className="text-white text-base font-bold">{agencyName || "Mon Agence"}</div>
          <div className="text-white/50 text-xs mt-0.5">Tableau de bord agence</div>
          {isPremium && <div className="inline-block bg-green text-white text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5">PREMIUM ★</div>}
        </div>
        <ul>
          {AGENCY_PAGES.map((p) => (
            p.key === "agency" ? (
              <SidebarLink key={p.key} icon={p.icon} label={p.label} active={page === p.key} onClick={() => goTo(p.key as any)} />
            ) : null
          ))}
          <SidebarLink icon={<Bus size={16} />} label="Mes Trajets" onClick={() => setAddTripModalOpen(true)} />
          {AGENCY_PAGES.map((p) => (
            p.key !== "agency" ? (
              <SidebarLink key={p.key} icon={p.icon} label={p.label} active={page === p.key} onClick={() => goTo(p.key as any)} />
            ) : null
          ))}
          <li className="mt-6">
            <div className="flex items-center gap-3 px-5 py-3 text-red cursor-pointer text-sm font-medium" onClick={logout}>
              <LogOut size={16} /> Déconnexion
            </div>
          </li>
        </ul>
      </div>

      <div className="lg:hidden bg-navy px-5 py-3 flex items-center justify-between">
        <div>
          <div className="text-white text-sm font-bold">{agencyName || "Mon Agence"}</div>
          <div className="text-white/50 text-xs">Tableau de bord</div>
        </div>
        <button className="text-white p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[1500]">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-[240px] bg-navy py-6 shadow-xl">
            <ul>
              {AGENCY_PAGES.map((p) => (
                p.key === "agency" ? (
                  <SidebarLink key={p.key} icon={p.icon} label={p.label} active={page === p.key} onClick={() => { goTo(p.key as any); setMobileOpen(false); }} />
                ) : null
              ))}
              <SidebarLink icon={<Bus size={16} />} label="Mes Trajets" onClick={() => { setAddTripModalOpen(true); setMobileOpen(false); }} />
              {AGENCY_PAGES.map((p) => (
                p.key !== "agency" ? (
                  <SidebarLink key={p.key} icon={p.icon} label={p.label} active={page === p.key} onClick={() => { goTo(p.key as any); setMobileOpen(false); }} />
                ) : null
              ))}
              <li className="mt-6">
                <div className="flex items-center gap-3 px-5 py-3 text-red cursor-pointer text-sm font-medium" onClick={() => { logout(); setMobileOpen(false); }}>
                  <LogOut size={16} /> Déconnexion
                </div>
              </li>
            </ul>
          </div>
        </div>
      )}

      <div className="bg-bg p-5 md:p-7 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}

function SidebarLink({ icon, label, active, onClick }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }) {
  const activeClass = active ? "text-white border-green bg-green/10" : "text-white/60 border-transparent hover:text-white hover:bg-white/5";
  return (
    <li>
      <div className={`flex items-center gap-3 px-5 py-3 text-sm font-medium cursor-pointer transition-all border-l-[3px] ${activeClass}`} onClick={onClick}>
        {icon} {label}
      </div>
    </li>
  );
}
