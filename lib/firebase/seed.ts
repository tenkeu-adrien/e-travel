import {
  collection,
  doc,
  setDoc,
  addDoc,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { db, auth } from "./config";
import { Collections } from "./firestore";

// ─── SEED DATA ────────────────────────────────────────────────────────────────

const AGENCIES = [
  {
    id: "general-express",
    name: "Général Express",
    code: "GE",
    color: "#1DB954",
    email: "generalexpress@etravel.cm",
    phone: "+237 699 000 001",
    rating: 4.2,
    reviewsCount: 128,
    isPremium: true,
  },
  {
    id: "buca-voyages",
    name: "Buca Voyages",
    code: "BV",
    color: "#FF6B35",
    email: "bucavoyages@etravel.cm",
    phone: "+237 699 000 002",
    rating: 4.8,
    reviewsCount: 204,
    isPremium: true,
  },
  {
    id: "vatican-express",
    name: "Vatican Express",
    code: "VE",
    color: "#6C63FF",
    email: "vaticanexpress@etravel.cm",
    phone: "+237 699 000 003",
    rating: 3.5,
    reviewsCount: 67,
    isPremium: false,
  },
  {
    id: "tonton-express",
    name: "Tonton Express",
    code: "TE",
    color: "#0A1628",
    email: "tontonexpress@etravel.cm",
    phone: "+237 699 000 004",
    rating: 4.5,
    reviewsCount: 156,
    isPremium: true,
  },
  {
    id: "cerise-express",
    name: "Cerise Express",
    code: "CE",
    color: "#E91E63",
    email: "cerisexpress@etravel.cm",
    phone: "+237 699 000 005",
    rating: 4.9,
    reviewsCount: 312,
    isPremium: true,
  },
];

const TRIPS_DATA = [
  {
    agencyId: "general-express",
    agency: "Général Express",
    code: "GE",
    color: "#1DB954",
    depH: "07:00",
    arrH: "10:30",
    dur: "3h30",
    depart: "Douala",
    arrive: "Yaoundé",
    depStop: "Gare Centrale",
    arrStop: "Gare Centrale",
    price: 5000,
    seats: 14,
    total: 32,
    rating: 4.2,
    reviews: 128,
    status: "open",
    amenities: ["❄️", "🧳"],
  },
  {
    agencyId: "buca-voyages",
    agency: "Buca Voyages",
    code: "BV",
    color: "#FF6B35",
    depH: "09:30",
    arrH: "13:00",
    dur: "3h30",
    depart: "Douala",
    arrive: "Yaoundé",
    depStop: "Gare de Yabassi",
    arrStop: "Mvog-Mbi",
    price: 4500,
    seats: 3,
    total: 32,
    rating: 4.8,
    reviews: 204,
    status: "urgent",
    amenities: ["❄️", "🧳", "🔌"],
  },
  {
    agencyId: "vatican-express",
    agency: "Vatican Express",
    code: "VE",
    color: "#6C63FF",
    depH: "11:00",
    arrH: "14:30",
    dur: "3h30",
    depart: "Douala",
    arrive: "Yaoundé",
    depStop: "Gare Centrale",
    arrStop: "Gare Centrale",
    price: 5000,
    seats: 0,
    total: 32,
    rating: 3.5,
    reviews: 67,
    status: "full",
    amenities: ["❄️"],
  },
  {
    agencyId: "tonton-express",
    agency: "Tonton Express",
    code: "TE",
    color: "#0A1628",
    depH: "13:00",
    arrH: "16:30",
    dur: "3h30",
    depart: "Douala",
    arrive: "Yaoundé",
    depStop: "Bonabéri",
    arrStop: "Gare Centrale",
    price: 4800,
    seats: 22,
    total: 32,
    rating: 4.5,
    reviews: 156,
    status: "open",
    amenities: ["❄️", "🧳"],
  },
  {
    agencyId: "cerise-express",
    agency: "Cerise Express",
    code: "CE",
    color: "#E91E63",
    depH: "15:00",
    arrH: "18:30",
    dur: "3h30",
    depart: "Douala",
    arrive: "Yaoundé",
    depStop: "Gare Centrale",
    arrStop: "Gare Centrale",
    price: 5500,
    seats: 18,
    total: 35,
    rating: 4.9,
    reviews: 312,
    status: "open",
    amenities: ["❄️", "🧳", "🔌", "🍽️"],
  },
  {
    agencyId: "general-express",
    agency: "Général Express",
    code: "GE",
    color: "#1DB954",
    depH: "17:30",
    arrH: "21:00",
    dur: "3h30",
    depart: "Douala",
    arrive: "Yaoundé",
    depStop: "Gare Centrale",
    arrStop: "Gare Centrale",
    price: 5000,
    seats: 9,
    total: 32,
    rating: 4.2,
    reviews: 128,
    status: "open",
    amenities: ["❄️", "🧳"],
  },
];

const REVIEWS_DATA = [
  {
    tripAgencyId: "general-express",
    userName: "Marie K.",
    stars: 5,
    text: "Chauffeur ponctuel, bus propre et climatisé. Je recommande vraiment !",
  },
  {
    tripAgencyId: "general-express",
    userName: "Paul N.",
    stars: 4,
    text: "Bon trajet dans l'ensemble. Petit retard au départ mais arrivée à l'heure.",
  },
  {
    tripAgencyId: "general-express",
    userName: "Carine M.",
    stars: 5,
    text: "Le billet WhatsApp est une super idée ! Tout depuis mon téléphone, aucune queue !",
  },
  {
    tripAgencyId: "buca-voyages",
    userName: "Jean P.",
    stars: 5,
    text: "Meilleure agence du Cameroun ! Toujours à l'heure et très professionnel.",
  },
  {
    tripAgencyId: "buca-voyages",
    userName: "Sarah D.",
    stars: 5,
    text: "Bus ultra moderne avec prises USB. Voyage très confortable.",
  },
  {
    tripAgencyId: "cerise-express",
    userName: "Alain T.",
    stars: 5,
    text: "Service exceptionnel ! Le personnel est très accueillant.",
  },
  {
    tripAgencyId: "cerise-express",
    userName: "Brigitte L.",
    stars: 4,
    text: "Très bonne expérience. Le seul bémol est le prix un peu élevé.",
  },
  {
    tripAgencyId: "tonton-express",
    userName: "David K.",
    stars: 4,
    text: "Bon rapport qualité-prix. Trajet confortable.",
  },
  {
    tripAgencyId: "vatican-express",
    userName: "Esther N.",
    stars: 3,
    text: "Correct mais peut mieux faire. Bus un peu vieux.",
  },
];

const TEST_ACCOUNTS = [
  {
    email: "generalexpress@etravel.cm",
    password: "password123",
    isAgency: true,
  },
  {
    email: "bucavoyages@etravel.cm",
    password: "password123",
    isAgency: true,
  },
  {
    email: "cerisexpress@etravel.cm",
    password: "password123",
    isAgency: true,
  },
  {
    email: "690000001@t.e-travel.cm",
    password: "traveler123",
    isAgency: false,
    traveler: { phone: "690000001", nom: "Kamga", prenom: "Antony" },
  },
  {
    email: "690000002@t.e-travel.cm",
    password: "traveler123",
    isAgency: false,
    traveler: { phone: "690000002", nom: "Nkeng", prenom: "Paul" },
  },
];

// ─── SEED FUNCTION ────────────────────────────────────────────────────────────

export async function seedFirebase() {
  if (!db) throw new Error("Firebase non configuré. Vérifie .env.local");

  console.log("🌱 Début du seed...");

  const batch = writeBatch(db);

  // 1. AGENCIES
  for (const a of AGENCIES) {
    const ref = doc(Collections.agencies(), a.id);
    batch.set(ref, {
      name: a.name,
      code: a.code,
      color: a.color,
      email: a.email,
      phone: a.phone,
      rating: a.rating,
      reviewsCount: a.reviewsCount,
      isPremium: a.isPremium,
      createdAt: serverTimestamp(),
    });
    console.log(`  ✅ Agence: ${a.name}`);
  }

  // 2. TRIPS (on génère des IDs pour pouvoir lier les reviews)
  const tripIds: Record<string, string[]> = {};
  for (const t of TRIPS_DATA) {
    const ref = doc(collection(db, "trips"));
    batch.set(ref, {
      ...t,
      createdAt: serverTimestamp(),
    });
    const key = t.agencyId;
    if (!tripIds[key]) tripIds[key] = [];
    tripIds[key].push(ref.id);
    console.log(`  ✅ Trajet: ${t.agency} ${t.depart}→${t.arrive} ${t.depH}`);
  }

  // 3. REVIEWS (liées aux trajets de chaque agence)
  for (const r of REVIEWS_DATA) {
    const agencyTripIds = tripIds[r.tripAgencyId] || [];
    if (agencyTripIds.length > 0) {
      const ref = doc(collection(db, "reviews"));
      batch.set(ref, {
        tripId: agencyTripIds[0],
        userName: r.userName,
        stars: r.stars,
        text: r.text,
        createdAt: serverTimestamp(),
      });
    }
  }

  // 4. CITIES
  const CITIES_DATA = ["Douala", "Yaoundé", "Bafoussam", "Kribi", "Bamenda", "Garoua", "Maroua", "Ngaoundéré", "Bertoua", "Ebolowa"];
  for (const name of CITIES_DATA) {
    const ref = doc(Collections.cities(), name.toLowerCase());
    batch.set(ref, { name });
  }
  console.log("  ✅ Villes ajoutées");

  // 5. APP SETTINGS
  const appSettingsRef = doc(Collections.appSettings(), "supportPhone");
  batch.set(appSettingsRef, { value: "+237 699 000 000" });

  await batch.commit();
  console.log("  ✅ Reviews + Cities + Settings ajoutées");

  // 6. COMPTES UTILISATEURS (Firebase Auth)
  let authOk = 0;
  let authErrors = 0;
  for (const acc of TEST_ACCOUNTS) {
    try {
      if (auth) {
        await createUserWithEmailAndPassword(auth, acc.email, acc.password);
        console.log(`  ✅ Compte créé: ${acc.email}`);
        authOk++;
      }
    } catch (err: any) {
      if (err.code === "auth/email-already-in-use") {
        console.log(`  ⏭️  Compte déjà existant: ${acc.email}`);
        authOk++;
      } else if (err.code === "auth/configuration-not-found") {
        console.log(`  ❌ ${acc.email}: Authentication Email/Mot de passe NON activée dans la console Firebase.`);
        authErrors++;
      } else {
        console.log(`  ❌ Erreur ${acc.email}: ${err.code}`);
        authErrors++;
      }
    }
  }

  // Création des voyageurs dans Firestore
  for (const acc of TEST_ACCOUNTS) {
    if (!acc.isAgency && acc.traveler && db) {
      try {
        const ref = doc(collection(db, "travelers"));
        await setDoc(ref, {
          phone: acc.traveler.phone,
          nom: acc.traveler.nom,
          prenom: acc.traveler.prenom,
          email: acc.email,
          createdAt: serverTimestamp(),
        });
        console.log(`  ✅ Voyageur Firestore: ${acc.traveler.prenom} ${acc.traveler.nom}`);
      } catch (e) {
        console.log(`  ⚠️ Erreur création voyageur ${acc.email}:`, e);
      }
    }
  }

  console.log("🌱 Seed terminé avec succès !");
  console.log("");
  console.log("📋 Données créées :");
  console.log(`   ${AGENCIES.length} agences`);
  console.log(`   ${TRIPS_DATA.length} trajets`);
  console.log(`   ${REVIEWS_DATA.length} avis`);
  console.log(`   ${CITIES_DATA.length} villes`);
  console.log(`   ${authOk}/${TEST_ACCOUNTS.length} comptes Auth créés/existants`);
  if (authErrors > 0) console.log(`   ⚠️ ${authErrors} erreur(s) Auth (vérifie la console Firebase > Authentication > Sign-in method > activer Email/Mot de passe)`);
  console.log("");
  console.log("🔑 Comptes de test :");
  console.log("   🏢 Agences :");
  console.log("      generalexpress@etravel.cm / password123 (Général Express)");
  console.log("      bucavoyages@etravel.cm / password123 (Buca Voyages)");
  console.log("      cerisexpress@etravel.cm / password123 (Cerise Express)");
  console.log("   👤 Voyageurs :");
  console.log("      690000001 / traveler123 → Antony Kamga");
  console.log("      690000002 / traveler123 → Paul Nkeng");
}
