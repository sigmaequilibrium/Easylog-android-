import { useEffect, useState } from "react";
import {
  Briefcase,
  Car,
  Check,
  CircleAlert,
  Gauge,
  LoaderCircle,
  MapPin,
  Navigation,
  Plus,
  RefreshCw,
  User,
  X,
} from "lucide-react";
import { playStartTone, vibrate } from "../services/deviceFeedback";
import { reverseGeocode } from "../services/geocoding";
import { isNearPlace, loadHomeWorkConfig } from "../services/homeWork";
import { getCurrentPosition } from "../services/location";

export const StartTripModal = ({
  isOpen,
  onClose,
  onStartGpsTrip,
  vehicles,
  onAddVehicle,
  lastKnownOdoForVehicle,
  distanceUnit,
}) => {
  const [f, setF] = useState("");
  const [x, setX] = useState("");
  const [y, setY] = useState("work");
  const [M, setM] = useState("");
  const [A, setA] = useState("");
  const [j, setJ] = useState(true);
  const [v, setV] = useState(null);
  const [F, setF_1] = useState(null);
  const [W, setW] = useState("");
  const [H, setH] = useState(false);
  const [q, setQ] = useState(false);
  const [K, setK] = useState("");
  const Le = (k = true) => {
    setJ(true);
    setF_1(null);
    getCurrentPosition(k)
      .then(async (C) => {
        const { latitude, longitude, accuracy } = C.coords;
        let se = "";
        try {
          se = await reverseGeocode(latitude, longitude);
        } catch {
          se = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
        }
        const oe = {
          latitude,
          longitude,
          accuracy,
          address: se || `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`,
          timestamp: new Date().toISOString(),
        };
        setV(oe);
        setJ(false);
        const ae = loadHomeWorkConfig();
        if (ae.autoDetectHomeAsPersonal && isNearPlace(oe, ae.home)) {
          setY("personal");
        } else if (ae.autoDetectWorkAsBusiness && isNearPlace(oe, ae.work)) {
          setY("work");
        }
      })
      .catch((C) => {
        console.warn("GPS location error:", C);
        const I = C?.message || "Unable to retrieve GPS coordinates.";
        setF_1(I);
        setJ(false);
        setV(
          (te) =>
            te || {
              latitude: 0,
              longitude: 0,
              accuracy: 100,
              address: "Current Location (Pending GPS lock)",
              timestamp: new Date().toISOString(),
            },
        );
      });
  };
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const k = vehicles.length > 0 ? vehicles[0] : "";
    setF(k);
    if (k) {
      const C = lastKnownOdoForVehicle(k);
      setX(C ? C.toString() : "0");
    } else {
      setX("0");
    }
    setM("");
    setA("");
    setH(false);
    Le(true);
  }, [isOpen, vehicles]);
  const me = (k) => {
    setF(k);
    const C = lastKnownOdoForVehicle(k);
    if (C !== null && C > 0) {
      setX(C.toString());
    }
  };
  const xe = () => {
    if (K.trim()) {
      const k = K.trim().toUpperCase();
      onAddVehicle(k);
      setF(k);
      setK("");
      setQ(false);
    }
  };
  const O = () => {
    const startOdo = parseInt(x, 10);
    if (isNaN(startOdo) || startOdo < 0) {
      alert("Please enter a valid starting odometer reading.");
      return;
    }
    const startLocation = {
      ...(v || {
        latitude: 0,
        longitude: 0,
        timestamp: new Date().toISOString(),
      }),
      address: W.trim() || v?.address || "Current Location",
    };
    playStartTone();
    vibrate("start");
    onStartGpsTrip({
      startOdo,
      vehicle: f,
      tripType: y,
      clientName: M.trim(),
      notes: A.trim(),
      startLocation,
    });
  };
  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shrink-0">
            <div className="flex items-center space-x-2">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
                <Navigation size={20} className="text-white animate-pulse" />
              </div>
              <div>
                <h2 className="text-lg font-bold">Start GPS Trip</h2>
                <p className="text-xs text-indigo-100">Live distance tracking</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-6 space-y-5 overflow-y-auto">
            <div className="p-3.5 rounded-xl border border-indigo-100 bg-indigo-50/60 space-y-2">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5 text-indigo-600 shrink-0">
                    {j ? (
                      <LoaderCircle size={18} className="animate-spin text-indigo-600" />
                    ) : (
                      <MapPin
                        size={18}
                        className={v?.latitude !== 0 ? "text-emerald-600" : "text-amber-500"}
                      />
                    )}
                  </div>
                  <div className="flex-1 text-xs">
                    <div className="font-semibold text-gray-800 flex items-center justify-between">
                      <span>GPS Coordinates</span>
                      {v?.accuracy && v.accuracy < 2000 && (
                        <span className="text-[10px] font-mono font-normal text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-100">
                          ±{Math.round(v.accuracy)}m accuracy
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mt-0.5 font-medium leading-snug">
                      {j
                        ? "Acquiring GPS coordinates..."
                        : v?.address ||
                          (v != null && v.latitude
                            ? `${v.latitude.toFixed(4)}°, ${v.longitude.toFixed(4)}°`
                            : "Location pending")}
                    </p>
                    {v && v.latitude !== 0 && (
                      <p className="text-[10px] font-mono text-gray-400 mt-0.5">
                        Lat: {v.latitude.toFixed(5)}, Lon: {v.longitude.toFixed(5)}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => Le(false)}
                  title="Retry GPS Fix"
                  className="p-1.5 text-indigo-600 hover:bg-white/80 rounded-lg border border-indigo-200 transition shrink-0 ml-1"
                >
                  <RefreshCw size={13} className={j ? "animate-spin" : ""} />
                </button>
              </div>
              {F && (
                <div className="bg-amber-100/70 border border-amber-200/90 rounded-lg p-2 text-[10.5px] text-amber-900 space-y-1">
                  <div className="flex items-center space-x-1 font-semibold">
                    <CircleAlert size={12} className="text-amber-700 shrink-0" />
                    <span>GPS Notice: {F}</span>
                  </div>
                  <p className="text-gray-600 leading-tight">
                    Ensure phone Location is turned on and your browser or app has permission. You
                    can still tap Start below — GPS will automatically lock once movement begins.
                  </p>
                  {!H && (
                    <button
                      type="button"
                      onClick={() => setH(true)}
                      className="text-indigo-700 font-bold underline text-[10.5px]"
                    >
                      Specify start address manually
                    </button>
                  )}
                </div>
              )}
              {H && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="e.g. 123 Main St, Sydney"
                    value={W}
                    onChange={(k) => setW(k.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-indigo-200 rounded-lg focus:ring-1 focus:ring-indigo-500 outline-none"
                  />
                </div>
              )}
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center">
                  <Car size={14} className="mr-1.5 text-indigo-600" />
                  Vehicle
                </label>
                {!q && (
                  <button
                    type="button"
                    onClick={() => setQ(true)}
                    className="text-xs text-indigo-600 font-semibold hover:underline flex items-center"
                  >
                    <Plus size={12} className="mr-0.5" /> Add
                  </button>
                )}
              </div>
              {q ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. ABC-123"
                    value={K}
                    onChange={(k) => setK(k.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-indigo-300 rounded-xl uppercase font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={xe}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700"
                  >
                    <Check size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setQ(false)}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <select
                  value={f}
                  onChange={(k) => me(k.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl text-gray-800 font-mono font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {vehicles.length === 0 ? (
                    <option value="">No vehicles configured</option>
                  ) : (
                    vehicles.map((k) => (
                      <option key={k} value={k}>
                        {k}
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
            <div>
              <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center mb-1.5">
                <Gauge size={14} className="mr-1.5 text-indigo-600" />
                Starting Odometer ({distanceUnit})
              </label>
              <input
                type="number"
                value={x}
                onChange={(k) => setX(k.target.value)}
                placeholder="0"
                className="w-full px-3 py-2.5 text-base font-mono font-bold bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
              />
              <p className="text-[10px] text-gray-400 mt-1">
                Automatically populated from your last completed trip for this vehicle.
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
                  Trip Purpose
                </label>
                {v && isNearPlace(v, loadHomeWorkConfig().home) && (
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    🏠 At Home (ATO Commute: Personal)
                  </span>
                )}
              </div>
              <div className="grid grid-cols-2 gap-2 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setY("work")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${y === "work" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                >
                  <Briefcase size={14} className="mr-1.5" />
                  Business / Work
                </button>
                <button
                  type="button"
                  onClick={() => setY("personal")}
                  className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center ${y === "personal" ? "bg-white text-green-700 shadow-sm" : "text-gray-500 hover:text-gray-800"}`}
                >
                  <User size={14} className="mr-1.5" />
                  Personal
                </button>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Client / Destination Name (optional)
                </label>
                <input
                  type="text"
                  value={M}
                  onChange={(k) => setM(k.target.value)}
                  placeholder="e.g. Acme Corp / Airport"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 mb-1 block">
                  Trip Notes / Reason (optional)
                </label>
                <input
                  type="text"
                  value={A}
                  onChange={(k) => setA(k.target.value)}
                  placeholder="e.g. Client consultation & site survey"
                  className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-2 shrink-0">
            <button
              type="button"
              onClick={O}
              className="w-full py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition flex items-center justify-center space-x-2"
            >
              <Navigation size={18} />
              <span>Start Live GPS Tracking</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 text-xs text-gray-500 font-semibold hover:text-gray-700 text-center"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
