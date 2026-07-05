# e-travel — Next.js + Tailwind + PWA

Application de réservation de bus interurbains au Cameroun, convertie depuis le
prototype HTML/CSS/JS original vers **Next.js 14 (App Router)**, **TypeScript**,
**Tailwind CSS**, avec les icônes **lucide-react** et un support **PWA**
(installable, avec service worker).

## 📁 Structure du projet

```
e-travel/
├── app/
│   ├── layout.tsx        # Layout racine + métadonnées PWA (manifest, icônes)
│   ├── page.tsx           # Point d'entrée : monte AppProvider et bascule entre les "pages"
│   └── globals.css        # Tailwind + classes utilitaires (btn-primary, form-input, card...)
├── components/
│   ├── Navbar.tsx
│   ├── HomePage.tsx        # Hero + recherche + lignes populaires + footer
│   ├── ResultsPage.tsx      # Liste des trajets + filtres
│   ├── DetailPage.tsx       # Détail trajet + avis + réservation
│   ├── PaymentPage.tsx      # Formulaire passager + moyen de paiement
│   ├── ConfirmPage.tsx      # Billet + QR code de confirmation
│   ├── AgencyDashboard.tsx  # Tableau de bord agence (KPIs, trajets du jour...)
│   ├── AgencyLogin.tsx
│   ├── AddTripModal.tsx
│   ├── LoginModal.tsx
│   ├── Toast.tsx
│   └── PwaRegister.tsx      # Enregistre le service worker côté client
├── lib/
│   ├── types.ts             # Types TypeScript (Trip, PageKey, PaymentMethod...)
│   ├── trips.ts              # Données des trajets (équivalent du tableau TRIPS du HTML)
│   └── AppContext.tsx        # State global React (page active, trajet courant, panier, toast...)
├── public/
│   ├── manifest.json          # Manifeste PWA
│   └── icons/icon-192.png, icon-512.png
├── next.config.js             # Configuration next-pwa (génère le service worker au build)
├── tailwind.config.ts         # Palette de couleurs reprenant les variables CSS d'origine
└── package.json
```

Le fonctionnement en "SPA" du fichier HTML original (une page unique avec des
sections `.page` affichées/masquées en JS) a été reproduit avec un **state React
global** (`AppContext`) : `page.tsx` bascule entre les composants `HomePage`,
`ResultsPage`, `DetailPage`, etc. selon l'état `page`, exactement comme la
fonction `showPage()` d'origine.

## 🚀 Installation et lancement

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en développement
npm run dev
# → http://localhost:3000

# 3. Build de production (génère aussi le service worker PWA)
npm run build
npm run start
```

> Le service worker PWA n'est généré et actif **qu'en production**
> (`npm run build && npm run start`). En mode `dev`, next-pwa le désactive
> volontairement pour éviter des soucis de cache pendant le développement.

## 📱 Rendre l'app installable (PWA)

Le nécessaire est déjà en place :
- `public/manifest.json` déclare le nom, les icônes, la couleur de thème et le
  mode `standalone`.
- `next-pwa` (configuré dans `next.config.js`) génère automatiquement
  `public/sw.js` (service worker) et le cache lors du `next build`.
- `components/PwaRegister.tsx` enregistre ce service worker côté client.
- `app/layout.tsx` référence le manifeste et les icônes Apple/Android.

Pour tester l'installation :
1. `npm run build && npm run start`
2. Ouvrir le site dans Chrome/Edge (desktop ou mobile) sur `http://localhost:3000`
3. Un bouton "Installer l'application" apparaît dans la barre d'adresse
   (ou "Ajouter à l'écran d'accueil" sur mobile)

⚠️ En production réelle (déploiement), la PWA nécessite **HTTPS** (sauf
`localhost`) pour être installable.

## 🎨 Icônes

Toutes les icônes utilisées dans l'interface proviennent de **lucide-react**
(déjà dans `package.json`). Les icônes PWA (`public/icons/icon-192.png` et
`icon-512.png`) sont des icônes de démarrage générées automatiquement — vous
pouvez les remplacer par votre propre logo (mêmes dimensions : 192×192 et
512×512 px, fond opaque recommandé pour le mode "maskable").

## 🧩 Notes de conversion

- Les couleurs et variables CSS de l'original (`--green`, `--navy`, `--orange`,
  etc.) sont reprises dans `tailwind.config.ts`.
- Toute la logique JS (recherche, changement de page, calcul des frais 5%,
  gestion de quantité de tickets, sélection du moyen de paiement, validation du
  formulaire de paiement, etc.) a été réécrite en React/TypeScript dans
  `AppContext.tsx` et les composants correspondants.
- Les émojis utilisés comme icônes dans le HTML d'origine (🚌 📍 💳 ✅...) sont
  conservés tels quels quand ils apportent une touche visuelle simple ; les
  icônes "fonctionnelles" (flèches, boutons, statuts) ont été remplacées par des
  icônes **lucide-react** cohérentes.
- Le tableau de bord agence, les modales (ajout de trajet, connexion), et le
  système de toast sont fonctionnels avec le même comportement que la version
  HTML (mais en state React au lieu de manipulation directe du DOM).

## 📦 Déploiement

Ce projet est prêt pour un déploiement sur Vercel, Netlify (via l'adaptateur
Next.js) ou tout hébergeur supportant Node.js :

```bash
npm run build
npm run start
```
