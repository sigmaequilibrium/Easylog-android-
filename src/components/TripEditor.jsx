import { useEffect, useRef, useState } from "react";
import {
  Briefcase,
  Car,
  Check,
  CircleAlert,
  FileText,
  Hash,
  Image as Image_1,
  Lock,
  Save,
  Sparkles,
  Trash2,
  User,
  X,
} from "lucide-react";
import { predictTripTag } from "../services/tripPrediction";
import { compressTripPhoto } from "../utils/image";

export const TripEditor = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTrip,
  vehicles = [],
  distanceUnit = "km",
  allTrips = [],
}) => {
  const [m, setM] = useState("");
  const [b, setB] = useState("");
  const [g, setG] = useState("");
  const [z, setZ] = useState(undefined);
  const [G, setG_1] = useState("");
  const [_, set_] = useState("");
  const [T, setT] = useState(undefined);
  const [R, setR] = useState("");
  const [Z, setZ_1] = useState("work");
  const [U, setU] = useState("");
  const [S, setS] = useState("");
  const [ue, setUe] = useState("");
  const [me, setMe] = useState(true);
  const [O, setO] = useState(null);
  const [C, setC] = useState(null);
  const [te, setTe] = useState(false);
  const [se, setSe] = useState(false);
  const aeRef = useRef(null);
  const beRef = useRef(null);
  const [_e, set_e] = useState(false);
  const [Ze, setZe] = useState("");
  const [ze, setZe_1] = useState(null);
  useEffect(() => {
    if (isOpen) {
      if (initialTrip) {
        setM(initialTrip.clientName || "");
        setB(initialTrip.start.value.toString());
        setG(Je(initialTrip.start.timestamp));
        setZ(initialTrip.start.imageUrl);
        setG_1(initialTrip.end?.value.toString() || "");
        set_(initialTrip.end ? Je(initialTrip.end.timestamp) : Je(new Date().toISOString()));
        setT(initialTrip.end?.imageUrl);
        setR(initialTrip.notes || "");
        setZ_1(initialTrip.tripType || "work");
        setU(initialTrip.registrationNumber || "");
        setS(initialTrip.startLocation?.address || initialTrip.start?.location?.address || "");
        setUe(initialTrip.endLocation?.address || initialTrip.end?.location?.address || "");
        setMe(initialTrip.verificationStatus !== "pending");
      } else {
        setM("");
        setB("");
        setG(Je(new Date().toISOString()));
        setZ(undefined);
        setG_1("");
        set_(Je(new Date().toISOString()));
        setT(undefined);
        setR("");
        setZ_1("work");
        setU(vehicles.length === 1 ? vehicles[0] : "");
        setS("");
        setUe("");
        setMe(true);
      }
      setO(null);
      set_e(false);
      setZe("");
      setZe_1(null);
      setC(null);
      setSe(false);
    }
  }, [isOpen, initialTrip, vehicles]);
  const dt = async () => {
    setTe(true);
    setSe(false);
    try {
      const P = parseInt(b, 10);
      const de = G ? parseInt(G, 10) : undefined;
      const ye = de && P && de >= P ? de - P : initialTrip?.distance || 0;
      const ke = await predictTripTag(
        {
          startAddress: initialTrip?.startLocation?.address,
          endAddress: initialTrip?.endLocation?.address,
          distance: ye,
          startTime: g ? new Date(g).toISOString() : new Date().toISOString(),
          vehicle: U,
          notes: R,
        },
        allTrips,
      );
      setC(ke);
    } catch (error) {
      console.error("Prediction error in TripEditor", error);
    } finally {
      setTe(false);
    }
  };
  const ft = () => {
    if (C) {
      if (C.predictedTripType) {
        setZ_1(C.predictedTripType);
      }
      if (C.predictedClient) {
        setM(C.predictedClient);
      }
      if (C.predictedReason && !R) {
        setR(C.predictedReason);
      }
      setSe(true);
    }
  };
  const Je = (le) => {
    try {
      const Be = new Date(le);
      const P = Be.getTimezoneOffset() * 60000;
      return new Date(Be.getTime() - P).toISOString().slice(0, 16);
    } catch {
      return "";
    }
  };
  const vt = async (le, Be) => {
    const P = le.target.files?.[0];
    if (P) {
      try {
        const ye = await compressTripPhoto(P);
        if (Be) {
          setZ(ye);
        } else {
          setT(ye);
        }
      } catch {
        alert("Failed to process image");
      }
    }
    le.target.value = "";
  };
  const mt = () => {
    setO(null);
    const le = parseInt(b);
    const Be = G ? parseInt(G) : undefined;
    if (isNaN(le)) {
      setO("Start odometer value is required.");
      return;
    }
    if (Be !== undefined && Be < le) {
      setO("End odometer cannot be less than start odometer.");
      return;
    }
    const timestamp = g ? new Date(g).toISOString() : new Date().toISOString();
    const de = _ ? new Date(_).toISOString() : undefined;
    const startLocation = S.trim()
      ? {
          ...(initialTrip?.startLocation ||
            initialTrip?.start?.location || {
              latitude: 0,
              longitude: 0,
            }),
          address: S.trim(),
          timestamp,
        }
      : initialTrip?.startLocation;
    const endLocation = ue.trim()
      ? {
          ...(initialTrip?.endLocation ||
            initialTrip?.end?.location || {
              latitude: 0,
              longitude: 0,
            }),
          address: ue.trim(),
          timestamp: de || new Date().toISOString(),
        }
      : initialTrip?.endLocation;
    const ce = {
      id: initialTrip?.id || crypto.randomUUID(),
      status: Be ? "completed" : "active",
      verificationStatus: Be ? (me ? "verified" : "pending") : undefined,
      start: {
        value: le,
        timestamp,
        imageUrl: z,
        location: startLocation || initialTrip?.start?.location,
      },
      end: Be
        ? {
            value: Be,
            timestamp: de || new Date().toISOString(),
            imageUrl: T,
            location: endLocation || initialTrip?.end?.location,
          }
        : undefined,
      distance: Be ? Be - le : undefined,
      clientName: m,
      notes: R,
      tripType: Z,
      registrationNumber: U,
      trackingMode: initialTrip?.trackingMode,
      startLocation,
      endLocation,
      routeCoordinates: initialTrip?.routeCoordinates,
      triggerSource: initialTrip?.triggerSource,
    };
    onSave(ce);
    onClose();
  };
  const Me = () => {
    set_e(true);
    setZe("");
    setZe_1(null);
  };
  const Ge = () => {
    if (Ze === "0000") {
      if (initialTrip) {
        onDelete(initialTrip.id);
        onClose();
      }
    } else {
      setZe_1("Incorrect PIN");
    }
  };
  const Te = () => {
    set_e(false);
    setZe("");
    setZe_1(null);
  };
  if (isOpen) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h2 className="text-xl font-bold text-gray-800">
              {initialTrip ? "Edit Trip" : "Add Manual Trip"}
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={24} />
            </button>
          </div>
          <div className="p-6 overflow-y-auto space-y-5">
            {O && (
              <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                <CircleAlert size={16} className="mr-2" />
                {O}
              </div>
            )}
            <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-blue-50 border border-indigo-100 rounded-xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
                  <Sparkles
                    size={14}
                    className="text-indigo-600 animate-spin"
                    style={{
                      animationDuration: "6s",
                    }}
                  />
                  <span>AI Predictive Tagging</span>
                </div>
                <button
                  type="button"
                  onClick={dt}
                  disabled={te || _e}
                  className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold rounded-lg shadow-xs flex items-center space-x-1 transition"
                >
                  <Sparkles size={12} />
                  <span>{te ? "Analyzing..." : "Predict Tags"}</span>
                </button>
              </div>
              {C && (
                <div className="mt-2 pt-2 border-t border-indigo-200/60 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-700">
                      Suggested:{" "}
                      <span
                        className={
                          C.predictedTripType === "work"
                            ? "text-indigo-700 font-bold"
                            : "text-emerald-700 font-bold"
                        }
                      >
                        {C.predictedTripType.toUpperCase()}
                      </span>
                      {C.predictedClient ? ` • ${C.predictedClient}` : ""}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700">
                      {C.confidence}% confidence
                    </span>
                  </div>
                  <p className="text-gray-500 text-[11px] italic">
                    "{C.explanation || C.predictedReason}"
                  </p>
                  <div className="pt-1 flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={ft}
                      disabled={se}
                      className="w-full py-1.5 bg-white border border-indigo-300 hover:border-indigo-400 text-indigo-700 font-semibold rounded-lg shadow-xs flex items-center justify-center space-x-1.5 transition text-xs"
                    >
                      {se ? (
                        <>
                          <Check size={13} className="text-emerald-600" />
                          <span>Applied!</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={13} className="text-indigo-600" />
                          <span>Apply Suggestion</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700">Trip Type</label>
              <div className="grid grid-cols-2 gap-3 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setZ_1("work")}
                  disabled={_e}
                  className={`flex items-center justify-center py-2 text-sm font-medium rounded-md transition ${Z === "work" ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <Briefcase size={16} className="mr-2" />
                  Work
                </button>
                <button
                  onClick={() => setZ_1("personal")}
                  disabled={_e}
                  className={`flex items-center justify-center py-2 text-sm font-medium rounded-md transition ${Z === "personal" ? "bg-white text-green-600 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <User size={16} className="mr-2" />
                  Personal
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Car size={14} className="mr-1.5 text-gray-400" />
                Vehicle
              </label>
              <select
                value={U}
                onChange={(le) => setU(le.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                disabled={_e}
              >
                <option value="">Select Vehicle...</option>
                {vehicles.map((le) => (
                  <option key={le} value={le}>
                    {le}
                  </option>
                ))}
                {vehicles.length === 0 && (
                  <option value="" disabled>
                    Add vehicles in Settings
                  </option>
                )}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <Briefcase size={14} className="mr-1.5 text-gray-400" />
                Client Name
              </label>
              <input
                type="text"
                value={m}
                onChange={(le) => setM(le.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                disabled={_e}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Hash size={14} className="mr-1.5 text-gray-400" />
                  Start Odo ({distanceUnit})
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={b}
                    onChange={(le) => setB(le.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    disabled={_e}
                  />
                  <button
                    onClick={() => aeRef.current?.click()}
                    disabled={_e}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center shrink-0 w-12"
                    title="Add Photo"
                  >
                    {z ? (
                      <img src={z} alt="Start" className="w-8 h-8 object-cover rounded" />
                    ) : (
                      <Image_1 size={20} className="text-gray-400" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={aeRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(le) => vt(le, true)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">Start Time</label>
                <input
                  type="datetime-local"
                  value={g}
                  onChange={(le) => setG(le.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  disabled={_e}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700 flex items-center">
                  <Hash size={14} className="mr-1.5 text-gray-400" />
                  End Odo ({distanceUnit})
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={G}
                    onChange={(le) => setG_1(le.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono"
                    disabled={_e}
                  />
                  <button
                    onClick={() => beRef.current?.click()}
                    disabled={_e}
                    className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center justify-center shrink-0 w-12"
                    title="Add Photo"
                  >
                    {T ? (
                      <img src={T} alt="End" className="w-8 h-8 object-cover rounded" />
                    ) : (
                      <Image_1 size={20} className="text-gray-400" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={beRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(le) => vt(le, false)}
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-gray-700">End Time</label>
                <input
                  type="datetime-local"
                  value={_}
                  onChange={(le) => set_(le.target.value)}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  disabled={_e}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-semibold text-gray-700 flex items-center">
                <FileText size={14} className="mr-1.5 text-gray-400" />
                Reason for Journey{" "}
                <span className="text-xs font-normal text-gray-500 ml-1">(Required for ATO)</span>
              </label>
              <textarea
                value={R}
                onChange={(le) => setR(le.target.value)}
                rows={3}
                placeholder="e.g. Client Meeting with XYZ, Site Inspection, Stock Pickup"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                disabled={_e}
              />
            </div>
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 flex items-start space-x-3">
              <input
                type="checkbox"
                id="isCommitted"
                checked={me}
                onChange={(le) => setMe(le.target.checked)}
                className="mt-0.5 h-4 w-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 cursor-pointer"
              />
              <label
                htmlFor="isCommitted"
                className="text-xs text-gray-700 cursor-pointer select-none"
              >
                <span className="font-semibold block text-gray-900">
                  {me
                    ? "✓ Verified & Committed to Official Logbook"
                    : "⏳ Keep in Verification Queue"}
                </span>
                <span className="text-gray-500 text-[11px] block mt-0.5">
                  {me
                    ? "This trip is verified and committed to your final record."
                    : "Trip will remain in the verification queue so you can review details before committing."}
                </span>
              </label>
            </div>
          </div>
          <div
            className={`px-6 py-4 border-t border-gray-100 transition-colors duration-300 ${_e ? "bg-red-50" : "bg-gray-50"}`}
          >
            {_e ? (
              <div className="flex flex-col space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-red-700 font-semibold text-sm">
                    <Lock size={16} className="mr-2" />
                    Security Check
                  </div>
                  {ze && (
                    <span className="text-xs text-red-600 font-bold bg-red-100 px-2 py-0.5 rounded animate-pulse">
                      {ze}
                    </span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative grow w-full sm:w-auto">
                    <input
                      type="password"
                      value={Ze}
                      onChange={(le) => setZe(le.target.value)}
                      placeholder="PIN: 0000"
                      className="w-full px-3 py-2 text-sm border border-red-200 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={Ge}
                      className="flex-1 sm:flex-none px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 shadow-sm whitespace-nowrap"
                    >
                      Confirm Delete
                    </button>
                    <button
                      onClick={Te}
                      className="flex-1 sm:flex-none px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex justify-between items-center">
                {initialTrip ? (
                  <button
                    onClick={Me}
                    className="text-red-500 hover:text-red-700 flex items-center px-3 py-2 rounded hover:bg-red-50 transition"
                    title="Delete Trip"
                  >
                    <Trash2 size={18} className="mr-2" />
                    Delete
                  </button>
                ) : (
                  <div />
                )}
                <div className="flex space-x-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-gray-600 hover:bg-gray-200 rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={mt}
                    className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 shadow-md transition flex items-center"
                  >
                    <Save size={18} className="mr-2" />
                    Save Trip
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};
