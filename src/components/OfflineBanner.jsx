import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";

function useOnlineStatus() {
  const [e, setE] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  useEffect(() => {
    const s = () => setE(true);
    const o = () => setE(false);
    window.addEventListener("online", s);
    window.addEventListener("offline", o);
    return () => {
      window.removeEventListener("online", s);
      window.removeEventListener("offline", o);
    };
  }, []);
  return e;
}

export const OfflineBanner = () => {
  if (useOnlineStatus()) {
    return null;
  }
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-amber-600 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-amber-900/20 animate-bounce">
      <WifiOff size={14} className="shrink-0" />
      <span>Offline Mode — Cached data and camera logging active.</span>
    </div>
  );
};
