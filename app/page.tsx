"use client";

import { AppProvider, useApp } from "@/lib/AppContext";
import Navbar from "@/components/Navbar";
import HomePage from "@/components/HomePage";
import ResultsPage from "@/components/ResultsPage";
import DetailPage from "@/components/DetailPage";
import PaymentPage from "@/components/PaymentPage";
import ConfirmPage from "@/components/ConfirmPage";
import AgencyDashboard from "@/components/AgencyDashboard";
import AgencyLogin from "@/components/AgencyLogin";
import AgencyLayout from "@/components/AgencyLayout";
import AgencyReservations from "@/components/AgencyReservations";
import AgencyQrValidation from "@/components/AgencyQrValidation";
import AgencyStats from "@/components/AgencyStats";
import AgencyProfile from "@/components/AgencyProfile";
import AgencySubscription from "@/components/AgencySubscription";
import AddTripModal from "@/components/AddTripModal";
import LoginModal from "@/components/LoginModal";
import SeedPage from "@/components/SeedPage";
import Toast from "@/components/Toast";
import PwaRegister from "@/components/PwaRegister";

function Shell() {
  const { page } = useApp();

  const isAgencyPage = page.startsWith("agency") && page !== "agency-login";

  return (
    <>
      <PwaRegister />
      <Navbar />
      {page === "home" && <HomePage />}
      {page === "results" && <ResultsPage />}
      {page === "detail" && <DetailPage />}
      {page === "payment" && <PaymentPage />}
      {page === "confirm" && <ConfirmPage />}
      {page === "agency-login" && <AgencyLogin />}
      {page === "seed" && <SeedPage />}
      {isAgencyPage && (
        <AgencyLayout>
          {page === "agency" && <AgencyDashboard />}
          {page === "agency-reservations" && <AgencyReservations />}
          {page === "agency-qr" && <AgencyQrValidation />}
          {page === "agency-stats" && <AgencyStats />}
          {page === "agency-profile" && <AgencyProfile />}
          {page === "agency-subscription" && <AgencySubscription />}
        </AgencyLayout>
      )}
      <AddTripModal />
      <LoginModal />
      <Toast />
    </>
  );
}

export default function Page() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
