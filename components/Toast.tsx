"use client";

import { useApp } from "@/lib/AppContext";

const KIND_BG: Record<string, string> = {
  success: "bg-green",
  warn: "bg-orange",
  error: "bg-red",
  info: "bg-navy",
};

export default function Toast() {
  const { toast } = useApp();

  return (
    <div
      className={`fixed bottom-6 right-6 text-white px-5 py-3.5 rounded-sm2 shadow-cardLg text-sm font-medium items-center gap-2.5 z-[9999] transition-opacity ${
        KIND_BG[toast.kind]
      } ${toast.show ? "flex opacity-100" : "hidden opacity-0"}`}
    >
      {toast.msg}
    </div>
  );
}
