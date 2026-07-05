"use client";

import { useEffect } from "react";

export default function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // silent fail if sw.js isn't generated (e.g. in dev mode)
      });
    }
  }, []);
  return null;
}
