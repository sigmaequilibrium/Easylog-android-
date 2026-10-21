import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Camera,
  Car,
  Check,
  CircleAlert,
  CircleCheck,
  CircleQuestionMark,
  Image as Image_1,
  Keyboard,
  LoaderCircle,
  RefreshCcw,
  RotateCw,
  ShieldAlert,
  User,
  WifiOff,
  X,
  Zap,
  ZapOff,
} from "lucide-react";
import { analyzeOdometerImage } from "../services/odometerAi";
import { getPermissionHelp, requestCameraPermission } from "../services/permissions";
import { isStandaloneApp } from "../services/platform";
import { compressOdometerPhoto } from "../utils/image";

export const OdometerScanner = ({
  onScanComplete,
  onCancel,
  mode,
  title,
  initialData,
  vehicles = [],
  onAddVehicle,
  distanceUnit = "km",
  prefilledValue,
  autoStartCamera = true,
}) => {
  const [b, setB] = useState(false);
  const [g, setG] = useState(null);
  const [z, setZ] = useState(false);
  const [G, setG_1] = useState(false);
  const [_, set_] = useState(false);
  const [T, setT] = useState(null);
  const [R, setR] = useState(false);
  const [Z, setZ_1] = useState("environment");
  const [U, setU] = useState(false);
  const [S, setS] = useState(false);
  const ueRef = useRef(null);
  const LeRef = useRef(null);
  const [me, setMe] = useState(prefilledValue || null);
  const [O, setO] = useState(prefilledValue ? prefilledValue.toString() : "");
  const [C, setC] = useState(initialData?.notes || "");
  const [te, setTe] = useState(initialData?.clientName || "");
  const [se, setSe] = useState(initialData?.tripType || "work");
  const [ae, setAe] = useState("");
  const [_e, set_e] = useState(null);
  const [Ze, setZe] = useState(false);
  const [ze, setZe_1] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [dt, setDt] = useState(false);
  const [Je, setJe] = useState("");
  const mt = typeof navigator !== "undefined" ? navigator.language : undefined;
  const Me = isStandaloneApp();
  const Ge = () => {
    if (LeRef.current) {
      LeRef.current.getTracks().forEach((we) => we.stop());
      LeRef.current = null;
    }
    if (ueRef.current) {
      ueRef.current.srcObject = null;
    }
    setZ(false);
    setS(false);
  };
  const Te = async (ideal = Z) => {
    var Ie;
    set_e(null);
    setT(null);
    set_(false);
    setG_1(true);
    Ge();
    if (!((Ie = navigator.mediaDevices) != null && Ie.getUserMedia)) {
      setG_1(false);
      set_(true);
      setT(
        "Live camera is not supported in this browser environment. Use the system camera button below.",
      );
      return;
    }
    try {
      const pt = {
        video: {
          facingMode: {
            ideal,
          },
          width: {
            ideal: 1920,
          },
          height: {
            ideal: 1080,
          },
        },
        audio: false,
      };
      const xt = await navigator.mediaDevices.getUserMedia(pt);
      LeRef.current = xt;
      if (ueRef.current) {
        ueRef.current.srcObject = xt;
        ueRef.current.play().catch((un) => console.warn("Video play interrupted:", un));
      }
      setZ(true);
      setG_1(false);
      const Bt = xt.getVideoTracks()[0];
      const Hn = Bt.getCapabilities?.() || {};
      setU(!!Hn.torch);
    } catch (error) {
      setG_1(false);
      setZ(false);
      const xt = error?.name || "";
      console.warn("Camera getUserMedia error:", xt, error);
      if (xt === "NotAllowedError" || xt === "PermissionDeniedError") {
        set_(true);
        setT(
          Me
            ? 'Camera permission was not granted in this installed app. Tap "Grant Camera Permission" or use the direct camera button below.'
            : "Camera permission denied. Allow camera access to scan your dashboard odometer.",
        );
      } else {
        setT(
          xt === "NotFoundError" || xt === "DevicesNotFoundError"
            ? "No camera device found on this system."
            : error?.message ||
                "Unable to open camera stream. Try using the system camera button below.",
        );
      }
    }
  };
  const le = async () => {
    if (!LeRef.current || !U) {
      return;
    }
    const we = LeRef.current.getVideoTracks()[0];
    try {
      const torch = !S;
      await we.applyConstraints({
        advanced: [
          {
            torch,
          },
        ],
      });
      setS(torch);
    } catch (error) {
      console.warn("Torch toggle failed:", error);
    }
  };
  const Be = () => {
    const we = Z === "environment" ? "user" : "environment";
    setZ_1(we);
    Te(we);
  };
  const P = () => {
    if (!ueRef.current || !LeRef.current) {
      return;
    }
    const ueRef_current = ueRef.current;
    const Ie = ueRef_current.videoWidth || 1280;
    const De = ueRef_current.videoHeight || 720;
    const pt = document.createElement("canvas");
    pt.width = Ie;
    pt.height = De;
    const xt = pt.getContext("2d");
    if (!xt) {
      return;
    }
    xt.drawImage(ueRef_current, 0, 0, Ie, De);
    const Bt = pt.toDataURL("image/jpeg", 0.85);
    Ge();
    setG(Bt);
    setZe(false);
    de(Bt);
  };
  useEffect(() => {
    if (autoStartCamera && !g && !Ze) {
      Te("environment");
    }
    return () => {
      Ge();
    };
  }, [autoStartCamera]);
  useEffect(() => {
    const we = () => {
      setZe_1(true);
      if (g && !me && _e != null && _e.includes("Offline")) {
        set_e(null);
        setTimeout(() => de(g), 500);
      }
    };
    const Ie = () => {
      setZe_1(false);
      if (b) {
        setB(false);
        set_e("Connection lost. Analysis paused.");
      }
    };
    window.addEventListener("online", we);
    window.addEventListener("offline", Ie);
    return () => {
      window.removeEventListener("online", we);
      window.removeEventListener("offline", Ie);
    };
  }, [g, me, _e, b]);
  useEffect(() => {
    if (mode === "end" && initialData) {
      setTe(initialData.clientName || "");
      setC(initialData.notes || "");
      setSe(initialData.tripType || "work");
      setAe(initialData.registrationNumber || "");
    } else if ((mode === "start" && vehicles.length === 1) || (vehicles.length > 0 && !ae)) {
      setAe(vehicles[0]);
    }
  }, [mode, initialData, vehicles]);
  const de = async (we) => {
    if (!navigator.onLine) {
      setB(false);
      set_e("Offline. Photo saved. Will retry automatically when online.");
      return;
    }
    setB(true);
    set_e(null);
    analyzeOdometerImage(we)
      .then((Ie) => {
        setB(false);
        if (Ie !== null && Ie > 0) {
          setMe(Ie);
          setO(Ie.toString());
          set_e(null);
        } else if (!O) {
          set_e(
            "Could not detect an odometer reading. Please ensure the numbers are clear and well-lit, or enter manually below.",
          );
        }
      })
      .catch((Ie) => {
        setB(false);
        if (navigator.onLine) {
          set_e(Ie?.message || "Analysis failed. Retry or enter manually.");
        } else {
          set_e("Connection lost. Analysis paused.");
        }
      });
  };
  const ye = async (we) => {
    const Ie = we.target.files?.[0];
    if (Ie) {
      Ge();
      set_e(null);
      setB(true);
      setMe(null);
      if (!prefilledValue) {
        setO("");
      }
      setZe(false);
      try {
        const pt = await compressOdometerPhoto(Ie);
        setG(pt);
        de(pt);
      } catch {
        setB(false);
        set_e("Failed to process image file.");
      }
    }
  };
  const ke = () => {
    if (g) {
      de(g);
    }
  };
  const ce = () => {
    Ge();
    setZe(true);
    setG(null);
    setMe(null);
    if (!prefilledValue) {
      setO("");
    }
    set_e(null);
  };
  const $e = (we) => {
    const value = we.target.value;
    if (value === "__NEW__") {
      setDt(true);
      setAe("");
    } else {
      setAe(value);
    }
  };
  const Xe = () => {
    if (Je.trim()) {
      const we = Je.trim().toUpperCase();
      setAe(we);
      if (onAddVehicle) {
        onAddVehicle(we);
      }
      setDt(false);
      setJe("");
    } else {
      setDt(false);
    }
  };
  const Ye = () => {
    const we = parseInt(O.replace(/[^0-9]/g, ""), 10);
    if (isNaN(we) || we < 0) {
      set_e("Please enter a valid reading.");
      return;
    }
    if (mode === "end" && initialData && we < initialData.start.value) {
      set_e(
        `Value cannot be less than start (${initialData.start.value.toLocaleString()} ${distanceUnit})`,
      );
      return;
    }
    const Ie = dt ? Je.trim().toUpperCase() : ae;
    if (dt && Ie && onAddVehicle) {
      onAddVehicle(Ie);
    }
    if (g || Ze || rt) {
      Ge();
      onScanComplete(we, g || "", C, te, se, Ie);
    }
  };
  const rt = !isNaN(parseInt(O, 10)) && parseInt(O, 10) > 0;
  const en = getPermissionHelp("camera");
  const zt =
    title || (mode === "start" ? "Start Trip — Scan Odometer" : "End Trip — Scan Odometer");
  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-3 sm:p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl flex flex-col max-h-[95vh] overflow-hidden">
        <div className="bg-gray-50 px-5 py-3.5 border-b border-gray-100 flex justify-between items-center shrink-0">
          <div className="flex flex-col">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Camera size={18} className="text-indigo-600" />
              <span>{zt}</span>
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              {!ze && (
                <div className="flex items-center text-[11px] text-orange-600 font-semibold animate-pulse">
                  <WifiOff size={11} className="mr-1" />
                  Offline Mode
                </div>
              )}
              {Me && (
                <span className="text-[10px] text-indigo-700 bg-indigo-50 font-semibold px-2 py-0.2 rounded-full border border-indigo-200/60">
                  Installed App
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => {
              Ge();
              onCancel();
            }}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-full hover:bg-gray-200 transition"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5 space-y-5 overflow-y-auto">
          {!Ze && (
            <div className="relative aspect-4/3 sm:aspect-16/10 bg-slate-950 rounded-2xl overflow-hidden border border-gray-800 flex items-center justify-center shadow-inner shrink-0">
              {g && (
                <div className="relative w-full h-full">
                  <img
                    src={g}
                    alt="Odometer Preview"
                    className={`w-full h-full object-contain bg-black ${b ? "opacity-40 blur-xs" : ""}`}
                  />
                  {!b && (
                    <button
                      type="button"
                      onClick={() => {
                        setG(null);
                        Te();
                      }}
                      className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/75 hover:bg-black/90 text-white text-xs font-semibold px-3.5 py-1.5 rounded-full backdrop-blur-md flex items-center gap-1.5 border border-white/20 transition"
                    >
                      <RotateCw size={13} />
                      <span>Retake Photo</span>
                    </button>
                  )}
                </div>
              )}
              {!g && z && (
                <div className="relative w-full h-full flex items-center justify-center bg-black overflow-hidden">
                  <video
                    ref={ueRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                    <div className="w-[85%] max-w-xs h-28 border-2 border-dashed border-white/80 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.35)]">
                      <div className="absolute -top-1 -left-1 w-4 h-4 border-t-4 border-l-4 border-indigo-400 rounded-tl-sm" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 border-t-4 border-r-4 border-indigo-400 rounded-tr-sm" />
                      <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-4 border-l-4 border-indigo-400 rounded-bl-sm" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-4 border-r-4 border-indigo-400 rounded-br-sm" />
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-black/70 px-2 py-0.5 rounded text-[10px] font-bold text-white tracking-wide uppercase whitespace-nowrap">
                        Align Odometer Numbers
                      </div>
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-2 z-20">
                    {U && (
                      <button
                        type="button"
                        onClick={le}
                        className={`p-2 rounded-full backdrop-blur-md border transition ${S ? "bg-amber-400 text-black border-amber-300" : "bg-black/60 text-white border-white/20 hover:bg-black/80"}`}
                        title={S ? "Turn Flashlight Off" : "Turn Flashlight On"}
                      >
                        {S ? <Zap size={15} /> : <ZapOff size={15} />}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={Be}
                      className="p-2 rounded-full bg-black/60 text-white border border-white/20 hover:bg-black/80 backdrop-blur-md transition"
                      title="Switch Camera (Front/Back)"
                    >
                      <RotateCw size={15} />
                    </button>
                  </div>
                  <div className="absolute bottom-3 inset-x-0 flex items-center justify-center px-4 z-20">
                    <button
                      type="button"
                      onClick={P}
                      className="w-16 h-16 rounded-full bg-white p-1 shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition"
                      title="Capture Photo"
                    >
                      <div className="w-13 h-13 rounded-full border-2 border-slate-900 bg-indigo-600 flex items-center justify-center text-white">
                        <Camera size={24} />
                      </div>
                    </button>
                  </div>
                </div>
              )}
              {!g && !z && G && (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3">
                  <LoaderCircle className="animate-spin text-indigo-400" size={36} />
                  <p className="text-xs text-gray-200 font-medium">Opening Camera...</p>
                </div>
              )}
              {!g && !z && !G && (
                <div className="flex flex-col items-center justify-center p-6 text-center space-y-3.5 max-w-sm text-white">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center">
                    {_ ? <ShieldAlert size={26} /> : <Camera size={26} />}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {_ ? "Camera Access Blocked" : "Camera Ready to Open"}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                      {T || "Allow camera permission to photograph your car dashboard odometer."}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 w-full pt-1">
                    <button
                      type="button"
                      onClick={async () => {
                        const we = await requestCameraPermission();
                        if (we.granted) {
                          Te();
                        } else {
                          set_(true);
                          setT(we.error || "Permission was denied.");
                        }
                      }}
                      className="flex-1 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Camera size={14} />
                      <span>{_ ? "Grant Camera Permission" : "Open Camera"}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setR(!R)}
                      className="py-2.5 px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold transition flex items-center justify-center gap-1"
                    >
                      <CircleQuestionMark size={14} />
                      <span>{R ? "Hide Help" : "Help"}</span>
                    </button>
                  </div>
                </div>
              )}
              {b && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center z-30">
                  <LoaderCircle className="animate-spin text-white mb-2" size={36} />
                  <span className="text-xs font-bold text-white bg-indigo-600/90 px-3.5 py-1 rounded-full shadow-lg">
                    AI Reading Odometer...
                  </span>
                </div>
              )}
              {!b && g && _e && (
                <button
                  type="button"
                  onClick={ke}
                  className="absolute inset-0 bg-black/30 flex flex-col items-center justify-center z-30 hover:bg-black/40 transition"
                >
                  <div className="bg-white px-4 py-2 rounded-full shadow-xl flex items-center text-xs font-bold text-gray-800 hover:scale-105 transition">
                    <RefreshCcw size={14} className="mr-1.5 text-indigo-600" />
                    Retry Analysis
                  </div>
                </button>
              )}
            </div>
          )}
          {R && (
            <div className="bg-amber-50 border border-amber-200/90 rounded-2xl p-4 text-xs text-amber-950 space-y-2 animate-fade-in">
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <ShieldAlert size={15} className="text-amber-700" />
                <span>{en.title}</span>
              </div>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-amber-900/90 pl-1 leading-relaxed">
                {en.steps.map((we, Ie) => (
                  <li key={Ie}>{we}</li>
                ))}
              </ol>
              {Me && (
                <div className="mt-2 pt-2 border-t border-amber-200 text-[10.5px] text-amber-800">
                  <strong>Tip for Standalone Apps:</strong> If the live camera feed is blocked by
                  your OS, you can also use the <em>"Take Photo via System Camera"</em> button
                  below, which invokes your phone's native camera directly.
                </div>
              )}
            </div>
          )}
          <input
            id="scanner-camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={ye}
          />
          <input
            id="scanner-gallery-input"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={ye}
          />
          {!g && !Ze && (
            <div className="grid grid-cols-2 gap-2 text-xs">
              <label
                htmlFor="scanner-camera-input"
                className="cursor-pointer py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition text-center border border-gray-200"
              >
                <Camera size={14} className="text-indigo-600 shrink-0" />
                <span className="truncate">System Camera</span>
              </label>
              <label
                htmlFor="scanner-gallery-input"
                className="cursor-pointer py-2.5 px-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-semibold flex items-center justify-center gap-1.5 transition text-center border border-gray-200"
              >
                <Image_1 size={14} className="text-indigo-600 shrink-0" />
                <span className="truncate">Photo Gallery</span>
              </label>
            </div>
          )}
          {!g && !Ze && (
            <button
              type="button"
              onClick={ce}
              className="w-full py-2.5 flex items-center justify-center text-indigo-700 text-xs font-bold bg-indigo-50/80 hover:bg-indigo-100 border border-indigo-200/80 rounded-xl transition"
            >
              <Keyboard size={15} className="mr-1.5" />
              <span>Or Enter Odometer Reading Manually</span>
            </button>
          )}
          {(g || Ze) && (
            <div className="space-y-4 animate-fade-in pt-1">
              {mode === "end" && initialData && (
                <div className="bg-indigo-50/80 border border-indigo-100 rounded-xl p-3 text-xs">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-800 uppercase tracking-wide mb-1.5">
                    <Car size={12} />
                    <span>Trip Started Baseline</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[10px] text-indigo-400 block">Departure Time</span>
                      <span className="font-semibold text-indigo-950">
                        {new Date(initialData.start.timestamp).toLocaleTimeString(mt, {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-indigo-400 block">Start Odometer</span>
                      <span className="font-mono font-bold text-indigo-950">
                        {initialData.start.value.toLocaleString()} {distanceUnit}
                      </span>
                    </div>
                  </div>
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Vehicle
                </label>
                <div className="relative">
                  {dt ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={Je}
                        onChange={(we) => setJe(we.target.value)}
                        placeholder="Enter Registration"
                        className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none uppercase font-mono font-bold"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={Xe}
                        className="p-2 bg-indigo-100 text-indigo-600 rounded-xl"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDt(false)}
                        className="p-2 text-gray-400 border border-gray-200 rounded-xl"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <Car size={15} />
                      </div>
                      <select
                        value={ae}
                        onChange={$e}
                        className="w-full pl-9 pr-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-mono font-semibold text-gray-800"
                      >
                        <option value="">Select Vehicle...</option>
                        {vehicles.map((we) => (
                          <option key={we} value={we}>
                            {we}
                          </option>
                        ))}
                        <option value="__NEW__" className="font-semibold text-indigo-600">
                          + Add New Vehicle...
                        </option>
                      </select>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  {mode === "end"
                    ? `Dashboard Reading (${distanceUnit})`
                    : `Odometer Reading (${distanceUnit})`}
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={O}
                    onChange={(we) => {
                      setO(we.target.value);
                      set_e(null);
                    }}
                    placeholder={b ? "Analyzing..." : "Enter reading..."}
                    className={`w-full pl-4 pr-12 py-3 text-lg font-mono font-bold bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-900 ${b ? "animate-pulse" : ""}`}
                    autoFocus={Ze}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold uppercase">
                    {distanceUnit}
                  </div>
                </div>
                {me !== null && me > 0 && !_e && (
                  <p className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1 mt-1">
                    <CircleCheck size={12} />
                    <span>AI auto-detected from dashboard photo</span>
                  </p>
                )}
              </div>
              {!(title != null && title.includes("Calibration")) && (
                <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                  <button
                    type="button"
                    onClick={() => setSe("work")}
                    className={`flex items-center justify-center py-2 text-xs font-bold rounded-lg transition ${se === "work" ? "bg-white text-indigo-600 shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    <Briefcase size={14} className="mr-1.5" />
                    <span>Work</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSe("personal")}
                    className={`flex items-center justify-center py-2 text-xs font-bold rounded-lg transition ${se === "personal" ? "bg-white text-emerald-600 shadow-xs" : "text-gray-500 hover:text-gray-800"}`}
                  >
                    <User size={14} className="mr-1.5" />
                    <span>Personal</span>
                  </button>
                </div>
              )}
              {!(title != null && title.includes("Calibration")) && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-gray-700">
                    Client Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={te}
                    onChange={(we) => setTe(we.target.value)}
                    placeholder="Enter client name..."
                    className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-800"
                  />
                </div>
              )}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-gray-700">
                  {title != null && title.includes("Calibration")
                    ? "Calibration Notes"
                    : "Reason for Journey (ATO requirement)"}
                </label>
                <textarea
                  value={C}
                  onChange={(we) => setC(we.target.value)}
                  placeholder={
                    title != null && title.includes("Calibration")
                      ? "ATO Monthly Calibration & Cluster Sync"
                      : "e.g. Client meeting / Onsite consultation"
                  }
                  className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-800"
                  rows={2}
                />
              </div>
              {_e && (
                <div className="flex items-center text-red-600 text-xs font-medium bg-red-50 p-2.5 rounded-xl border border-red-200">
                  <CircleAlert size={15} className="mr-2 shrink-0 text-red-500" />
                  <span>{_e}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    Ge();
                    if (Ze) {
                      onCancel();
                    } else {
                      setG(null);
                      Te();
                    }
                  }}
                  disabled={b}
                  className="py-3 px-4 border border-gray-200 rounded-xl text-gray-700 font-bold hover:bg-gray-50 transition text-xs flex items-center justify-center gap-1.5"
                >
                  {Ze ? (
                    "Cancel"
                  ) : (
                    <>
                      <RotateCw size={14} /> Retake
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={Ye}
                  disabled={b && !O}
                  className="py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200 transition text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {b && !O && <LoaderCircle className="animate-spin" size={14} />}
                  <span>Confirm Reading</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
