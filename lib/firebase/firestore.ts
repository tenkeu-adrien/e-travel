import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
  QueryConstraint,
  serverTimestamp,
  DocumentData,
} from "firebase/firestore";
import { db } from "./config";
import { Trip } from "../types";

function toDate(ts: Timestamp | undefined): string {
  if (!ts) return new Date().toISOString();
  return ts.toDate().toISOString();
}

function mapTrip(id: string, data: DocumentData): Trip {
  return {
    id,
    agency: data.agency || "",
    agencyId: data.agencyId || "",
    code: data.code || "",
    color: data.color || "#1DB954",
    depH: data.depH || "",
    arrH: data.arrH || "",
    dur: data.dur || "",
    depart: data.depart || "",
    arrive: data.arrive || "",
    depStop: data.depStop || "",
    arrStop: data.arrStop || "",
    price: data.price || 0,
    seats: data.seats ?? data.total ?? 0,
    total: data.total ?? 0,
    rating: data.rating || 0,
    reviews: data.reviews ?? data.reviewsCount ?? 0,
    status: data.status || "open",
    amenities: data.amenities || [],
    date: data.date || "",
    createdAt: data.createdAt ? toDate(data.createdAt) : undefined,
  };
}

export const Collections = {
  trips: () => collection(db!, "trips"),
  bookings: () => collection(db!, "bookings"),
  agencies: () => collection(db!, "agencies"),
  travelers: () => collection(db!, "travelers"),
  reviews: () => collection(db!, "reviews"),
};

// ─── TRIPS ────────────────────────────────────────────────────────────────────

export async function fetchTrips(filters?: {
  depart?: string;
  arrive?: string;
  agencyId?: string;
}): Promise<Trip[]> {
  if (!db) return [];
  const constraints: QueryConstraint[] = [];
  if (filters?.depart) constraints.push(where("depart", "==", filters.depart));
  if (filters?.arrive) constraints.push(where("arrive", "==", filters.arrive));
  if (filters?.agencyId) constraints.push(where("agencyId", "==", filters.agencyId));
  constraints.push(orderBy("depH", "asc"));

  const q = query(Collections.trips(), ...constraints);
  const snap = await getDocs(q);
  return snap.docs.map((d) => mapTrip(d.id, d.data()));
}

export async function fetchTripById(id: string): Promise<Trip | null> {
  if (!db) return null;
  const snap = await getDoc(doc(Collections.trips(), id));
  if (!snap.exists()) return null;
  return mapTrip(snap.id, snap.data());
}

export async function createTrip(data: Record<string, any>) {
  if (!db) throw new Error("Firestore non disponible");
  const docRef = await addDoc(Collections.trips(), {
    ...data,
    reviews: 0,
    reviewsCount: 0,
    rating: 0,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateTrip(tripId: string, data: Record<string, any>) {
  if (!db) return;
  const ref = doc(Collections.trips(), tripId);
  await updateDoc(ref, data);
}

export async function deleteTrip(tripId: string) {
  if (!db) return;
  await deleteDoc(doc(Collections.trips(), tripId));
}

export async function updateTripSeats(tripId: string, newSeats: number) {
  if (!db) return;
  const ref = doc(Collections.trips(), tripId);
  await updateDoc(ref, { seats: newSeats });
}

// ─── BOOKINGS ─────────────────────────────────────────────────────────────────

export async function createBooking(data: {
  tripId: string;
  agencyId: string;
  prenom: string;
  nom: string;
  phone: string;
  email?: string;
  qty: number;
  totalAmount: number;
  paymentMethod: string;
}) {
  if (!db) throw new Error("Firestore non disponible");
  const ref = "ET-" + Date.now().toString().slice(-8);
  const docRef = await addDoc(Collections.bookings(), {
    ref,
    ...data,
    paymentStatus: "paid",
    status: "confirmed",
    createdAt: serverTimestamp(),
  });
  return { id: docRef.id, ref };
}

export async function fetchBookingsByAgency(agencyId: string) {
  if (!db) return [];
  const q = query(
    Collections.bookings(),
    where("agencyId", "==", agencyId),
    orderBy("createdAt", "desc"),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchBookingsByPhone(phone: string) {
  if (!db) return [];
  const q = query(
    Collections.bookings(),
    where("phone", "==", phone),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchBookingByRef(ref: string) {
  if (!db) return null;
  const q = query(Collections.bookings(), where("ref", "==", ref), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function updateBookingStatus(
  bookingId: string,
  status: "confirmed" | "cancelled" | "used"
) {
  if (!db) return;
  const ref = doc(Collections.bookings(), bookingId);
  await updateDoc(ref, { status });
}

// ─── AGENCIES ─────────────────────────────────────────────────────────────────

export async function fetchAgencies() {
  if (!db) return [];
  const snap = await getDocs(Collections.agencies());
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function fetchAgencyById(id: string) {
  if (!db) return null;
  const snap = await getDoc(doc(Collections.agencies(), id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() };
}

export async function fetchAgencyByEmail(email: string) {
  if (!db) return null;
  const q = query(Collections.agencies(), where("email", "==", email), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function createAgency(data: Record<string, any>) {
  if (!db) throw new Error("Firestore non disponible");
  const docRef = await addDoc(Collections.agencies(), {
    ...data,
    rating: 4.5,
    reviewsCount: 0,
    isPremium: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── TRAVELERS ────────────────────────────────────────────────────────────────

export async function createTraveler(data: {
  phone: string;
  nom: string;
  prenom: string;
  email?: string;
}) {
  if (!db) throw new Error("Firestore non disponible");
  const docRef = await addDoc(Collections.travelers(), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function fetchTravelerByPhone(phone: string) {
  if (!db) return null;
  const q = query(Collections.travelers(), where("phone", "==", phone), limit(1));
  const snap = await getDocs(q);
  if (snap.empty) return null;
  const d = snap.docs[0];
  return { id: d.id, ...d.data() };
}

export async function updateTraveler(id: string, data: Record<string, any>) {
  if (!db) return;
  await updateDoc(doc(Collections.travelers(), id), data);
}

// ─── REVIEWS ──────────────────────────────────────────────────────────────────

export interface ReviewData {
  id?: string;
  tripId?: string;
  userId?: string;
  userName: string;
  stars: number;
  text: string;
  date?: string;
  createdAt?: any;
}

export async function fetchReviewsByTripId(tripId: string): Promise<ReviewData[]> {
  if (!db) return [];
  const q = query(
    Collections.reviews(),
    where("tripId", "==", tripId),
    orderBy("createdAt", "desc"),
    limit(20)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => {
    const data = d.data();
    return {
      id: d.id,
      tripId: data.tripId,
      userId: data.userId || "",
      userName: data.userName || "",
      stars: data.stars || 5,
      text: data.text || "",
      date: data.createdAt
        ? data.createdAt.toDate().toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })
        : "Récent",
      createdAt: data.createdAt,
    };
  });
}

export async function createReview(data: {
  tripId: string;
  userId?: string;
  userName: string;
  stars: number;
  text: string;
}) {
  if (!db) throw new Error("Firestore non disponible");
  const docRef = await addDoc(Collections.reviews(), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}
