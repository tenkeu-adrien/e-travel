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
import AddTripModal from "@/components/AddTripModal";
import LoginModal from "@/components/LoginModal";
import SeedPage from "@/components/SeedPage";
import Toast from "@/components/Toast";
import PwaRegister from "@/components/PwaRegister";

function Shell() {
  const { page } = useApp();

  return (
    <>
      <PwaRegister />
      <Navbar />
      {page === "home" && <HomePage />}
      {page === "results" && <ResultsPage />}
      {page === "detail" && <DetailPage />}
      {page === "payment" && <PaymentPage />}
      {page === "confirm" && <ConfirmPage />}
      {page === "agency" && <AgencyDashboard />}
      {page === "agency-login" && <AgencyLogin />}
      {page === "seed" && <SeedPage />}
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
