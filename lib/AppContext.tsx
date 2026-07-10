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
import { isFirebaseConfigured } from "./firebase/config";
import { fetchTrips, createBooking, fetchTripById, fetchAgencyByEmail } from "./firebase/firestore";
import { onAuthChange, signOut as fbSignOut } from "./firebase/auth";

interface AppContextValue {
  page: PageKey;
  goTo: (p: PageKey) => void;
  trips: Trip[];
  searchResults: Trip[];
  search: (depart: string, arrive: string) => void;
  searchLoading: boolean;
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
  agencyName: string;
  isPremium: boolean;
  refreshAgency: () => Promise<void>;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | null>(null);

let allTripsCache: Trip[] = [];
let firebaseLoaded = false;

const EMPTY_TRIP: Trip = {
  id: "",
  agency: "",
  code: "",
  color: "#1DB954",
  depH: "",
  arrH: "",
  dur: "",
  depart: "",
  arrive: "",
  depStop: "",
  arrStop: "",
  price: 0,
  seats: 0,
  total: 0,
  rating: 0,
  reviews: 0,
  status: "open",
  amenities: [],
};

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [page, setPage] = useState<PageKey>("home");
  const [searchResults, setSearchResults] = useState<Trip[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [currentTrip, setCurrentTrip] = useState<Trip>(EMPTY_TRIP);
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
  const [agencyName, setAgencyName] = useState("");
  const [isPremium, setIsPremium] = useState(false);
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
          allTripsCache = fbTrips;
          if (fbTrips.length > 0) {
            setCurrentTrip(fbTrips[0]);
          }
        })
        .catch(() => {});
    }

    const unsub = onAuthChange(async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        const email = fbUser.email || "";
        const agency = await fetchAgencyByEmail(email).catch(() => null);
        setIsAgency(!!agency);
        if (agency) {
          const a = agency as any;
          setAgencyName(a.name || "");
          setIsPremium(!!a.isPremium);
        } else {
          setAgencyName("");
          setIsPremium(false);
        }
      } else {
        setIsAgency(false);
        setAgencyName("");
        setIsPremium(false);
      }
    });

    return () => unsub();
  }, []);

  const PAGE_HASH: Record<PageKey, string> = {
    home: "#home",
    results: "#results",
    detail: "#detail",
    payment: "#payment",
    confirm: "#confirm",
    agency: "#agency",
    "agency-reservations": "#agency/reservations",
    "agency-qr": "#agency/qr",
    "agency-stats": "#agency/stats",
    "agency-profile": "#agency/profile",
    "agency-subscription": "#agency/subscription",
    "agency-login": "#agency-login",
    seed: "#seed",
  };

  const HASH_PAGE: Record<string, PageKey> = {};
  for (const [k, v] of Object.entries(PAGE_HASH)) {
    HASH_PAGE[v] = k as PageKey;
  }

  const goTo = useCallback((p: PageKey) => {
    setPage(p);
    if (typeof window !== "undefined") {
      const hash = PAGE_HASH[p];
      if (hash && window.location.hash !== hash) {
        window.history.pushState(null, "", hash);
      }
      window.scrollTo(0, 0);
    }
  }, []);

  // Listen for browser back/forward
  useEffect(() => {
    const onPop = () => {
      const hash = window.location.hash || "#home";
      const target = HASH_PAGE[hash] || "home";
      setPage(target);
    };
    window.addEventListener("popstate", onPop);
    // Sync initial hash
    const initialHash = window.location.hash || "#home";
    const initialPage = HASH_PAGE[initialHash] || "home";
    if (initialPage !== page) {
      setPage(initialPage);
    }
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const search = useCallback(async (depart: string, arrive: string) => {
    setSearchLoading(true);
    if (firebaseReady) {
      try {
        const fbResults = await fetchTrips({ depart, arrive });
        setSearchResults(fbResults);
        setPage("results");
        if (typeof window !== "undefined") window.scrollTo(0, 0);
        setSearchLoading(false);
        return;
      } catch (e) {
        console.error("Erreur recherche Firebase:", e);
      }
    }
    const filtered = allTripsCache.filter(
      (t) => t.depart === depart && t.arrive === arrive
    );
    setSearchResults(filtered);
    setPage("results");
    if (typeof window !== "undefined") window.scrollTo(0, 0);
    setSearchLoading(false);
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
      } catch (e) {
        console.error("Erreur chargement trajet Firebase:", e);
      }
    }
    const t = allTripsCache.find((tr) => tr.id === id);
    if (t) {
      setCurrentTrip(t);
      setQty(1);
      setPage("detail");
      if (typeof window !== "undefined") window.scrollTo(0, 0);
    }
  }, [firebaseReady]);

  const changeQty = useCallback(
    (delta: number) => {
      setQty((q) => Math.max(1, Math.min(q + delta, currentTrip.seats || 1)));
    },
    [currentTrip.seats]
  );

  const confirmBooking = useCallback(
    async (info: Omit<BookingInfo, "ref">) => {
      setPage("confirm");

      if (firebaseReady && currentTrip.id) {
        try {
          const result = await createBooking({
            tripId: currentTrip.id,
            agencyId: currentTrip.agencyId || "",
            prenom: info.prenom,
            nom: info.nom,
            phone: info.phone,
            qty,
            totalAmount: currentTrip.price * qty + Math.round(currentTrip.price * qty * 0.05),
            paymentMethod: selectedPayment,
          });
          if (result) {
            setBooking({ ...info, ref: result.ref });
          } else {
            const ref = "ET-" + Date.now().toString().slice(-8);
            setBooking({ ...info, ref });
          }
        } catch (e) {
          console.error("Firestore createBooking a échoué:", e);
          const ref = "ET-" + Date.now().toString().slice(-8);
          setBooking({ ...info, ref });
        }
      } else {
        const ref = "ET-" + Date.now().toString().slice(-8);
        setBooking({ ...info, ref });
      }
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

  const refreshAgency = useCallback(async () => {
    const email = user?.email;
    if (!email) return;
    const agency = await fetchAgencyByEmail(email).catch(() => null);
    if (agency) {
      const a = agency as any;
      setAgencyName(a.name || "");
      setIsPremium(!!a.isPremium);
    }
  }, [user]);

  const value = useMemo<AppContextValue>(
    () => ({
      page,
      goTo,
      trips: allTripsCache,
      searchResults,
      search,
      searchLoading,
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
      agencyName,
      isPremium,
      refreshAgency,
      logout,
    }),
    [
      page, goTo, searchResults, search, searchLoading, currentTrip, openTrip,
      qty, changeQty, selectedPayment, booking, confirmBooking,
      toast, showToast, addTripModalOpen, loginModalOpen,
      firebaseReady, user, isAgency, agencyName, isPremium, refreshAgency, logout,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}