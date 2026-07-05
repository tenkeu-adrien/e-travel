"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { User } from "firebase/auth";
import { PageKey, PaymentMethod, Trip, BookingInfo } from "./types";
import { TRIPS } from "./trips";
import { isFirebaseConfigured } from "./firebase/config";
import { fetchTrips, createBooking, fetchTripById } from "./firebase/firestore";
import { onAuthChange, signOut as fbSignOut } from "./firebase/auth";

interface AppContextValue {
  page: PageKey;
  goTo: (p: PageKey) => void;
  trips: Trip[];
  searchResults: Trip[];
  search: (depart: string, arrive: string) => void;
  currentTrip: Trip;
  openTrip: (id: string) => void;
  qty: number;
  changeQty: (delta: number) => void;
  selectedPayment: PaymentMethod;
  setSelectedPayment: (p: PaymentMethod) => void;
  booking: BookingInfo;
  confirmBooking: (info: Omit<BookingInfo, "ref">) => void;
  toast: { msg: string; show: boolean; kind: "success" | "warn" | "error" | "info" };
  showToast: (msg: string) => void;
  addTripModalOpen: boolean;
  setAddTripModalOpen: (b: boolean) => void;
  loginModalOpen: boolean;
  setLoginModalOpen: (b: boolean) => void;
  firebaseReady: boolean;
  user: User | null;
  isAgency: boolean;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

let allTripsCache: Trip[] = TRIPS;
let firebaseLoaded = false;

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<PageKey>("home");
  const [searchResults, setSearchResults] = useState<Trip[]>(
    TRIPS.filter((t) => t.depart === "Douala" && t.arrive === "Yaoundé")
  );
  const [currentTrip, setCurrentTrip] = useState<Trip>(TRIPS[0]);
  const [qty, setQty] = useState(1);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>("orange");
  const [booking, setBooking] = useState<BookingInfo>({
    prenom: "",
    nom: "",
    phone: "",
    ref: "",
  });
  const [addTripModalOpen, setAddTripModalOpen] = useState(false);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAgency, setIsAgency] = useState(false);
  const [firebaseReady, setFirebaseReady] = useState(false);
  const [toast, setToast] = useState<{
    msg: string;
    show: boolean;
    kind: "success" | "warn" | "error" | "info";
  }>({ msg: "", show: false, kind: "info" });
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const configured = isFirebaseConfigured();
    setFirebaseReady(configured);

    if (configured && !firebaseLoaded) {
      firebaseLoaded = true;
      fetchTrips()
        .then((fbTrips) => {
          if (fbTrips.length > 0) {
            allTripsCache = fbTrips;
            setSearchResults(
              fbTrips.filter((t) => t.depart === "Douala" && t.arrive === "Yaoundé")
            );
            setCurrentTrip(fbTrips[0]);
          }
        })
        .catch(() => {});
    }

    const unsub = onAuthChange((fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        const email = fbUser.email || "";
        setIsAgency(!email.endsWith("@t.e-travel.cm"));
      } else {
        setIsAgency(false);
      }
    });

    return () => unsub();
  }, []);

  const goTo = useCallback((p: PageKey) => {
    setPage(p);
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, []);

  const search = useCallback(async (depart: string, arrive: string) => {
    if (firebaseReady) {
      try {
        const fbResults = await fetchTrips({ depart, arrive });
        if (fbResults.length > 0) {
          setSearchResults(fbResults);
          setPage("results");
          if (typeof window !== "undefined") window.scrollTo(0, 0);
          return;
        }
      } catch {}
    }
    const filtered = allTripsCache.filter(
      (t) => t.depart === depart && t.arrive === arrive
    );
    setSearchResults(filtered.length > 0 ? filtered : allTripsCache);
    setPage("results");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [firebaseReady]);

  const openTrip = useCallback(async (id: string) => {
    if (firebaseReady) {
      try {
        const fbTrip = await fetchTripById(id);
        if (fbTrip) {
          setCurrentTrip(fbTrip);
          setQty(1);
          setPage("detail");
          if (typeof window !== "undefined") window.scrollTo(0, 0);
          return;
        }
      } catch {}
    }
    const t = allTripsCache.find((tr) => tr.id === id) || allTripsCache[0];
    setCurrentTrip(t);
    setQty(1);
    setPage("detail");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
  }, [firebaseReady]);

  const changeQty = useCallback(
    (delta: number) => {
      setQty((q) => Math.max(1, Math.min(q + delta, currentTrip.seats || 1)));
    },
    [currentTrip.seats]
  );

  const confirmBooking = useCallback(
    async (info: Omit<BookingInfo, "ref">) => {
      const ref = "ET-" + Date.now().toString().slice(-8);
      setBooking({ ...info, ref });

      if (firebaseReady && currentTrip.id) {
        try {
          await createBooking({
            tripId: currentTrip.id,
            agencyId: currentTrip.agencyId || "",
            prenom: info.prenom,
            nom: info.nom,
            phone: info.phone,
            qty,
            totalAmount: currentTrip.price * qty + Math.round(currentTrip.price * qty * 0.05),
            paymentMethod: selectedPayment,
          });
        } catch {}
      }

      setPage("confirm");
      if (typeof window !== "undefined") window.scrollTo(0, 0);
    },
    [firebaseReady, currentTrip, qty, selectedPayment]
  );

  const showToast = useCallback((msg: string) => {
    let kind: "success" | "warn" | "error" | "info" = "info";
    if (msg.includes("✅") || msg.includes("📲")) kind = "success";
    else if (msg.includes("⚠️")) kind = "warn";
    else if (msg.includes("🔴")) kind = "error";
    setToast({ msg, show: true, kind });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((t) => ({ ...t, show: false }));
    }, 3500);
  }, []);

  const logout = useCallback(async () => {
    await fbSignOut();
    goTo("home");
    showToast("✅ Déconnexion réussie");
  }, [goTo, showToast]);

  const value = useMemo<AppContextValue>(
    () => ({
      page,
      goTo,
      trips: allTripsCache,
      searchResults,
      search,
      currentTrip,
      openTrip,
      qty,
      changeQty,
      selectedPayment,
      setSelectedPayment,
      booking,
      confirmBooking,
      toast,
      showToast,
      addTripModalOpen,
      setAddTripModalOpen,
      loginModalOpen,
      setLoginModalOpen,
      firebaseReady,
      user,
      isAgency,
      logout,
    }),
    [
      page, goTo, searchResults, search, currentTrip, openTrip,
      qty, changeQty, selectedPayment, booking, confirmBooking,
      toast, showToast, addTripModalOpen, loginModalOpen,
      firebaseReady, user, isAgency, logout,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
