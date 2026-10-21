import { useEffect, useState } from "react";
import { CircleCheck, Download, Share2, Smartphone, SquarePlus, X } from "lucide-react";

function useInstallPrompt() {
  const [e, setE] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  useEffect(() => {
    const f =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true ||
      document.referrer.includes("android-app://");
    setIsInstalled(f);
    const m = window.navigator.userAgent.toLowerCase();
    const x = /iphone|ipad|ipod/.test(m);
    setIsIOS(x);
    const b = (g) => {
      g.preventDefault();
      setE(g);
    };
    const y = () => {
      setIsInstalled(true);
      setE(null);
    };
    window.addEventListener("beforeinstallprompt", b);
    window.addEventListener("appinstalled", y);
    return () => {
      window.removeEventListener("beforeinstallprompt", b);
      window.removeEventListener("appinstalled", y);
    };
  }, []);
  return {
    isInstallable: !!e,
    isInstalled,
    isIOS,
    install: async () => {
      if (!e) {
        return false;
      }
      await e.prompt();
      const { outcome } = await e.userChoice;
      if (outcome === "accepted") {
        return (setIsInstalled(true), setE(null), true);
      }
      return false;
    },
  };
}

export const InstallAppButton = ({ className = "", variant = "header" }) => {
  const { isInstallable, isInstalled, isIOS, install } = useInstallPrompt();
  const [u, setU] = useState(false);
  const [m, setM] = useState(false);
  if (isInstalled) {
    if (variant === "modal") {
      return (
        <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
          <CircleCheck size={16} className="text-emerald-600 shrink-0" />
          <span>EasyLogAuto is running as an installed app.</span>
        </div>
      );
    }
    return null;
  }
  return (
    <>
      {isInstallable ? (
        <button
          onClick={install}
          className={
            variant === "header"
              ? `flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm shadow-indigo-200 transition ${className}`
              : `w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-sm shadow-indigo-200 transition flex items-center justify-center gap-2 text-sm ${className}`
          }
          title="Install EasyLogAuto as an App"
        >
          <Download size={15} />
          <span>Install App</span>
        </button>
      ) : isIOS ? (
        <button
          onClick={() => setU(true)}
          className={
            variant === "header"
              ? `flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition ${className}`
              : `w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm ${className}`
          }
          title="Install on iPhone / iPad"
        >
          <Smartphone size={15} />
          <span>Install on Phone</span>
        </button>
      ) : (
        variant === "modal" && (
          <button
            onClick={() => setM(true)}
            className={`w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-semibold rounded-xl transition flex items-center justify-center gap-2 text-sm ${className}`}
          >
            <Smartphone size={15} />
            <span>Install on Device</span>
          </button>
        )
      )}
      {u && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <Smartphone size={20} />
                <h3>Install on iPhone / iPad</h3>
              </div>
              <button
                onClick={() => setU(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                  <Share2 size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">1. Tap Share</p>
                  <p className="text-xs text-gray-500">
                    Tap the Share icon in the Safari bottom bar.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                  <SquarePlus size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">2. Add to Home Screen</p>
                  <p className="text-xs text-gray-500">
                    Scroll down the menu and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setU(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      {m && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                <Smartphone size={20} />
                <h3>Install on Android / Chrome</h3>
              </div>
              <button
                onClick={() => setM(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                  <Download size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">1. Browser Menu</p>
                  <p className="text-xs text-gray-500">
                    Tap the three vertical dots (⋮) in Chrome's top right corner.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg shrink-0 mt-0.5">
                  <SquarePlus size={18} />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">2. Install App</p>
                  <p className="text-xs text-gray-500">
                    Select <strong>Install app</strong> or <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setM(false)}
              className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
